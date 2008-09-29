//firebug/air debug function, kill w/ global var named prod
function puts(str) {
  if(window.debug && window.debug == false)
    return;
  if(window.console && console.log) {
    if($type(str) == "string") 
      console.log(str);
    else 
      if($type(str) == "object") 
        console.dir(str);
  }
  if(Browser.Features.air && air) {
    if (air.Introspector && air.Introspector.Console) {
      switch($type(str)) {
        case "string":
          air.Introspector.Console.log(str);
          break;
        case "object":
          air.Introspector.Console.dump(str);
          break;
      }
    }
    else
      air.trace(str);
  }
}


var ThyncRecord = {};

ThyncRecord.AirAdapter = new Class({
  Implements: Options,
  options: {
    dbFile: "thyncrecord.db"
  },
  initialize: function(options) {
    this.setOptions(options);
    this.connection = new air.SQLConnection();
    this.dbFile = air.File.applicationDirectory.resolvePath(this.options.dbFile);
    this.connection.open(this.dbFile, air.SQLMode.CREATE);
    this.statement = new air.SQLStatement();
    this.statement.sqlConnection = this.connection;
  },
  run: function(query) {
    puts(query);
    this.statement.text = query;
    this.statement.execute();
    var result = this.statement.getResult();
    return result.data;
  },
  count: function(query) {
    puts(query);
    query = query.toUpperCase();
    return this.run(query)[0]["COUNT(*)"];
  },
  save: function(query) {
    puts(query);
    this.statement.text = query;
    this.statement.execute();
    return this.statement.getResult().lastInsertRowID;
  }
});

ThyncRecord.GearsAdapter = new Class({
  Implements: Options,
  options: {
    dbName: "thyncrecord.db"
  },
  initialize: function(options) {
    this.setOptions(options);
    this.db = google.gears.factory.create("beta.database");
    this.db.open(this.dbName);
    this.result = null;
  },
  run: function(query) {
    puts(query);
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
    return rows;
  },
  count: function(query) {
    puts(query);
    this.result = this.db.execute(query);
    return this.result.field(0);
  },
  save: function(query) {
    puts(query);
    this.db.execute(query);
    return this.db.lastInsertRowId;
  }
});

// globals
ThyncRecord.depth = 1;
ThyncRecord.models = new Hash();
// ThyncRecord.adapter = new ThyncRecord.AirAdapter({dbFile: "test.db"});
ThyncRecord.adapter = new ThyncRecord.GearsAdapter({dbFile: "test"});