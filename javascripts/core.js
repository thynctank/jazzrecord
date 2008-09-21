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

var AirAdapter = new Class({
  Implements: Options,
  options: {
    dbFile: 'tr.db'
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

var NullAdapter = new Class({
  run: function(query) {
    puts(query);
  },
  count: function(query) {
    puts(query);
    return $random(1, 200);
  }
});

// globals
ThyncRecord.depth = 2;
ThyncRecord.models = new Hash();
ThyncRecord.adapter = new AirAdapter({dbFile: "test.db"});
// ThyncRecord.adapter = new NullAdapter();