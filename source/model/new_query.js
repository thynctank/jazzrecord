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
  var queryQueue = [];
  
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
      if(options.depth < 1) {
        record[assoc] = new JazzRecord.AssociationLoader(function(depth) {
          return assocModel.findBy(foreignKey, record.id, depth);
        });
      }
      else {
        var sql = "SELECT * FROM " + assocTable + " WHERE " + foreignKey + "=" + record.id + " LIMIT 1";
        var originalDataSuffix = "OriginalRecordID";
        queryQueue.push({record: record, depth: remainingDepth, assoc: assoc, sql: sql, model: assocModel, originalDataSuffix: originalDataSuffix});
      }
    }, this);
    
    JazzRecord.each(this.options.hasMany, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var foreignKey = this.options.foreignKey;
      if(options.depth < 1) {
        record[assoc] = new JazzRecord.AssociationLoader(function(depth) {
          return assocModel.findAllBy(foreignKey, rowData.id, depth);
        });
      }
      else {
        var sql = "SELECT * FROM " + assocTable + " WHERE " + foreignKey + "=" + record.id;
        var originalDataSuffix = "OriginalRecordIDs";
        queryQueue.push({record: record, depth: remainingDepth, assoc: assoc, sql: sql, model: assocModel, originalDataSuffix: originalDataSuffix});
      }
    }, this);
    
    JazzRecord.each(this.options.belongsTo, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      if(record[assocIdCol]) {
        if(options.depth < 1) {
          record[assoc] = new JazzRecord.AssociationLoader(function(depth) {
            return assocModel.first({id: record[assocIdCol], depth: depth});
          });
        }
        else {
          var sql = "SELECT * FROM " + assocTable + " WHERE id=" + record[assocIdCol] + " LIMIT 1";
          queryQueue.push({record: record, depth: remainingDepth, assoc: assoc, sql: sql, model: assocModel});
        }
      }
      else
        record[assoc] = null;
    });
    
    // SELECT assocTable.* FROM mappingTable INNER JOIN assocTable ON mappingTable.assocIdCol = assocTable.id
    JazzRecord.each(this.options.hasAndBelongsToMany, function(assocTable, assoc) {
      var context = this;
      var mappingTable = [this.table, assocTable].sort().toString().replace(",", "_");
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      if(assocIdCol) {
        var loadHasAndBelongsToMany = function(depth) {
          var sql = "SELECT " + assocTable + ".* FROM " + mappingTable + " INNER JOIN " + assocTable + " ON " + mappingTable + "." + assocIdCol + "=" + assocTable + ".id WHERE " + mappingTable + "." + context.options.foreignKey + "=" + record.id;
          var assocData = JazzRecord.adapter.run(sql);
          var assocRecords = [];
          JazzRecord.each(assocData, function(rowData) {
            var recordOptions = {
              model: assocModel,
              columns: assocModel.options.columns,
              data: rowData
            };

            JazzRecord.each(assocModel.options.events, function(eventHandler, eventName) {
              recordOptions[eventName] = eventHandler;
            });
            
            var assocRecord = new JazzRecord.Record(recordOptions);
            assocRecords.push(assocRecord);
          });
          return assocRecords;
        };
        if(options.depth < 1)
          record[assoc] = new JazzRecord.AssociationLoader(loadHasAndBelongsToMany);
        else {
          record[assoc] = loadHasAndBelongsToMany(remainingDepth);
          var currentOriginalRecordIDs = [];
          JazzRecord.each(record[assoc], function(rec) {
            currentOriginalRecordIDs.push(rec.id);
          });
          record[assoc + "OriginalRecordIDs"] = currentOriginalRecordIDs;
        }
      }
    }, this);
    
    records.push(record);
  }, this);
  
  // process queryQueue synchronously
  JazzRecord.each(queryQueue, function(queueItem) {
    queueItem.model.sql = queueItem.sql;
    queueItem.record[queueItem.assoc] = queueItem.model.query({depth: queueItem.depth});
    if(queueItem.record[queueItem.assoc]) {
      var originalData = null;
      if(queueItem.originalDataSuffix) {
        switch(queueItem.originalDataSuffix) {
          case "OriginalRecordID":
            originalData = queueItem.record[queueItem.assoc].id;
            break;
          case "OriginalRecordIDs":
            originalData = [];
            JazzRecord.each(queueItem.record[queueItem.assoc], function(rec) {
              originalData.push(rec.id);
            });
            break;
        }
        queueItem.record[queueItem.assoc + queueItem.originalDataSuffix] = originalData;
      }
    }
  }, this);

  if(mainSql.indexOf("LIMIT 1") > -1)
    return records[0];
  else
    return records;
};