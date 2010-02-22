JazzRecord.Record.prototype.save = function() {
  var foreignKey = this.options.model.options.foreignKey;

  // if record has originalData, check for isChanged, else use this
  if(!this.originalData) {
    JazzRecord.each(this.options.model.options.belongsTo, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var assocModelKey = assocModel.options.foreignKey;
      
      if(this[assoc]) {
        if(this[assoc].unloaded)
          this.load(assoc);
      }
      
      if(this[assoc] && this[assoc].id)
        this[assocModelKey] = this[assoc].id;
    }, this);
  }

  JazzRecord.each(this.options.model.options.hasOne, function(assocTable, assoc) {
    // remove original association and replace w/ new one
    if(this[assoc]) {
      // if unloaded (perhaps due to depth loading?) try loading. If empty after load, bail
      if(this[assoc].unloaded) {
        this.load(assoc);
        if(!this[assoc])
          return;
      }

      if(!JazzRecord.isDefined(this[assoc + "OriginalRecordID"]))
        this[assoc].updateAttribute(foreignKey, this.id);
      else if(this[assoc + "OriginalRecordID"] !== this[assoc].id) {
        var assocModel = JazzRecord.models.get(assocTable);
        var oldRecord = assocModel.first({id: this[assoc + "OriginalRecordID"], depth:0});
        oldRecord.updateAttribute(foreignKey, null);
      }
      this[assoc].updateAttribute(foreignKey, this.id);
      this[assoc + "OriginalRecordID"] = this[assoc].id;
    }
    else {
      if(this[assoc + "OriginalRecordID"]) {
        var assocModel = JazzRecord.models.get(assocTable);
        var oldRecord = assocModel.first({id: this[assoc + "OriginalRecordID"], depth:0});
        oldRecord.updateAttribute(foreignKey, null);
      }
    }
  }, this);

  JazzRecord.each(this.options.model.options.hasMany, function(assocTable, assoc) {
    if(this[assoc]) {
      if(this[assoc].length) {
        var assocModel = JazzRecord.models.get(assocTable);
      
        var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
      
        // save all still-assigned records
        JazzRecord.each(this[assoc], function(record, index) {
          if(record) {
            record[foreignKey] = this.id;
            record.save();
            if(JazzRecord.arrayContainsVal(originalRecordIDs, record.id))
              JazzRecord.removeFromArray(originalRecordIDs, record.id);
          }
        }, this);
        
        //remove undefined/null records from array going forward
        JazzRecord.each(this[assoc], function(record, index) {
          if(!JazzRecord.isDefined(record))
            this[assoc].splice(index, 1);
        }, this);
      
        // remove association from no longer-assigned records
        JazzRecord.each(originalRecordIDs, function(id) {
          var existingRecord = assocModel.find(id);
          if(existingRecord)
            existingRecord.updateAttribute(foreignKey, null);
        });
      
        // remap originalRecordIDs for new set
        var currentOriginalRecordIDs = [];
        JazzRecord.each(this[assoc], function(record) {
          if(record)
            currentOriginalRecordIDs.push(record.id);
        });
        this[assoc + "OriginalRecordIDs"] = currentOriginalRecordIDs;
      }
    }
    else {
      this[assoc] = [];
      this[assoc + "OriginalRecordIDs"] = [];
    }
  }, this);

  JazzRecord.each(this.options.model.options.hasAndBelongsToMany, function(assocTable, assoc) {
    if(this[assoc]) {
      if(this[assoc].length) {
        var mappingTable = [this.options.model.table, assocTable].sort().join("_");
        var assocModelKey = JazzRecord.models.get(assocTable).options.foreignKey;
        var sql = "";
      
        // save all still-assigned records, add new mapping records
        var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
      
        JazzRecord.each(this[assoc], function(record) {
          record.save();
          if(JazzRecord.arrayContainsVal(originalRecordIDs, record.id))
            JazzRecord.removeFromArray(originalRecordIDs, record.id);
          else {
            sql = "INSERT INTO " + mappingTable + " (" + foreignKey + ", " + assocModelKey + ") VALUES(" + this.id + ", " + record.id + ")";
            JazzRecord.adapter.run(sql);
          }
        }, this);
      
        // remove originalRecordIDs from no longer-assigned records
        JazzRecord.each(originalRecordIDs, function(id) {
          sql = "DELETE FROM " + mappingTable + " WHERE " + foreignKey + "=" + this.id + " AND " + assocModelKey + "=" + id + ";";
          JazzRecord.adapter.run(sql);
        }, this);
      
        // remap originalRecordIDs for new set
        var currentOriginalRecordIDs = [];
        JazzRecord.each(this[assoc], function(record) {
          currentOriginalRecordIDs.push(record.id);
        });
        this[assoc + "OriginalRecordIDs"] = currentOriginalRecordIDs;
      }
    }
    else {
      this[assoc] = [];
      this[assoc + "OriginalRecordIDs"] = [];
    }
  }, this);

  // reset errors per call to save
  this.errors = {};
  // new records
  if(this.isNew()) {
    if(this.isValid("create"))
      this.onCreate();
  }
  else {
    if(this.isValid("update") && this.isChanged())
      this.onUpdate();
  }
  
  if(this.isValid("save")) {
    var data = this.getData();
    if(this.isChanged()) {
      this.onSave();
      data.originalData = this.originalData ? this.originalData : {id: this.id};
      this.options.model.save(data);
      this.reload();
    }
    else if(this.isNew()) {
      this.onSave();
      this.id = this.options.model.save(data);
    }
    
    // overwrite original data so it is no longer "dirty" OR so it is no longer new
    this.originalData = {};
    JazzRecord.each(this.options.model.options.columns, function(colType, colName) {
      this.originalData[colName] = this[colName];
    }, this);
    if(this.id)
      this.originalData.id = this.id;
    
    this.isNew = function() {
      return false;
    };
    return true;
  }
  return false;
};