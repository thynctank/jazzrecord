ThyncRecord.Model.implement({
  query: function(options) {
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    var data = ThyncRecord.adapter.run(this.sql);
    
    if(!data)
      return;
        
    if(this.sql.contains("LIMIT 1")) {
      data = data[0];
      
      // for preloading associations for find calls, must happen after iniitial query
      // recursion all winds down in this function
      if($chk(options.depth))
        this.deeper = options.depth - 1;
      else
        this.deeper = ThyncRecord.depth;
      if(this.deeper > 0) {
        if(this.options.belongsTo)
          for(associatedModel in this.options.belongsTo) {
            if(data[associatedModel + "_id"] != null)
              data[associatedModel] = ThyncRecord.models.get(this.options.belongsTo[associatedModel]).find(data[associatedModel + "_id"], {depth: this.deeper});
            else
              data[associatedModel] = null;
          }
        if(this.options.hasMany) {
          for(associatedModel in this.options.hasMany) {
            data[associatedModel] = [];
            var subdata = ThyncRecord.models.get(this.options.hasMany[associatedModel]).all({conditions: this.options.foreignKey + " = " + data.id});
            puts("Associated model is: " + associatedModel);
            data[associatedModel].extend(subdata);
          }
        }
      }
      
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