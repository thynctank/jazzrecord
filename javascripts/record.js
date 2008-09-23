//represents model data in memory, necessary to separate "class" methods from "instance" methods
ThyncRecord.Record = new Class({
  Implements: Options,
  options: {
    model: null,
    columns: {},
    data: {}
  },
  initialize: function(options) {
    this.id = null;
    this.setOptions(options);
    //copy over column data
    for(col in this.options.columns) {
      this[col] = this.options.data[col] || null;
    }
    if(this.options.data.id)
      this.id = this.options.data.id;
    if(this.options.errors)
      this.errors = this.options.errors;
  },
  destroy: function() {
    if(!this.id)
      throw("Unsaved record cannot be destroyed");
    else {
      this.options.model.destroy(this.id);
      this.id = null;
    }
  },
  save: function() {
    var originalData = $H();
    $H(this.options.data).each(function(dataVal, dataCol) {
      if(dataCol != "id")
        originalData.set(dataCol, dataVal);
    }, this);
    
    var data = $H();
    $H(this.options.columns).each(function(colType, colName) {
      data.set(colName, this[colName]);
      // overwrite original data so it is no longer "dirty"
      this.options.data[colName] = this[colName];
    }, this);

    //verify no columns have changed to return w/o querying database
    if(this.id && data.toQueryString() == originalData.toQueryString()) {
      puts("Data Unchanged");
      return;
    }
    
    if(this.id)
      data.id = this.id;

    data.set("originalData", originalData);
    var result = this.options.model.save(data.getClean());

    if(!this.id)
      this.id = result;
  },
  reload: function() {
    if(!this.id)
      throw("Unsaved record cannot be reloaded");
    else {
      var results = this.options.model.find(this.id);
      $extend(this, results);
    }
  },
  updateAttribute: function(name, val) {
    this[name] = val;
    this.save();
  },
  toString: function() {
    var outputTemplate = "#<Table: {modelTable} id: {id} {columnStuff}>";
    var baseOptions = {modelTable: this.options.model.table, id: this.id};
    baseOptions.columnStuff = "";
    $H(this.options.columns).each(function(colType, colName) {
      baseOptions.columnStuff += " " + colName + ": " + this[colName];
    }, this);
    return outputTemplate.substitute(baseOptions);
  }
});