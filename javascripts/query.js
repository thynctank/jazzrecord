ThyncRecord.Model.implement({
  query: function(options) {
    puts(this.sql);
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    // preload 5 levels deep of associations by default
    // for preventing infinite loops as a result of models referencing each other
    // perhaps add stack/deeper recursion later?
    
    // potentially abstract to work with Google Gears as well as AIR

    // stub response
    var id = options.id ? options.id : $random(1,300);
    var data = {};

    switch(this.table) {
      case "employees":
        data = {id: id, name: "Nick", company_id: 5};
        break;
      case "companies":
        data = {id: id, name: "RideCharge"};
        break;
    }

    // for preloading associations for find calls, must happen after iniitial query
    // recursion all winds down in this function
    if($chk(options.depth))
      this.deeper = options.depth - 1;
    else
      this.deeper = ThyncRecord.depth;
    if(this.deeper > 0 && this.options.belongs_to)
      for(associated_model in this.options.belongs_to) {
        if(data[associated_model + "_id"] != null)
          data[associated_model] = ThyncRecord.models.get(this.options.belongs_to[associated_model]).find(data[associated_model + "_id"], {depth: this.deeper});
        else
          data[associated_model] = null;
      }
    
      
    var errors = {};
    
    return new ThyncRecord.Record({
      model: this,
      columns: $merge(this.options.columns, this.options.belongs_to),
      data: data,
      errors: errors  
    });
  }  
});