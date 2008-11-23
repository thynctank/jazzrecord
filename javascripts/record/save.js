JazzRecord.Record.implement({
  save: function() {    
    $each(this.options.model.options.hasOne, function(assocTable, assoc) {
      var foreignKey = this.options.model.options.foreignKey;
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
        var foreignKey = this.options.model.options.foreignKey;
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

    // $each(this.options.model.options.hasAndBelongsToMany, function(assocTable, association) {
    //   var mappingTable = [this.model.table, assocTable].sort().toString().replace(",", "_");
    //   var localKey = model.options.foreignKey;
    //   var foreignKey = JazzRecord.models.get(assocTable).options.foreignKey;        
    // }, this);      

    // delete any associated objects if old foreignKey was set but has become unset, autolink if assigned an object    
    var data = this.getData();
    
    if(!this.id && this.isValid("create")) {
      this.id = this.options.model.save(data);;
      this.fireEvent("create");
    }
    else {
      // data.id = this.id;
      data.originalData = this.originalData;

      if(!this.isValid("update") || !this.isChanged()) {
        return false;
      }

      if(this.isChanged()) {
        data.id = this.id;
        this.options.model.save(data);
        this.reload();
        // overwrite original data so it is no longer "dirty"
        $each(this.options.columns, function(colType, colName) {
          this.originalData[colName] = this[colName];
        }, this);

        this.fireEvent("update");
      }
    }
    
    if(this.isValid("save")) {
      this.fireEvent("save");
      return true;
    }
    return false;
  }
});