JazzRecord.Model = new Class({
  Implements: Options,
  options: {
    // required data
    table: "",
    columns: {},
    // association data
    foreignKey: "",
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
      atCreate: $empty,
      atUpdate: $empty,
      atSave:   $empty
    }
  },
  initialize: function(options) {
    this.setOptions(options);
    this.table = this.options.table;
    this.sql = "";
    
    $each(this.options.modelMethods, function(method, name) {
	    this[name] = method;
    });
    
    // add all-important master listing for this model/table relationship
    if(!JazzRecord.models.has(this.table))
      JazzRecord.models.set(this.table, this);
  },
  //equivalent to Model.new in ActiveRecord
  newRecord: function(options) {
    if(!options)
      options = {};
    var data = {};
    $each(this.options.columns, function(colVal, colName) {
      data[colName] = options[colName] || null;
    });

    var recordOptions = {
      model: this,
      columns: this.options.columns,
      data: data
    };
    
    $each(this.options.events, function(eventHandler, eventName) {
      recordOptions[eventName] = eventHandler;
    });

    return new JazzRecord.Record(recordOptions);
  },
  create: function(options) {
    var record = this.newRecord(options);
    record.save();
    return record;
  }
});
