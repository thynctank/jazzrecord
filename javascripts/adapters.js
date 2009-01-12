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
