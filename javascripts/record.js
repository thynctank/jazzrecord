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
    $each(this.options.columns, function(colType, colName) {
      this[colName] = null;
      if(this.options.data[colName])
        this[colName] = this.options.data[colName];
    }, this);
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
  getData : function(source) {
    var data = {};
    if(source == "original")
      source = this.options.data;
    else
      source = this;
      
    $each(this.options.columns, function(colType, colName) {
      data[colName] = source[colName];
    }, this);
    return data;
  },
  isChanged: function() {
    var data = $H(this.getData());
    var originalData = $H(this.getData("original"));

    //verify no columns have changed to return w/o querying database
    if(this.id && data.toQueryString() == originalData.toQueryString())
      return false;
    else
      return true;
  },
  save: function() {
    if(this.isChanged()) {
      var data = this.getData();
      var originalData = this.getData("original");

      if(this.id)
        data.id = this.id;
      data.originalData = originalData;
      var result = this.options.model.save(data);

      if(!this.id)
        this.id = result;
      // overwrite original data so it is no longer "dirty"
      $each(this.options.columns, function(colType, colName) {
        this.options.data[colName] = this[colName];
      }, this);
    }
    else
      puts("Unchanged data");
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
    $each(this.options.columns, function(colType, colName) {
      baseOptions.columnStuff += " " + colName + ": " + this[colName];
    }, this);
    return outputTemplate.substitute(baseOptions);
  }
});