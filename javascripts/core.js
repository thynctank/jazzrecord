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
      if($type(str) == "string")
        air.Introspector.Console.log(str);
      else
        if($type(str) == "object")
          air.Introspector.Console.dump(str);
    }
    else 
      air.trace(str);
  }
}


var ThyncRecord = {};

ThyncRecord.AirAdapter = new Class({
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
    query = query.toUpperCase();
    return this.run(query)[0]["COUNT(*)"];
  }
});

// globals
ThyncRecord.depth = 2;
ThyncRecord.models = new Hash();
ThyncRecord.adapter = new ThyncRecord.AirAdapter({dbFile: "test.db"});