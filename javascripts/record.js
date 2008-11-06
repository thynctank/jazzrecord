//represents model data in memory, necessary to separate "class" methods from "instance" methods
JazzRecord.Record = new Class({
  Implements: [Options, Events],
  options: {
    model: null,
    columns: {},
    data: {}
    // onCreate: $empty,
    // onUpdate: $empty,
    // onSave: $empty,
    // onDestroy: $empty,
  },
  initialize: function(options) {
    this.id = null;
    this.setOptions(options);
    this.errors = [];
    
    this.originalData = {};
    //copy over column data
    $each(this.options.columns, function(colType, colName) {
      this[colName] = null;
      if(this.options.data[colName]) {
        this[colName] = this.options.data[colName];
        this.originalData[colName] = this.options.data[colName];        
      }
      if(colType === "bool") {
        var boolVal = (this[colName] ? true : false);
        this.originalData[colName] = boolVal;
        this[colName] = boolVal;
      }
    }, this);
    
    $each(this.options.model.options.recordMethods, function(method, name) {
      this[name] = method;
    }, this);
    
    if(this.options.data.id)
      this.id = this.options.data.id;
  },
  destroy: function() {
    if(!this.id)
      throw("Unsaved record cannot be destroyed");
    else {
      this.fireEvent("destroy");
      this.options.model.destroy(this.id);
      this.id = null;
    }
  },
  getData : function() {
    var data = {};      
    $each(this.options.columns, function(colType, colName) {
      data[colName] = this[colName];
    }, this);
    return data;
  },
  revert: function() {
    $each(this.options.columns, function(colType, colName) {
      this[colName] = this.originalData[colName];
    }, this);
  },
  reload: function() {
    if(!this.id)
      throw("Unsaved record cannot be reloaded");
    else {
      var results = this.options.model.find(this.id);
      $extend(this, results);
    }
  },
  // for loading as-yet unloaded association data
  load: function(association, depth) {
    if(!depth)
      depth = 0;
    if(this[association].unloaded)
      this[association] = this[association].loader(depth);
    return this[association];
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