JazzRecord.Record.implement({
  save: function() {
    var foreignKey = this.options.model.options.foreignKey;

    $each(this.options.model.options.hasOne, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      
      // remove original association and replace w/ new one
      // if assocRec has changed there will be more than one record w/ this ID
      var oldRec = assocModel.findBy(foreignKey, this.id, 0);
      if(oldRec && oldRec.id !== this[assoc].id) {
        delete oldRec[foreignKey];
        oldRec.save();
      }
      if(this[assoc]) {
        this[assoc].updateAttribute(foreignKey, this.id);
      }
    }, this);

    $each(this.options.model.options.hasMany, function(assocTable, assoc) {    
      if(this[assoc] && this[assoc].length) {
        var assocModel = JazzRecord.models.get(assocTable);

        var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
        
        // save all still-assigned records
        this[assoc].each(function(record) {
          record[foreignKey] = this.id;
          record.save();
          if(originalRecordIDs.contains(record.id))
            originalRecordIDs.erase(record.id);
        }, this);
        
        // remove association from no longer-assigned records
        originalRecordIDs.each(function(id) {
          assocModel.find(id).updateAttribute(foreignKey, null);
        });
        
        // remap originalRecordIDs for new set
        this[assoc + "OriginalRecordIDs"] = this[assoc].map(function(record) {
          return record.id;
        });
      }
    }, this);

    $each(this.options.model.options.hasAndBelongsToMany, function(assocTable, assoc) {
      if(this[assoc] && this[assoc].length) {
        var mappingTable = [this.options.model.table, assocTable].sort().toString().replace(",", "_");
        var assocModelKey = JazzRecord.models.get(assocTable).options.foreignKey;
        var sql = "";
        
        // save all still-assigned records, add new mapping records
        var originalRecordIDs = this[assoc + "OriginalRecordIDs"];
        
        this[assoc].each(function(record) {
          record.save();
          if(originalRecordIDs.contains(record.id))
            originalRecordIDs.erase(record.id);
          else {
            sql = "INSERT INTO " + mappingTable + " (" + foreignKey + ", " + assocModelKey + ") VALUES(" + this.id + ", " + record.id + ")";
            JazzRecord.adapter.run(sql);
          }
        }, this);
        
        // remove originalRecordIDs from no longer-assigned records
        originalRecordIDs.each(function(id) {
          sql = "DELETE FROM " + mappingTable + " WHERE " + foreignKey + "=" + this.id + " AND " + assocModelKey + "=" + id + ";";
          JazzRecord.adapter.run(sql);
        }, this);
        
        // remap originalRecordIDs for new set
        this[assoc + "OriginalRecordIDs"] = this[assoc].map(function(record) {
          return record.id;
        });
      }
    }, this);

    // delete any associated objects if old foreignKey was set but has become unset, autolink if assigned an object    
    var data = this.getData();
    // reset errors per call to save
    this.errors = {};    
    // new records
    if(!this.id) {
      if(this.isValid("create"))
        this.fireEvent("create");
    }
    else {
      data.id = this.id;
      if(this.isValid("update"))
        this.fireEvent("update");
    }
    
    if(this.isValid("save")) {
      if(this.isChanged()) {
        this.options.model.save(data);
        this.reload();
        // overwrite original data so it is no longer "dirty"
        $each(this.options.columns, function(colType, colName) {
          this.originalData[colName] = this[colName];
        }, this);
      }
      else
        this.id = this.options.model.save(data);
        

      this.fireEvent("save");
      return true;
    }
    return false;
  }
});