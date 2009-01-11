JazzRecord.Model.prototype.query = function(options) {
  if(!JazzRecord.isDefined(options))
    options = {};
  // run query on SQLite
  // bail if beyond recursion depth
  if(!JazzRecord.isDefined(options.depth))
    options.depth = JazzRecord.depth;
    
  var remainingDepth = options.depth - 1;
  if(remainingDepth < 0)
    remainingDepth = 0;
    
  var mainSql = this.sql;
  
  var data = JazzRecord.adapter.run(mainSql);
  
  if(!data || data.length === 0) {
    if(this.sql.indexOf("LIMIT") > -1)
      return null;
    else
      return [];
  }
  
  var records = [];
  
  JazzRecord.each(data, function(rowData) {
    var recordOptions = {
      model: this,
      columns: this.options.columns,
      data: rowData
    };

    JazzRecord.each(this.options.events, function(eventHandler, eventName) {
      recordOptions[eventName] = eventHandler;
    });
    
    var record = new JazzRecord.Record(recordOptions);
    
    JazzRecord.each(this.options.hasOne, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var foreignKey = this.options.foreignKey;
      var loadHasOne = function(depth) {
        return assocModel.findBy(foreignKey, rowData.id, depth);
      };
      if(options.depth < 1)
        record[assoc] = new JazzRecord.AssociationLoader(loadHasOne);
      else {
        record[assoc] = loadHasOne(remainingDepth);
        if(record[assoc])
          record[assoc + "OriginalRecordID"] = record[assoc].id;
      }
    }, this);
    
    JazzRecord.each(this.options.hasMany, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var foreignKey = this.options.foreignKey;
      var loadHasMany = function(depth) {
        return assocModel.findAllBy(foreignKey, rowData.id, depth);
      };
      if(options.depth < 1)
        record[assoc] = new JazzRecord.AssociationLoader(loadHasMany);
      else {
        record[assoc] = loadHasMany(remainingDepth);
        record[assoc + "OriginalRecordIDs"] = record[assoc].map(function(rec) {
          return rec.id;
        });
      }
    }, this);
    
    JazzRecord.each(this.options.belongsTo, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      if(record[assocIdCol]) {
        var loadBelongsTo = function(depth) {
          return assocModel.first({id: record[assocIdCol], depth: depth});
        };
        if(options.depth < 1)
          record[assoc] = new JazzRecord.AssociationLoader(loadBelongsTo);
        else
          record[assoc] = loadBelongsTo(remainingDepth);
      }
      else
        record[assoc] = null;
    });
    
    JazzRecord.each(this.options.hasAndBelongsToMany, function(assocTable, assoc) {
      var context = this;
      var mappingTable = [this.table, assocTable].sort().toString().replace(",", "_");
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      if(assocIdCol) {
        var loadHasAndBelongsToMany = function(depth) {
          var sql = "SELECT * FROM " + mappingTable + " WHERE " + context.options.foreignKey + "=" + record.id;
          // setup temporary array of mapping records
          var mappingRecords = JazzRecord.adapter.run(sql);
          var assocRecords = [];
          JazzRecord.each(mappingRecords, function(mappingRecord) {
            assocRecords.push(assocModel.first({id: mappingRecord[assocIdCol], depth: depth}));
          }, context);
          return assocRecords;
        };
        if(options.depth < 1)
          record[assoc] = new JazzRecord.AssociationLoader(loadHasAndBelongsToMany);
        else {
          record[assoc] = loadHasAndBelongsToMany(remainingDepth);
          record[assoc + "OriginalRecordIDs"] = record[assoc].map(function(rec) {
            return rec.id;
          });
        }
      }
    }, this);
    
    // implement eager/lazy loading for associations
    
    records.push(record);
  }, this);
  
  if(mainSql.indexOf("LIMIT 1") > -1)
    return records[0];
  else
    return records;
};