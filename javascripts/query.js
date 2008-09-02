ThyncRecord.Model.implement({
  query: function(options) {
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    var data = ThyncRecord.adapter.run(this.sql);
    
    if(!data)
      return;
        
    if(this.sql.contains("LIMIT")) {
      data = data[0];
    
      // for preloading associations for find calls, must happen after iniitial query
      // recursion all winds down in this function
      if($chk(options.depth))
        this.deeper = options.depth - 1;
      else
        this.deeper = ThyncRecord.depth;
      if(this.deeper > 0) {
        if(this.options.belongs_to)
          for(associated_model in this.options.belongs_to) {
            if(data[associated_model + "_id"] != null)
              data[associated_model] = ThyncRecord.models.get(this.options.belongs_to[associated_model]).find(data[associated_model + "_id"], {depth: this.deeper});
            else
              data[associated_model] = null;
          }
        if(this.options.has_many) {
          for(associated_model in this.options.has_many) {
            data[associated_model] = [];
            var subdata = ThyncRecord.models.get(this.options.has_many[associated_model]).all({conditions: this.options.foreign_key + " = " + data.id});
            puts("Associated model is: " + associated_model);
            data[associated_model].extend(subdata);
          }
        }
      }
      
      var errors = {};
    
      return new ThyncRecord.Record({
        model: this,
        columns: $merge(this.options.columns, this.options.belongs_to),
        data: data,
        errors: errors  
      });
    }
    else {
      var records = [];
      for(var i = 0, j = data.length; i < j; i++) {
        records.push(new ThyncRecord.Record({
          model: this,
          columns: this.options.columns,
          data: data[i],
          errors: {}
        }));
      }
      return records;
    }
  }  
});