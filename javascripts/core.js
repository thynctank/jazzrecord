//firebug/air debug function, kill w/ global var named prod
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
ThyncRecord.adapter = new ThyncRecord.AirAdapter();

ThyncRecord.AirAdapter = new Class({
  Implements: Options,
  options: {
    dbFile: null,
    connection: null,
    statement: null
  },
  initialize: function() {
    connection = new air.SQLConnection();
    statement = new air.SQLStatement();
    dbFile = new air.File.applicationDirectory.resolvePath('tr.db');
    connection.open(dbFile, air.SQLMode.CREATE);
    statement.sqlConnection = connection;
  },
  run: function(query) {
    this.statement.text = query;
    puts(this.statement.execute());
  }
});
