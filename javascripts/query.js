JazzRecord.Model.implement({
  query: function(options) {
    if(!$defined(options))
      options = {};
    // run query on SQLite
    // bail if beyond recursion depth
    if(!$defined(options.depth))
      options.depth = JazzRecord.depth;
      
    var remainingDepth = options.depth - 1;
    if(remainingDepth < 0)
      remainingDepth = 0;
      
    var mainSql = this.sql;
    
    var data = JazzRecord.adapter.run(mainSql);
    
    if(!data || data.length === 0) {
      if(this.sql.contains("LIMIT"))
        return null;
      else
        return data;
    }
    
    var records = [];
    
    $each(data, function(rowData) {
      var recordOptions = {
        model: this,
        columns: this.options.columns,
        data: rowData
      };

      $each(this.options.events, function(eventHandler, eventName) {
        recordOptions[eventName] = eventHandler;
      });
      
      var record = new JazzRecord.Record(recordOptions);
      
      $each(this.options.hasOne, function(assocTable, assoc) {
        var assocModel = JazzRecord.models.get(assocTable);
        var foreignKey = this.options.foreignKey;
        var loadHasOne = function(depth) {
          return assocModel.findBy(foreignKey, rowData.id, depth);
        };
        if(options.depth < 1)
          record[assoc] = new AssociationLoader(loadHasOne);
        else
          record[assoc] = loadHasOne(remainingDepth);
      }, this);
      
      $each(this.options.hasMany, function(assocTable, assoc) {
        var assocModel = JazzRecord.models.get(assocTable);
        var foreignKey = this.options.foreignKey;
        var loadHasMany = function(depth) {
          return assocModel.findAllBy(foreignKey, rowData.id, depth);
        };
        if(options.depth < 1)
          record[assoc] = new AssociationLoader(loadHasMany);
        else
          record[assoc] = loadHasMany(remainingDepth);
      }, this);
      
      $each(this.options.belongsTo, function(assocTable, assoc) {
        var assocModel = JazzRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        if(record[assocIdCol]) {
          var loadBelongsTo = function(depth) {
            return assocModel.first({id: record[assocIdCol], depth: depth});
          };
          if(options.depth < 1)
            record[assoc] = new AssociationLoader(loadBelongsTo);
          else
            record[assoc] = loadBelongsTo(remainingDepth);
        }
      });
      
      $each(this.options.hasAndBelongsToMany, function(assocTable, assoc) {
        var mappingTable = [this.table, assocTable].sort().toString().replace(",", "_");
        var sql = "SELECT * FROM " + mappingTable + " WHERE " + this.options.foreignKey + " = " + record.id;
        record[assoc] = JazzRecord.adapter.run(sql);
        var assocModel = JazzRecord.models.get(assocTable);
        var assocIdCol = assocModel.options.foreignKey;
        if(assocIdCol) {
          var loadHasAndBelongsToMany = function(depth) {
            return assocModel.find({id: record[assoc][assocIdCol], depth: depth});
          };
          if(options.depth < 1)
            record[assoc] = new AssociationLoader(loadHasAndBelongsToMany);
          else
            record[assoc] = loadHasAndBelongsToMany(remainingDepth);
        }
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