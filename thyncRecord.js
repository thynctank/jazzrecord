var thyncRecord = new Class({
    Implements: Options,
    options: {
      columns: {},
      id: null,
    },
    initialize: function(options) {
      this.setOptions(options);
      this.sql = "";
      this.order = "ASC";
    },
    count: function() {
      this.sql = "SELECT COUNT(*) FROM " + this.options.table + ";";
      return this.sql;
    },
    find: function(options) {
      if(!options)
        this.sql = "SELECT * FROM " + this.options.table + ";";
      else {
        if(!options.columns)
          options.columns = "*";
        this.sql = "SELECT " + options.columns + " FROM " + this.options.table;
        if(options.conditions)
          this.sql += " " + options.conditions;
        if(options.order)
          this.sql += " ORDER BY " + options.order;
        this.sql += ";";
      }      
      return this;
      //run query, assign results to array of new thyncRecord objects that can be individually overwritten
    },
    find_by: function(column, value) {
      this.sql = "SELECT * FROM " + this.options.table + " WHERE " + column + "=" + this.typeValue(column, value);
      return this;
    },
    first: function(options) {
      if(!options) {
        var options = {};
      }
      if(!options.columns)
        options.columns = "*";
      this.sql = "SELECT " + options.columns + " FROM " + this.options.table;
      if(options.conditions)
        this.sql += " " + options.conditions;
      this.sql += " LIMIT 1;";
      return this;
    },
    last: function(options) {
      if(!options) {
        var options = {};
      }
      if(!options.columns)
        options.columns = "*";
      this.sql = "SELECT " + options.columns + " FROM " + this.options.table;
      if(options.conditions)
        this.sql += " " + options.conditions;
      this.sql += " DESC LIMIT 1;";
      return this;
    },
    create: function(options) {
      for(col in this.options.columns) {
        this[col] = options[col] || null;
      }
      return this;
    },
    destroy: function() {
      this.sql = "DELETE FROM " + this.options.table + " WHERE id=" + this.id + ";";
      //call delete query
    },
    save: function() {
      if(this.id == null) {
        this.sql = "INSERT INTO " + this.options.table + " " + this.columnNames() + this.columnValues();
      }
      else {
        this.sql = "UPDATE " + this.options.table + " SET ";
        for(col in this.options.columns) {
          this.sql += col + "=" + this.typeValue(col) + ",";
        }
        this.sql = this.sql.substr(0, this.sql.length - 1);
        this.sql += " WHERE id=" + this.id + ";";
      }
      return this.sql;
    },
    reload: function() {
      //call sql query again
    },

//utilities
    columnNames: function() {
      var columns = "(";
      for(col in this.options.columns) {
        if(col != "id")
          columns += col + ",";
      }
      columns = columns.substr(0, columns.length - 1);
      return columns + ")";
    },
    columnValues: function() {
      var values = " VALUES(";
      for(col in this.options.columns) {
        if(col != "id")
          values += this.typeValue(col) + ",";
      }
      values = values.substr(0, values.length - 1);
      return values + ");";
    },
    typeValue: function(col, val) {
      switch(this.options.columns[col]) {
        case "number":
          return val || this[col];
        case "text":
          return "'" + (val || this[col]) + "'";
      }
    }
});

//example model
var Person = new thyncRecord({
    table: "people",
    columns: {
        id: "number",
        name: "text",
        company: "text"
    }
});
