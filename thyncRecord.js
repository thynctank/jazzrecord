//firefox/air debug function, kill w/ global var named prod
function puts(str) {
  if(typeof prod != "undefined")
    return;
  if(typeof console != "undefined" && console.log)
    console.log("%s", str);
  if(typeof air != "undefined" && air.trace)
    air.trace(str);
}

var ThyncModel = new Class({
  Implements: Options,
  options: {
    columns: {}
  },
  initialize: function(options) {
    this.sql = "";
    this.id = null;
    this.setOptions(options);
    this.table = this.options.table;
  
    //if table does not exist, create.
    //manage migrations akelos-style, numbered and in one file
  },
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table;
    if(conditions)
      this.sql += " WHERE " + conditions;
    this.sql += ";";
    this.query();
  },
  
  //finders: find, find_by, all, first, last
  find: function(id, options) {
    if (!id) 
      throw ("Missing ID Parameter");
    else {
      this.sql = "SELECT * FROM " + this.table + " WHERE id=" + id;
      if (options) 
        this.parseFindOptions(options);
      this.sql += ";";
      //actually return ThyncRecord with proper cols, data
      this.query();
    }
  },
  find_by: function(field, value) {
    if(!this.options.columns[field])
      throw("column " + field + " does not exist in table " + this.table);
    else {
      this.sql = "SELECT * FROM " + this.table + " WHERE " + field + "=" + this.typeValue(field, value);
      this.query();
      //return ThyncRecord
    }
  },
  all: function(options) {
    if (!options) 
      this.sql = "SELECT * FROM " + this.table + ";";
    else {
      this.parseFindOptions(options);
      this.sql += ";";
    }
    this.query();
    //return array of ThyncRecords
  },
  first: function(options) {
    if(!options)
      this.sql = "SELECT * FROM " + this.table;
    else
      this.parseFindOptions(options);
    this.sql += " LIMIT 1;";
    this.query();
    //return ThyncRecord
  },
  last: function(options) {
    if(!options)
      this.sql = "SELECT * FROM " + this.table;
    else
      this.parseFindOptions(options);
    this.sql += " DESC LIMIT 1;";
    this.query();
    //return ThyncRecord
  },
  
  //equivalent to Model.new in ActiveRecord
  create: function(options) {
    if(!options)
      options = {};
    var data = {};
    for(col in this.options.columns) {
      data[col] = options[col] || null;
    }
    return new ThyncRecord({
      model: this,
      columns: this.options.columns,
      data: data
    });
  },

  //delete
  destroy: function(id) {
    this.sql = "DELETE FROM " + this.table + " WHERE id=" + id + ";";
    this.query();
  },

  //insert or update
  save: function(data) {
    if(data.id == null) {
      this.sql = "INSERT INTO " + this.table + " " + this.columnNames() + this.columnValues(data);
    }
    else {
      this.sql = "UPDATE " + this.table + " SET ";
      for(col in this.options.columns) {
        this.sql += col + "=" + this.typeValue(col, data[col]) + ",";
      }
      this.sql = this.sql.substr(0, this.sql.length - 1);
      this.sql += " WHERE id=" + data.id + ";";
    }
    this.query();
    //be sure to return ID so ThyncRecord can set it for reload purposes
    return 22;
  },

  //utilities - used in building query strings
  columnNames: function() {
    var columns = "(";
    for(col in this.options.columns) {
      if(col != "id")
        columns += col + ",";
    }
    columns = columns.substr(0, columns.length - 1);
    return columns + ")";
  },
  columnValues: function(data) {
    var values = " VALUES(";
    for(col in this.options.columns) {
      if(col != "id")
        values += this.typeValue(col, data[col]) + ",";
    }
    values = values.substr(0, values.length - 1);
    return values + ");";
  },
  typeValue: function(field, val) {
    if(val == null)
      return "NULL";
    switch(this.options.columns[field]) {
      case "integer":
      case "float":
        return val || this[field];
      case "text":
        return "'" + (val || this[field]) + "'";
    }
  },
  parseFindOptions: function(options) {
    if(!options.select)
      options.select = "*";
    this.sql = "SELECT " + options.select + " FROM " + this.table;
    if(options.conditions)
      this.sql += " WHERE " + options.conditions;
    if(options.order)
      this.sql += " ORDER BY " + options.order;
    if(options.limit)
      this.sql += " LIMIT " + options.limit;
  },
  query: function() {
    puts(this.sql);
  }
});

  //represents model data in memory, necessary to separate "class" methods from "instance" methods
var ThyncRecord = new Class({
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
  },
  destroy: function() {
    if(!this.id)
      throw("Unsaved record cannot be destroyed");
    else
      this.options.model.destroy(this.id);
  },
  save: function() {
    var data = {};
    for(col in this.options.columns)
      data[col] = this[col];
    if(this.id)
      data["id"] = this.id;
    this.id = this.options.model.save(data);
  },
  reload: function() {
    this.options.model.find(this.id);
  }
});

//example model
var Person = new ThyncModel({
  table: "people",
  columns: {
    name: "text",
    company: "text",
    age: "integer"
  }
});

var User = new ThyncModel({
  table: "users",
  columns: {
    login_email: "text",
    password: "text"
  }
});
