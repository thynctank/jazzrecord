JazzRecord.Model = function(options) {
  var defaults = {
    // required data
    table: "",
    columns: {},
    // association data
    foreignKey: "",
    order: "",
    hasOne: {},
    belongsTo: {},
    hasMany: {},
    hasAndBelongsToMany: {},
    // events
    events: {},
    // custom finders/methods
    modelMethods: {},
    recordMethods: {},
    // validation
    validate: {
      atCreate: function(){},
      atUpdate: function(){},
      atSave:   function(){}
    }
  };

  JazzRecord.setOptions.call(this, options, defaults);

  this.table = this.options.table;
  this.sql = "";
  
  JazzRecord.each(this.options.modelMethods, function(method, name) {
    this[name] = method;
  }, this);
  
  // add all-important master listing for this model/table relationship
  if(!JazzRecord.models.has(this.table))
    JazzRecord.models.set(this.table, this);
};

JazzRecord.Model.prototype = {
  //equivalent to Model.new in ActiveRecord
  newRecord: function(options) {
    if(!options)
      options = {};
    var data = {};
    JazzRecord.each(this.options.columns, function(colVal, colName) {
      data[colName] = options[colName] || null;
    });

    var recordOptions = {
      model: this,
      columns: this.options.columns,
      data: data
    };
    
    JazzRecord.each(this.options.events, function(eventHandler, eventName) {
      recordOptions[eventName] = eventHandler;
    });

    var record = new JazzRecord.Record(recordOptions);
    
    record.isNew = function() {
      return true;
    };
    
    return record;
  },
  // allows ID or no ID
  create: function(options) {
    var record = this.newRecord(options);
    record.save();
    return record;
  },
  update: function(id, options) {
    
  },
  // updates is hash of col/values
  // conditions should be abstracted out
  updateAll: function(updates, conditions) {
    
  },
  // selector is ID or array of IDs
  destroy: function(selector) {
    
  }
};
