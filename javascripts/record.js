//represents model data in memory, necessary to separate "class" methods from "instance" methods
ThyncRecord.Record = new Class({
  Implements: Options,
  options: {
    columns: {},
    data: {}
  },
  initialize: function(options) {
    this.id = null;
    this.setOptions(options);
    //copy over column data
    for(col in this.options.columns) {
      this[col] = this.options.data[col] || null;
    }
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
  save: function() {
    var data = {};
    for(col in this.options.columns)
      data[col] = this[col];
    if(this.id)
      data.id = this.id;
    var results = this.options.model.save(data);
    this.id = results.id;
  },
  reload: function() {
    if(!this.id)
      throw("Unsaved record cannot be reloaded");
    else {
      var results = this.options.model.find(this.id);
      $extend(this, results);
    }
  }
});