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
    //copy over column data
    $each(this.options.columns, function(colType, colName) {
      this[colName] = null;
      if(this.options.data[colName])
        this[colName] = this.options.data[colName];
      if(colType === "bool") {
        var boolVal = (this[colName] ? true : false);
        this.options.data[colName] = boolVal;
        this[colName] = boolVal;
      }
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
  getData : function(source) {
    var data = {};
    if(source === "original")
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
    if(this.id && data.toQueryString() === originalData.toQueryString())
      return false;
    else
      return true;
  },
  save: function() {
    if(this.isChanged() && this.isValid()) {
      var data = this.getData();
      var originalData = this.getData("original");
      
      if(this.id){
        data.id = this.id;
        this.fireEvent("update");
      }
      data.originalData = originalData;
      
      var result = this.options.model.save(data);
      
      if(!this.id) {
        this.id = result;
        this.fireEvent("create");
      }
      // overwrite original data so it is no longer "dirty"
      $each(this.options.columns, function(colType, colName) {
        this.options.data[colName] = this[colName];
      }, this);
      this.fireEvent("save");
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
  // for loading as-yet unloaded association data
  load: function(association, depth) {
    if(!depth)
      depth = 0;
    if(this[association].unloaded)
      this[association] = this[association].loader(depth);
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