//firefox/air debug function, kill w/ global var named prod
function puts(str) {
  if(typeof prod != "undefined")
    return;
  if(typeof console != "undefined")
    if(typeof str == "string")
      console.log(str);
    if(typeof str == "object")
      console.dir(str);
  if(typeof air != "undefined" && air.trace)
    air.trace(str);
}


var ThyncRecord = {};

// globals
ThyncRecord.depth = 4;
ThyncRecord.models = new Hash();


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

    //if table does not exist, create.
    if(!ThyncRecord.models.has(this.table))
      ThyncRecord.models.set(this.table, this);
    else
      throw("You cannot create more than one model referring to table " + this.table);
    
    //manage migrations akelos-style, numbered and in one file (notify user of upgrades)
  },
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table + ";";
    return $random(0, 300);
    // return this.query(options);
  },
  
  //finders: find, find_by, all, first, last
  find: function(id, options) {
    if(!$defined(id))
      throw("Missing ID Parameter");
    switch($type(id)) {
      case "array":
      case "number":
        options = $extend({id: id}, options);
        break;
    }
    return this.select(options);
  },
  find_by: function(field, value) {
    if(!this.options.columns[field])
      throw("column " + field + " does not exist in table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value), limit: 1});
  },
  find_all_by: function(field, value) {
    if(!this.options.columns[field])
      throw("column " + field + " does not exist in table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value)});
  },
  all: function(options) {
    return this.select(options);
  },
  first: function(options) {
    options = $extend({limit: 1}, options);
    return this.select(options);
  },
  last: function(options) {
    options = $extend({limit: 1, order: "id"}, options);
    options.order += " DESC";
    return this.select(options);
  },

  select: function(options) {
    if(!options)
      options = {};

    this.sql = "SELECT {select} FROM {table} {conditions} {order} {limit} {offset};";

    var defaultOptions = {statement: "SELECT", select: "*", table: this.table};
    
    options = $extend(defaultOptions, options);

    if(!options.select == "*" && !options.select.contains("id"))
      options.select = "id, " + options.select;      
    if(options.order)
      options.order = "ORDER BY " + options.order;
    if($type(options.limit) == "number")
      options.limit = "LIMIT " + options.limit;
    if($type(options.offset) == "number")
      options.offset = "OFFSET " + options.offset;
    //add complex conditions handling as in AR
    if(options.conditions) {
      options.conditions = "WHERE " + options.conditions;
      if(options.id)
        options.conditions += " AND id=" + options.id;
    }
    else if(options.id)
      options.conditions = "WHERE id=" + options.id;
    
    this.sql = this.sql.substitute(options).clean();
    return this.query(options);
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
  },

  //delete
  destroy: function(id) {
    this.query({statement: "DELETE", select: "", id: id});
  },

  //insert or update
  save: function(data) {
    this.sql = "{saveMode} {table} {data} {conditions};";
    var defaultOptions = {saveMode: "INSERT INTO", table: this.table, data: this.columnNames() + this.columnValues(data)};
    
    var options = {};
    if(data.id) {
      options.saveMode = "UPDATE";
      options.conditions = "WHERE id=" + data.id;
      
      options.data = "";
      for(col in this.options.columns) {
        options.data += col + "=" + this.typeValue(col, data[col]) + ", ";
      }
      options.data = "SET " + options.data.substr(0, options.data.length - 2);
    }
    
    options = $extend(defaultOptions, options);
    
    this.sql = this.sql.substitute(options).clean();
    return this.query(options);
  },

  //utilities - used in building query strings
  columnNames: function() {
    var columns = "(";
    for(col in this.options.columns) {
      if(col != "id")
        columns += col + ", ";
    }
    columns = columns.substr(0, columns.length - 2);
    return columns + ")";
  },
  columnValues: function(data) {
    var values = " VALUES(";
    for(col in this.options.columns) {
      if(col != "id")
        values += this.typeValue(col, data[col]) + ", ";
    }
    values = values.substr(0, values.length - 2);
    return values + ")";
  },
  typeValue: function(field, val) {
    if(val == null)
      return "NULL";
    else
      switch(this.options.columns[field]) {
        case "number":
          return val || this[field];
        case "text":
          return "'" + (val || this[field]) + "'";
      }
  },
  query: function(options) {
    puts(this.sql);
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    // preload 5 levels deep of associations by default
    // for preventing infinite loops as a result of models referencing each other
    // perhaps add stack/deeper recursion later?
    
    // potentially abstract to work with Google Gears as well as AIR

    // whether to probe associations
    if($defined(options.depth))
      this.deeper = options.depth - 1;
    else
      this.deeper = ThyncRecord.depth;
    
    // stub response
    var id = options.id ? options.id : $random(1,300);
    if($defined(options.select)) {
      var data = {};
      switch(this.table) {
        case "employees":
          data = {id: id, name: "Nick", company_id: 3};
          break;
        case "companies":
          data = {id: id, name: "RideCharge"};
          break;
      }
    }    
    
    if(this.deeper > 0 && this.options.belongs_to && !$defined(options.saveMode))
      for(associated_model in this.options.belongs_to) {
        data[associated_model] = ThyncRecord.models.get(this.options.belongs_to[associated_model]).find(data[associated_model + "_id"], {depth: this.deeper});
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
      $extend(this, results);
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

//example models
var Employee = new ThyncRecord.Model({
  table: "employees",
  // assocations defined as assoc_nam: "tablename"
  belongs_to: {company: "companies"},
  columns: {
    name: "text",
    age: "number",
    company_id: "number"
  }
});

var Company = new ThyncRecord.Model({
  table: "companies",
  has_many: {employees: "employees"},
  columns: {
    name: "text"
  }
});