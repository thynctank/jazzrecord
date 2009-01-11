//represents model data in memory, necessary to separate "class" methods from "instance" methods
JazzRecord.Record = function(options) {
  var defaults = {
    model: null,
    columns: {},
    data: {},
    onCreate: function(){},
    onUpdate: function(){},
    onSave: function(){},
    onDestroy: function(){}
  };

  this.id = null;
  JazzRecord.setOptions.call(this, options, defaults);  
  this.errors = {};
  
  // copy over event handlers (maintains Moo-like behavior)
  this.onCreate = this.options.onCreate;
  this.onUpdate = this.options.onUpdate;
  this.onSave = this.options.onSave;
  this.onDestroy = this.options.onDestroy;
  
  // only load originalData if record has been previously saved
  if(this.options.data.id) {
    this.id = this.options.data.id;
    this.originalData = {};
  }
  //copy over column data
  JazzRecord.each(this.options.columns, function(colType, colName) {
    this[colName] = null;
    this[colName] = this.options.data[colName];
    if(this.originalData)
      this.originalData[colName] = this.options.data[colName];
    if(colType === "bool") {
      var boolVal = (this[colName] ? true : false);
      if(this.originalData)
        this.originalData[colName] = boolVal;
      this[colName] = boolVal;
    }
  }, this);

  
  JazzRecord.each(this.options.model.options.recordMethods, function(method, name) {
    this[name] = method;
  }, this);
  
};

JazzRecord.Record.prototype = {
  destroy: function() {
    if(!this.id)
      throw("Unsaved record cannot be destroyed");
    else {
      this.options.model.destroy(this.id);
      // unlink any hasMany and hasOne records from this record
      JazzRecord.each(this.options.model.options.hasMany, function(assocTable, assoc) {
        this.load(assoc);
        this[assoc].each(function(record) {
          record.updateAttribute(this.options.model.options.foreignKey, null);
        }, this);
        this[assoc + "OriginalRecordIDs"] = [];
      }, this);
      
      JazzRecord.each(this.options.model.options.hasOne, function(assocTable, assoc) {
        this.load(assoc);
        if(!this[assoc])
          return;
        this[assoc].updateAttribute(this.options.model.options.foreignKey, null);
        this[assoc + "OriginalRecordID"] = null;
      }, this);
      
      this.fireEvent("destroy");
      this.id = null;
    }
  },
  getData : function() {
    var data = {};      
    JazzRecord.each(this.options.columns, function(colType, colName) {
      data[colName] = this[colName];
    }, this);
    return data;
  },
  revert: function() {
    JazzRecord.each(this.options.columns, function(colType, colName) {
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
    if(this[association] && this[association].unloaded) {
      this[association] = this[association].loader(depth);
      if(JazzRecord.getType(this[association]) === "array")
        this[association + "OriginalRecordIDs"] = this[association].map(function(rec) {
          return rec.id;
        });
      else if(this[association] && this[association].id)
        this[association + "OriginalRecordID"] = this[association].id;
    }
    return this[association];
  },
  updateAttribute: function(name, val) {
    this[name] = val;
    this.save();
  }
};