JazzRecord.Record.prototype.isChanged = function() {
  //bail if brand-new record
  if(!this.id)
    return false;

  JazzRecord.each(this.options.model.options.belongsTo, function(assocTable, assoc) {
    var assocModel = JazzRecord.models.get(assocTable);
    var assocIdCol = assocModel.options.foreignKey;
    
    // if no originalData, leave be
    // if ID was set but assoc is now null, delete ID
    // if ID was not set but assoc is now set, set ID
    // if ID was not set but is now set, leave be
    // if ID was set and has been changed, reload
    if(!this.originalData || this.originalData[assocIdCol] === this[assocIdCol])
      return;
    else {
      if(this.originalData[assocIdCol] && !JazzRecord.isDefined(this[assoc]))
        delete this[assocIdCol];
      else if(!JazzRecord.isDefined(this.originalData[assocIdCol]) && this[assoc])
        this[assocIdCol] = this[assoc].id;
      else if(!JazzRecord.isDefined(this.originalData[assocIdCol]) && !JazzRecord.isDefined(this[assoc]))
        return;
      else if(!this.originalData[assocIdCol] && this[assocIdCol])
        return;
      else if(this.originalData[assocIdCol] != this[assoc].id)
        this[assocIdCol] = this[assoc].id;
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