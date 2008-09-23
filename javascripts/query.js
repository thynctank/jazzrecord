ThyncRecord.Model.implement({
  query: function(options) {
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    var data = ThyncRecord.adapter.run(this.sql);

    if(!data || data.length == 0) {
      puts("Found Nothing");
      return;
    }
        
    if(this.sql.contains("LIMIT 1")) {
      data = data[0];
      
      // implement eager/lazy loading for associations
      
      var errors = {};
      return new ThyncRecord.Record({
        model: this,
        columns: this.options.columns,
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