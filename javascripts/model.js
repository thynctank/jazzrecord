ThyncRecord.Model = new Class({
  Implements: Options,
  options: {
    columns: {},
    has_many: {},
    has_and_belongs_to_many: {},
    has_many_through: {}
  },
  initialize: function(options) {
    this.setOptions(options);
    this.table = this.options.table;
    this.sql = "";
    
    // add all-important master listing for this model/table relationship
    if(!ThyncRecord.models.has(this.table))
      ThyncRecord.models.set(this.table, this);
    if(this.options.migrations)
      this.migrate(this.options.migrations);
  },
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table + ";";
    return $random(0, 300);
    // return this.query(options);
  },
  
  //equivalent to Model.new in ActiveRecord
  create: function(options) {
    if(!options)
      options = {};
    var data = {};
    for(col in this.options.columns) {
      data[col] = options[col] || null;
    }
    return new ThyncRecord.Record({
      model: this,
      columns: this.options.columns,
      data: data
    });
  }
});
