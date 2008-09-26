ThyncRecord.Model = new Class({
  Implements: Options,
  options: {
    table: "",
    foreignKey: "",
    columns: {},
    hasOne: {},
    hasMany: {},
    belongsTo: {},
    hasAndBelongsToMany: {}
  },
  initialize: function(options) {
    this.setOptions(options);
    this.table = this.options.table;
    this.sql = "";
    
    // add all-important master listing for this model/table relationship
    if(!ThyncRecord.models.has(this.table))
      ThyncRecord.models.set(this.table, this);
  },
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table;
    return ThyncRecord.adapter.count(this.sql);
  },
  
  //equivalent to Model.new in ActiveRecord
  newRecord: function(options) {
    if(!options)
      options = {};
    var data = {};
    $H(this.options.columns).each(function(colVal, colName) {
      data[colName] = options[colName] || null;
    });
    return new ThyncRecord.Record({
      model: this,
      columns: this.options.columns,
      data: data
    });
  },
  
  create: function(options) {
    var record = this.newRecord(options);
    record.save();
    return record;
  }
});
