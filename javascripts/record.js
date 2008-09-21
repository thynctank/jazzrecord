//represents model data in memory, necessary to separate "class" methods from "instance" methods
ThyncRecord.Record = new Class({
  Implements: Options,
  options: {
    model: null,
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
    // verify something has changed before wasting cycles on db query
    var unchanged = false;
    
    var data = {};
    for (col in this.options.columns) {
      data[col] = this[col];
      if(this.id)
        ;//verify no columns have changed to return w/o querying database
    }

    if(unchanged) {
      puts("Data unchanged");
      return;
    }
    
    if(this.id)
      data.id = this.id;

    data.originalData = {};
    for(col in this.options.data)
      data.originalData[col] = this.options.data[col];

    var results = this.options.model.save(data);
    $extend(this, results);
  },
  reload: function() {
    if(!this.id)
      throw("Unsaved record cannot be reloaded");
    else {
      var results = this.options.model.find(this.id);
      $extend(this, results);
    }
  },
  toString: function() {
    if(!this.id)
      return null;
    else
      return this.id;
  }
});