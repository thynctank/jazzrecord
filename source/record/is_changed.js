JazzRecord.Record.prototype.isChanged = function() {
  //bail if brand-new record
  if(this.isNew())
    return false;

  JazzRecord.each(this.options.model.options.belongsTo, function(assocTable, assoc) {
    var assocModel = JazzRecord.models.get(assocTable);
    var assocIdCol = assocModel.options.foreignKey;

    // 3 things to check status/existance of
    // originalData and originalData[assocIdCol] - existance at all
    // this[assocIdCol] - deleted/changed from originalData
    // this[assoc] - loaded or not, .id changed
    
    if(!this.originalData)
      return false;
    
    if(this[assoc]) {
      // if unloaded, obviously assoc hasn't changed, just worry about assocIdCol
      if(this[assoc].unloaded) {
        if(this[assocIdCol] !== this.originalData[assocIdCol])
          return true;
      }
      else {
        if(this[assoc].isNew())
          this[assoc].save();
        if(this[assoc].id !== this.originalData[assocIdCol]) {
          this[assocIdCol] = this[assoc].id;
          return true;
        }
        if(this[assocIdCol] !== this.originalData[assocIdCol])
          return true;
      }
    }
    else {
      if(this.originalData[assocIdCol]) {
        this[assocIdCol] = null;
        return true;
      }
    }
  }, this);

  var data = new JazzRecord.Hash(this.getData());
  var originalData = new JazzRecord.Hash(this.originalData);
  
  //verify no columns have changed to return w/o querying database
  if(this.id && data.toQueryString() === originalData.toQueryString())
    return false;
  else
    return true;
};