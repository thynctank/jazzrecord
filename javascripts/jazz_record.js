var JazzRecord = {
  each: function(collection, iterator, bind) {
    switch(JazzRecord.getType(collection)) {
      case "array": 
        for(var i = 0, l = collection.length; i < l; i++)
          iterator.call(bind, collection[i], i);
        break;
      case "object":
        for(var property in collection) {
          if(collection.hasOwnProperty(property))
            iterator.call(bind, collection[property], property);
        }
        break;
    }
  },
  
  isDefined: function(obj) {
    return !(typeof obj === "undefined");
  },

  // only needs to know basic types and differentiate arrays from other objects
  getType: function(obj) {
    if(typeof obj === "object" && obj.length && typeof obj.length === "number" && obj.sort && typeof obj.sort === "function")
        return "array";
    else
      return typeof obj;
  },
  
  //firebug/air debug function, kill by setting window.debug = false
  puts: function(obj) {
    if(JazzRecord.isDefined(window.debug) && window.debug == false)
      return;
    if(console && console.log) {
      switch(JazzRecord.getType(obj)) {
        case "object":
          console.dir(obj);
          break;
        default:
          console.log(obj);
      }
    }
    if(typeof air !== "undefined") {
      if (air.Introspector && air.Introspector.Console) {
        switch(JazzRecord.getType(obj)) {
          case "string":
            air.Introspector.Console.log(obj);
            break;
          case "object":
            air.Introspector.Console.dump(obj);
            break;
        }
      }
      else
        air.trace(obj);
    }
  },
  
  setOptions: function(options, defaults) {
    if(!options)
      options = {};
    if(!this.options)
      this.options = {};
    for(var opt in defaults) {
      this.options[opt] = options[opt] || defaults[opt];
    }
  },
  
  extend: function(baseClass, options) {
    if(!this.options)
      this.options = {};
    this.parent = new baseClass(options);
    for(var prop in this.parent) {
      this[prop] = this[prop] || this.parent[prop];
    }
    // copy base options over
    for(var opt in this.parent.options) {
      this.options[opt] = this.options[opt] || this.parent.options[opt];
    }
  }
};

JazzRecord.Adapter = function() {
  this.run = this.count = this.save = function(query) {
    JazzRecord.puts(query);
  };
};

JazzRecord.AirAdapter = function(options) {
  var defaults = {
    dbFile: "jazz_record.db"
  };
  JazzRecord.setOptions.call(this, options, defaults);
  JazzRecord.extend.call(this, JazzRecord.Adapter);

  this.connection = new air.SQLConnection();
  this.dbFile = air.File.applicationDirectory.resolvePath(this.options.dbFile);
  this.connection.open(this.dbFile, air.SQLMode.CREATE);
  this.statement = new air.SQLStatement();
  this.statement.sqlConnection = this.connection;
};

JazzRecord.AirAdapter.prototype = {
  run: function(query) {
    this.parent.run(query);
    this.statement.text = query;
    this.statement.execute();
    var result = this.statement.getResult();
    return result.data;
  },
  
  count: function(query) {
    this.parent.count(query);
    query = query.toUpperCase();
    return this.run(query)[0]["COUNT(*)"];
  },
  
  save: function(query) {
    this.parent.save(query);
    this.statement.text = query;
    this.statement.execute();
    return this.statement.getResult().lastInsertRowID;
  }
};

JazzRecord.GearsAdapter = function(options) {
  var defaults = {
    dbFile: "jazz_record.db"
  };
  JazzRecord.setOptions.call(this, options, defaults);
  JazzRecord.extend.call(this, JazzRecord.Adapter);

  this.db = google.gears.factory.create("beta.database");
  this.db.open(this.options.dbFile);
  this.result = null;  
};

JazzRecord.GearsAdapter.prototype = {
  run: function(query) {
    this.parent.run(query);
    this.result = this.db.execute(query);
    var rows = [];
    while(this.result.isValidRow()) {
      var row = {};
      for(var i = 0, j = this.result.fieldCount(); i < j; i++) {
        var field = this.result.fieldName(i);
        row[field] = this.result.field(i);
      }
      rows.push(row);
      this.result.next();
    }
    this.result.close();
    return rows;
  },
  
  count: function(query) {
    this.parent.count(query);
    this.result = this.db.execute(query);
    var number = this.result.field(0);
    this.result.close();
    return number;
  },
  
  save: function(query) {
    this.parent.save(query);
    this.db.execute(query);
    return this.db.lastInsertRowId;
  }
};

JazzRecord.TitaniumAdapter = function(options) {
  JazzRecord.extend.call(this, JazzRecord.GearsAdapter, options);
  this.db = new ti.Database;
  this.db.open(this.options.dbFile);
  this.result = null;
};

// Globals can be overridden in site-specific js
JazzRecord.depth = 1;
JazzRecord.models = new Hash();
JazzRecord.run = function(sql) {
  return JazzRecord.adapter.run(sql);
};
JazzRecord.count = function(sql) {
  return JazzRecord.adapter.count(sql);
};
JazzRecord.save = function(sql) {
  return JazzRecord.adapter.save(sql);
};

// Thanks to Uriel Katz and his JStORM lib (http://labs.urielkatz.com/wiki/JStORM) for this idea
// Specify reason for rollback in thrown exception
JazzRecord.runTransaction = function(func, bind) {
  JazzRecord.run("BEGIN");
  try {
    func.apply(bind || this);
  }
  catch(e) {
    JazzRecord.run("ROLLBACK");
    throw(e);
  }
  JazzRecord.run("END");
};
// Provide one of the following lines in site-specific js prior to calling migrate()
  // JazzRecord.adapter = new JazzRecord.AirAdapter({dbFile: "test.db"});
  // JazzRecord.adapter = new JazzRecord.GearsAdapter({dbFile: "test.db"});