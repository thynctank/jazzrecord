JazzRecord.Migration = {
  setup: function() {
    this.createTable("schema_migrations", {version: "text"});
    if(JazzRecord.adapter.count("SELECT COUNT(*) FROM schema_migrations") == 0) {
      var sql = "INSERT INTO schema_migrations (version) VALUES(0)";
      JazzRecord.adapter.run(sql);
    }
  },
  current: function() {
    var sql = "SELECT version FROM schema_migrations LIMIT 1";
    return JazzRecord.adapter.run(sql)[0].version;
  },
  update: function(number) {
    var sql = "UPDATE schema_migrations SET version = " + number;
    JazzRecord.adapter.run(sql);
  },
  createTable: function(name, columns) {
    if(!(JazzRecord.isDefined(name) && JazzRecord.isDefined(columns))) {
      return;
    }
    var sql = "CREATE TABLE IF NOT EXISTS " + name;
    if(columns) {
      sql += "(";
      JazzRecord.each(columns, function(colType, colName) {
        sql += (colName + " " + colType.toUpperCase() + ", ");
      });
      sql = sql.substr(0, sql.length - 2);
      sql += ")";
      JazzRecord.adapter.run(sql);
    }
  },
  dropTable: function(name) {
    var sql = "DROP TABLE " + name;
    JazzRecord.adapter.run(sql);
  },
  renameTable: function(oldName, newName) {
    var sql = "ALTER TABLE " + oldName + " RENAME TO " + newName;
    JazzRecord.adapter.run(sql);
  },
  addColumn: function(tableName, columnName, dataType) {
    var sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + dataType.toUpperCase();
    JazzRecord.adapter.run(sql);
  },
  //last three operations will need temp table copy due to sqlite limitations
  removeColumn: function(tableName, columnName) {
    tableName = JazzRecord.models[tableName].table;
    if(!tableName || !JazzRecord.models[tableName].options.columns[columnName])
      return;
    var tempTableName = "temp_"+tableName;
    var tempColumns = [];
    JazzRecord.each(JazzRecord.models[tableName].options.columns, function(tempColumnType, tempColumnName) {
      //alert(tempColumnName+columnName);
      if(tempColumnName != columnName) {
        tempColumns.push({tempColumnName: tempColumnName});
      }
    });
    alert(tempColumns.toSource());
    JazzRecord.Migration.createTable(tempTableName, tempColumns);
    // Insert each record into the temp table
    JazzRecord.Migration.dropTable(tableName);
    JazzRecord.Migration.renameTable(tempTableName, tableName);
    JazzRecord.Migration.dropTable(tempTableName);
  },
  renameColumn: function(oldName, newName) {},
  changeColumn: function(tableName, columnName, type) {}
};

JazzRecord.migrate = function(options) {
  if(!options)
    options = {};
  if(!options.migrations)
    var migrations = [];
  if(migrations.length > 0) {
    JazzRecord.Migration.setup();
    var startIndex = JazzRecord.Migration.current();
    var targetIndex = migrations.length - 1;
    if(options.version)
      targetIndex = options.version;
    
    if(targetIndex == startIndex) {
      JazzRecord.puts("Up to date");
      return;
    }
    
    //tack in code that only runs migrations starting from most recently-run index
    for(var i = startIndex, j = targetIndex; (targetIndex > startIndex) ? (i < j) : (i > j); (targetIndex > startIndex) ? i++ : i--) {
      var m = migrations[i];
      m = (targetIndex > startIndex) ? m.up : m.down;
      var operation = m[0];
      switch (m.length) {
        case 4:
          JazzRecord.Migration[operation](m[1], m[2], m[3]);
          break;
        case 3:
          JazzRecord.Migration[operation](m[1], m[2]);
          break;
        case 2:
          JazzRecord.Migration[operation](m[1]);
      }
      JazzRecord.Migration.update(i);
    }
  }
  else {
    //developer can choose not to use migrations
    
    // Drop tables
    if(options.refresh)
      this.models.each(function(model) {
         model.dropTable();
       
         JazzRecord.each(model.options.hasAndBelongsToMany, function(assocTable) {
           var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
           var sql = "DROP TABLE IF EXISTS " + mappingTable;
           JazzRecord.adapter.run(sql);
         });
      });
      
    this.models.each(function(model) {
      var sql = "CREATE TABLE IF NOT EXISTS " + model.table + "(id INTEGER PRIMARY KEY AUTOINCREMENT";
      JazzRecord.each(model.options.columns, function(colType, colName) {
        sql += (", " + colName + " " + colType.toUpperCase());
      });
      sql += ")";
      JazzRecord.adapter.run(sql);
      
      JazzRecord.each(model.options.hasAndBelongsToMany, function(assocTable, association) {
        var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
        var localKey = model.options.foreignKey;
        var foreignKey = JazzRecord.models.get(assocTable).options.foreignKey;
        var keys = [localKey, foreignKey].sort();
        var sql = "CREATE TABLE IF NOT EXISTS " + mappingTable + "(" + keys[0] + " INTEGER, " + keys[1] + " INTEGER)";
        JazzRecord.adapter.run(sql);
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
      var dataHash = $H(colData);
      var sql = "INSERT INTO " + tableName + " (" + dataHash.getKeys().toString() + ") VALUES(" + dataHash.getValues().toString() + ")";
      JazzRecord.adapter.run(sql);      
    });
  });
};