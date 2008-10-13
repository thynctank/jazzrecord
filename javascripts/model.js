ThyncRecord.Model = new Class({
  Implements: Options,
  options: {
    // required data
    table: "",
    foreignKey: "",
    columns: {},
    // association data
    hasOne: {},
    hasMany: {},
    belongsTo: {},
    hasAndBelongsToMany: {},
    // events
    events: {},
    // validation function
    validate: $empty
  },
  initialize: function(options) {
    this.setOptions(options);
    this.table = this.options.table;
    this.sql = "";
    
    // add all-important master listing for this model/table relationship
    if(!ThyncRecord.models.has(this.table))
      ThyncRecord.models.set(this.table, this);
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

    return new ThyncRecord.Record(recordOptions);
  },
  create: function(options) {
    var record = this.newRecord(options);
    record.save();
    return record;
  }
});
