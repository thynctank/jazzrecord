JazzRecord.Record.prototype.save = function() {
  var foreignKey = this.options.model.options.foreignKey;

  JazzRecord.each(this.options.model.options.hasOne, function(assocTable, assoc) {
    // remove original association and replace w/ new one
    if(this[assoc]) {
      if(!JazzRecord.isDefined(this[assoc + "OriginalRecordID"]))
        this[assoc].updateAttribute(foreignKey, this.id);
      else if(this[assoc + "OriginalRecordID"] !== this[assoc].id) {
        var assocModel = JazzRecord.models.get(assocTable);
        var oldRecord = assocModel.first({id: this[assoc + "OriginalRecordID"], depth:0});
        oldRecord.updateAttribute(foreignKey, null);
        this[assoc].updateAttribute(foreignKey, this.id);
      }
      this[assoc + "OriginalRecordID"] = this[assoc].id;
    }
  }, this);

  JazzRecord.each(this.options.model.options.hasMany, function(assocTable, assoc) {
    if(this[assoc] && this[assoc].length) {
      var assocModel = JazzRecord.models.get(assocTable);
      
      var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
      
      // save all still-assigned records
      JazzRecord.each(this[assoc], function(record) {
        record[foreignKey] = this.id;
        record.save();
        if(originalRecordIDs.contains(record.id))
          originalRecordIDs.erase(record.id);
      }, this);
      
      // remove association from no longer-assigned records
      JazzRecord.each(originalRecordIDs, function(id) {
        assocModel.find(id).updateAttribute(foreignKey, null);
      });
      
      // remap originalRecordIDs for new set
      this[assoc + "OriginalRecordIDs"] = this[assoc].map(function(record) {
        return record.id;
      });
    }
  }, this);

  JazzRecord.each(this.options.model.options.hasAndBelongsToMany, function(assocTable, assoc) {
    if(this[assoc] && this[assoc].length) {
      var mappingTable = [this.options.model.table, assocTable].sort().toString().replace(",", "_");
      var assocModelKey = JazzRecord.models.get(assocTable).options.foreignKey;
      var sql = "";
      
      // save all still-assigned records, add new mapping records
      var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
      
      JazzRecord.each(this[assoc], function(record) {
        record.save();
        if(originalRecordIDs.contains(record.id))
          originalRecordIDs.erase(record.id);
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
      this[assoc + "OriginalRecordIDs"] = this[assoc].map(function(record) {
        return record.id;
      });
    }
  }, this);

  // reset errors per call to save
  this.errors = {};
  // new records
  if(!this.id) {
    if(this.isValid("create"))
      this.onCreate();
  }
  else {
    if(this.isValid("update") && this.isChanged())
      this.onUpdate();
  }
  
  if(this.isValid("save")) {
    if(this.isChanged()) {
      this.onSave();
      var data = this.getData();
      data.id = this.id;
      this.options.model.save(data);
      this.reload();
      // overwrite original data so it is no longer "dirty"
      JazzRecord.each(this.options.columns, function(colType, colName) {
        this.originalData[colName] = this[colName];
      }, this);
    }
    else if(!this.id) {
      this.onSave();
      this.id = this.options.model.save(this.getData());
    }
    return true;
  }
  return false;
};