ThyncRecord.Model.implement({
  query: function(options) {
    if(!$defined(options))
      options = {};
    // run query on SQLite
    // bail if beyond recursion depth
    if(!$defined(options.depth))
      options.depth = ThyncRecord.depth;
    if(options.depth < 1)
      return;
      
    var remainingDepth = options.depth - 1;
      
    var mainSql = this.sql;
    
    var data = ThyncRecord.adapter.run(mainSql);
    
    if(!data || data.length == 0) {
      puts("Found Nothing");
      return;
    }
    
    var records = [];
    
    $each(data, function(rowData) {
      var errors = {};
      var record = new ThyncRecord.Record({
        model: this,
        columns: this.options.columns,
        data: rowData,
        errors: errors
      });
      
      $each(this.options.hasOne, function(assocTable, assoc) {
        var assocModel = ThyncRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        if(record[assocIdCol])
          record[assoc] = assocModel.first({id: record[assocIdCol], depth: remainingDepth});
      });
      
      $each(this.options.hasMany, function(assocTable, assoc) {
        var assocModel = ThyncRecord.models.get(assocTable);
        record[assoc] = assocModel.findAllBy(this.options.foreignKey, rowData.id, remainingDepth);
      }, this);
      
      $each(this.options.belongsTo, function(assocTable, assoc) {
        var assocModel = ThyncRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        if(record[assocIdCol])
          record[assoc] = assocModel.first({id: record[assocIdCol], depth: remainingDepth});
      });
      
      $each(this.options.hasAndBelongsToMany, function(assocTable, assoc) {
        var mappingTable = [this.table, assocTable].sort().toString().replace(",", "_");
        var sql = "SELECT * FROM " + mappingTable + " WHERE " + this.options.foreignKey + " = " + record.id;
        record[assoc] = ThyncRecord.adapter.run(sql);
        var assocModel = ThyncRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        if(assocIdCol)
          record[assoc] = assocModel.find({id: record[assoc][assocIdCol], depth: remainingDepth});
      }, this);
      
      // implement eager/lazy loading for associations
      
      records.push(record);
    }, this);
    
    if(mainSql.contains("LIMIT 1"))
      return records[0];
    else
      return records;
  }
});