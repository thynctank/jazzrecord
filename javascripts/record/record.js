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
    
    this.isNew = function() {
      return false;
    };
  }
  else {
    this.isNew = function() {
      return true;
    };
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
      this.options.model.deleteRecords(this.id);
      // unlink any hasMany and hasOne records from this record
      JazzRecord.each(this.options.model.options.hasMany, function(assocTable, assoc) {
        this.load(assoc);
        JazzRecord.each(this[assoc], function(record) {
          record.updateAttribute(this.options.model.options.foreignKey, null);
        }, this);
        this[assoc + "OriginalRecordIDs"] = [];
      }, this);
      
      JazzRecord.each(this.options.model.options.hasAndBelongsToMany, function(assocTable, assoc) {
        var mappingTable = [this.options.model.table, assocTable].sort().join("_");
        sql = "DELETE FROM " + mappingTable + " WHERE " + this.options.model.options.foreignKey + "=" + this.id + ";";
        JazzRecord.adapter.run(sql);
      }, this);
      
      JazzRecord.each(this.options.model.options.hasOne, function(assocTable, assoc) {
        this.load(assoc);
        if(!this[assoc])
          return;
        this[assoc].updateAttribute(this.options.model.options.foreignKey, null);
        this[assoc + "OriginalRecordID"] = null;
      }, this);
      
      this.onDestroy();
      this.id = null;
      this.originalData = null;
      this.isNew = function() {
        return true;
      };
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
    JazzRecord.each(this.options.model.options.belongsTo, function(assocTable, assoc) {
      var assocModel = JazzRecord.models.get(assocTable);
      var assocIdCol = assocModel.options.foreignKey;
      // reload any associations which are already loaded and have incorrect (not the old) data
      if(this[assoc] && !this[assoc].unloaded && this[assoc].id !== this[assocIdCol])
        this[assoc] = assocModel.find({id: this[assocIdCol], depth: 0});
    }, this);
  },
  reload: function() {
    if(!this.id)
      throw("Unsaved record cannot be reloaded");
    else {
      var results = this.options.model.find(this.id);
      JazzRecord.shallowMerge(this, results);
    }
  },
  // for loading as-yet unloaded association data
  load: function(association, depth) {
    if(!depth)
      depth = 0;
    if(this[association] && this[association].unloaded) {
      this[association] = this[association].loader(depth);
      if(JazzRecord.getType(this[association]) === "array") {
        var currentOriginalRecordIDs = [];
        JazzRecord.each(this[association], function(rec) {
          currentOriginalRecordIDs.push(rec.id);
        });
        this[association + "OriginalRecordIDs"] = currentOriginalRecordIDs;
      }
      else if(this[association] && this[association].id)
        this[association + "OriginalRecordID"] = this[association].id;
    }
    return this[association];
  },
  updateAttribute: function(name, val, saveAfter) {
    this[name] = val;
    if(typeof saveAfter === "undefined")
      saveAfter = true;
    if(saveAfter)
      this.save();
  },
  updateAttributes: function(obj, saveAfter) {
    JazzRecord.each(this.options.columns, function(colType, colName) {
      this[colName] = obj[colName] || this[colName];
    }, this);
    if(typeof saveAfter === "undefined")
      saveAfter = true;
    if(saveAfter)
      this.save();
  }
};