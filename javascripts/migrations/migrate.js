// Primary method for initializing JazzRecord via manual or automigration
JazzRecord.migrate = function(options) {
  if(!options)
    options = {};

  var migrations = {};
  if(options.migrations)
    migrations = options.migrations;
    
  // test for apparently-valid obj literal based on migration 1 being present
  if(migrations[1] && JazzRecord.getType(migrations[1]) === "object") {
    JazzRecord.setupSchema();
    var startIndex = JazzRecord.currentSchemaVersion();
    var targetIndex = Infinity;

    // did user specify a migration number?
    if(options.version)
      targetIndex = options.version;
    
    // schema is already up to date
    if(targetIndex === startIndex) {
      JazzRecord.puts("Up to date");
      return;
    }
    else {
      // actually handle a migrations object
      var i = startIndex;
      while(migrations[i]) {
        // migrate up
        if(i < targetIndex) {
          migrations[i].up();
          i += 1;
        }
        // migrate down
        else {
          migrations[i].down();
          i -= 1;
        }
      }
    }
  }
  else {
    //developer can choose not to use migrations while in dev mode
    
    // Drop tables
    if(options.refresh)
      this.models.each(function(model) {
         model.dropTable();
       
         JazzRecord.each(model.options.hasAndBelongsToMany, function(assocTable) {
           var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
           var sql = "DROP TABLE IF EXISTS " + mappingTable;
           JazzRecord.run(sql);
         });
      });
      
    this.models.each(function(model) {
      var sql = "CREATE TABLE IF NOT EXISTS " + model.table + "(id INTEGER PRIMARY KEY AUTOINCREMENT";
      JazzRecord.each(model.options.columns, function(colType, colName) {
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
    });
  }
  
  // handle fixture data, if passed in fixtures erase all old data
  if(options.fixtures)
    this.loadFixtures(options.fixtures);
    
};

JazzRecord.loadFixtures = function(fixtures) {
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