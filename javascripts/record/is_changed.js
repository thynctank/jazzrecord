JazzRecord.Record.implement({
  isChanged: function() {
    //bail if brand-new record
    if(!this.id)
      return false;

    $each(this.options.model.options.belongsTo, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      
      if(this.originalData[assocIdCol] && !this[assocIdCol])
        delete this[assoc];
      else if(this.originalData[assocIdCol] !== this[assocIdCol])
        ;
      else if(this.originalData[assocIdCol] && !this[assoc])
        delete this[assocIdCol];
      else if(this[assoc])
        this[assocIdCol] = this[assoc].id;
    }, this);
  
    var data = $H(this.getData());
    var originalData = $H(this.originalData);

    //verify no columns have changed to return w/o querying database
    if(this.id && data.toQueryString() === originalData.toQueryString())
      return false;
    else
      return true;
  }
});