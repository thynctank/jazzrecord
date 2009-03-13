// Primary method for initializing JazzRecord via manual or automigration
JazzRecord.migrate = function(options) {
  JazzRecord.setupSchema();
  if(JazzRecord.getType(options) === "object") {
    // Drop tables
    if(options.refresh) {
      this.models.each(function(model) {
         model.dropTable();
       
         JazzRecord.each(model.options.hasAndBelongsToMany, function(assocTable) {
           var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
           var sql = "DROP TABLE IF EXISTS " + mappingTable;
           JazzRecord.run(sql);
         });
      });
      JazzRecord.setupSchema(true);
    }
  }

  var migrations = {};
  if(JazzRecord.migrations)
    migrations = JazzRecord.migrations;

  // test for apparently-valid obj literal based on migration 1 being present
  if(migrations[1] && JazzRecord.getType(migrations[1]) === "object") {
    var startVersion = JazzRecord.currentSchemaVersion();
    var targetVersion = Infinity;

    // did user specify a migration number?
    if(JazzRecord.getType(options) === "object" && JazzRecord.isDefined(options.number))
      targetVersion = options.number;
    else if(JazzRecord.getType(options) === "number")
      targetVersion = options;

    // actually handle a migrations object
    var i = startVersion;

    do {
      // schema is already up to date
      if(i === targetVersion) {
        JazzRecord.puts("Up to date");
        return;
      }
      // migrate up
      else if(i < targetVersion) {
        i += 1;
        if(JazzRecord.isDefined(migrations[i]))
          migrations[i].up();
        else
          break;
      }
      // migrate down
      else {
        migrations[i].down();
        i -= 1;
      }
      JazzRecord.updateSchemaVersion(i);
    } while(migrations[i]);
  }
  else {
    //developer can choose to use automigrations while in dev mode
    JazzRecord.models.each(function(model) {
      var sql = "CREATE TABLE IF NOT EXISTS " + model.table + "(id INTEGER PRIMARY KEY AUTOINCREMENT";
      JazzRecord.each(model.options.columns, function(colType, colName) {
        if(colName !== "id")
          sql += (", " + colName + " " + colType.toUpperCase());
      });
      sql += ")";
      JazzRecord.run(sql);
      
      JazzRecord.each(model.options.hasAndBelongsToMany, function(assocTable, association) {
        var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
        var localKey = model.options.foreignKey;
        var foreignKey = JazzRecord.models.get(assocTable).options.foreignKey;
        var keys = [localKey, foreignKey].sort();
        var sql = "CREATE TABLE IF NOT EXISTS " + mappingTable + "(" + keys[0] + " INTEGER, " + keys[1] + " INTEGER)";
        JazzRecord.run(sql);
      });
      
      model.options.columns.id = "int";
    });
  }
    
  // handle fixture data, if passed in fixtures erase all old data
  if(options && options.refresh && JazzRecord.fixtures)
    JazzRecord.loadFixtures();
};

JazzRecord.loadFixtures = function() {
  var fixtures = JazzRecord.fixtures;
  JazzRecord.each(fixtures.tables, function(tableData, tableName) {
    JazzRecord.each(tableData, function(record) {
      JazzRecord.models.get(tableName).create(record);
    });
  });
  
  if(!fixtures.mappingTables)
    return;

  JazzRecord.each(fixtures.mappingTables, function(tableData, tableName) {
    JazzRecord.each(tableData, function(colData) {
      var dataHash = new JazzRecord.Hash(colData);
      var sql = "INSERT INTO " + tableName + " (" + dataHash.getKeys().toString() + ") VALUES(" + dataHash.getValues().toString() + ")";
      JazzRecord.run(sql);
    });
  });
};