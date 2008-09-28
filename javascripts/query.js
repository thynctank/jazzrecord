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
      var record = new ThyncRecord.Record({
        model: this,
        columns: this.options.columns,
        data: data,
        errors: errors
      });
      
      $each(this.options.hasOne, function(associatedModel) {
        
      }, this);
      
      $each(this.options.hasMany, function(associatedModel) {
        
      }, this);
      
      $each(this.options.belongsTo, function(associatedModel) {
        
      }, this);
      
      $each(this.options.hasAndBelongsToMany, function(associatedModel) {
        
      }, this);
      
      return record;
    }
    else {
      var records = [];
      $each(data, function(row) {
        records.push(new ThyncRecord.Record({
          model: this,
          columns: this.options.columns,
          data: row,
          errors: {}
        }));
      }, this);
      return records;
    }
  }  
});