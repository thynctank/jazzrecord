ThyncRecord.Model.implement({
  query: function(options) {
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite
    // bail if beyond recursion depth
    if(!options.depth)
      options.depth = ThyncRecord.depth;
    if(options.depth < ThyncRecord.depth)
      return;
    
    var data = ThyncRecord.adapter.run(this.sql);
    
    if(!data || data.length == 0) {
      puts("Found Nothing");
      return;
    }
    
    if(this.sql.contains("LIMIT 1")) {
      data = data[0];
      
      // implement eager/lazy loading for associations
      
      var errors = {};
      var record = new ThyncRecord.Record({
        model: this,
        columns: this.options.columns,
        data: data,
        errors: errors
      });
      
      $each(this.options.hasOne, function(table, assoc) {
        var foreignId = data[assoc + "_id"];
        if(foreignId)
          record[assoc] = ThyncRecord.models.get(table).find(foreignId);
      });
      
      $each(this.options.hasMany, function(table, assoc) {
        record[assoc] = ThyncRecord.models.get(table).findAllBy(this.options.foreignKey, data.id);
      }, this);
      
      $each(this.options.belongsTo, function(table, assoc) {
        var foreignId = data[assoc + "_id"];
        if(foreignId)
          record[assoc] = ThyncRecord.models.get(table).find(foreignId);
      });
      
      $each(this.options.hasAndBelongsToMany, function(assocTable, assoc) {
        var mappingTable = [this.table, assocTable].sort().toString().replace(",", "_");
        var sql = "SELECT * FROM " + mappingTable + " WHERE " + this.options.foreignKey + " = " + record.id;
        record[assoc] = ThyncRecord.adapter.run(sql);
        var assocModel = ThyncRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        $each(record[assoc], function(mappingRow) {
          record[assoc] = assocModel.find(mappingRow[assocIdCol], {depth: options.depth - 1});
        });
      }, this);
      
      return record;
    }
    else {
      var records = [];
      $each(data, function(row) {
        records.push(new ThyncRecord.Record({
          model: this,
          columns: this.options.columns,
          data: row,
          errors: {}
        }));
      }, this);
      return records;
    }
  }
});