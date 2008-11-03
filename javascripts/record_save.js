JazzRecord.Record.implement({
  save: function() {    
    $each(this.options.model.options.hasOne, function(assocTable, assoc) {
      var foreignKey = this.options.model.options.foreignKey;
      // remove original association and replace w/ new one
      var assocModel = JazzRecord.models.get(assocTable);
      var oldRec = assocModel.findBy(foreignKey, this.id, 0);
      if(oldRec) {
        delete oldRec[foreignKey];
        oldRec.save();
      }
      if(this[assoc]) {
        this[assoc].updateAttribute(foreignKey, this.id);
      }
    }, this);

    // $each(this.options.hasMany, function(assocTable, assoc) {
    //   var foreignKey = this.options.foreignKey;
    //   if(this[assoc] && this[assoc].length)
    //     this[assoc].each(function(assocRec) {
    //       assocRec.updateAttribute(foreignKey, this.id);
    //     });
    // }, this);

    // $each(this.options.model.options.hasAndBelongsToMany, function(assocTable, association) {
    //   var mappingTable = [this.model.table, assocTable].sort().toString().replace(",", "_");
    //   var localKey = model.options.foreignKey;
    //   var foreignKey = JazzRecord.models.get(assocTable).options.foreignKey;        
    // }, this);      

    // delete any associated objects if old foreignKey was set but has become unset, autolink if assigned an object    
    var data = this.getData();
    
    if(!this.id && this.isValid("oncreate")) {
      this.id = this.options.model.save(data);;
      this.fireEvent("create");
    }
    else {
      // data.id = this.id;
      data.originalData = this.originalData;

      if(!this.isValid("onupdate") || !this.isChanged()) {
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
    
    if(this.isValid("onsave")) {
      this.fireEvent("save");
      return true;
    }
    return false;
  }
});