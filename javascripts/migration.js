ThyncRecord.Migration = {
  setup: function() {
    this.createTable("schema_migrations", {version: "text"});
    if(ThyncRecord.adapter.count("SELECT COUNT(*) FROM schema_migrations") == 0) {
      var sql = "INSERT INTO schema_migrations (version) VALUES(0)";
      ThyncRecord.adapter.run(sql);
    }
  },
  current: function() {
    var sql = "SELECT version FROM schema_migrations LIMIT 1";
    return ThyncRecord.adapter.run(sql)[0].version;
  },
  update: function(number) {
    var sql = "UPDATE schema_migrations SET version = " + number;
    ThyncRecord.adapter.run(sql);
  },
  createTable: function(name, columns) {
    if(!($defined(name) && $defined(columns))) {
      return;
    }
    var sql = "CREATE TABLE IF NOT EXISTS " + name;
    if(columns) {
      sql += "(";
      $each(columns, function(colType, colName) {
        sql += (colName + " " + colType.toUpperCase() + ", ");
      });
      sql = sql.substr(0, sql.length - 2);
      sql += ")";
      ThyncRecord.adapter.run(sql);
    }
  },
  dropTable: function(name) {
    var sql = "DROP TABLE " + name;
    ThyncRecord.adapter.run(sql);
  },
  renameTable: function(oldName, newName) {
    var sql = "ALTER TABLE " + oldName + " RENAME TO " + newName;
    ThyncRecord.adapter.run(sql);
  },
  addColumn: function(tableName, columnName, dataType) {
    var sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + dataType.toUpperCase();
    ThyncRecord.adapter.run(sql);
  },
  //last three operations will need temp table copy due to sqlite limitations
  removeColumn: function(tableName, columnName) {
    tableName = ThyncRecord.models[tableName].table;
    if(!tableName || !ThyncRecord.models[tableName].options.columns[columnName])
      return;
    var tempTableName = "temp_"+tableName;
    var tempColumns = [];
    $each(ThyncRecord.models[tableName].options.columns, function(tempColumnType, tempColumnName) {
      //alert(tempColumnName+columnName);
      if(tempColumnName != columnName) {
        tempColumns.push({tempColumnName: tempColumnName});
      }
    });
    alert(tempColumns.toSource());
    ThyncRecord.Migration.createTable(tempTableName, tempColumns);
    // Insert each record into the temp table
    ThyncRecord.Migration.dropTable(tableName);
    ThyncRecord.Migration.renameTable(tempTableName, tableName);
    ThyncRecord.Migration.dropTable(tempTableName);
  },
  renameColumn: function(oldName, newName) {},
  changeColumn: function(tableName, columnName, type) {}
};

ThyncRecord.migrate = function(migrations, version) {
  if(migrations.length > 0) {
    ThyncRecord.Migration.setup();
    var startIndex = ThyncRecord.Migration.current();
    var targetIndex = migrations.length - 1;
    if(version)
      targetIndex = version;
    
    if(targetIndex == startIndex) {
      puts("Up to date");  
      return;
    }
    
    //tack in code that only runs migrations starting from most recently-run index
    for(var i = startIndex, j = targetIndex; (targetIndex > startIndex) ? (i < j) : (i > j); (targetIndex > startIndex) ? i++ : i--) {
      m = migrations[i];
      m = (targetIndex > startIndex) ? m.up : m.down;
      var operation = m[0];
      switch (m.length) {
        case 4:
          ThyncRecord.Migration[operation](m[1], m[2], m[3]);
          break;
        case 3:
          ThyncRecord.Migration[operation](m[1], m[2]);
          break;
        case 2:
          ThyncRecord.Migration[operation](m[1]);
      }
      ThyncRecord.Migration.update(i);
    }
  }
  else {
    //developer can choose not to use migrations
    this.models.each(function(model) {
      var sql = "CREATE TABLE IF NOT EXISTS " + model.table + "(id INTEGER PRIMARY KEY AUTOINCREMENT";
      $each(model.options.columns, function(colType, colName) {
        sql += (", " + colName + " " + colType.toUpperCase());
      });
      sql += ")";
      ThyncRecord.adapter.run(sql);
      
      $each(model.options.hasAndBelongsToMany, function(assocTable, association) {
        var mappingTable = [model.table, assocTable].sort().toString().replace(",", "_");
        var localKey = model.options.foreignKey;
        var foreignKey = ThyncRecord.models.get(assocTable).options.foreignKey;
        var keys = [localKey, foreignKey].sort();
        var sql = "CREATE TABLE IF NOT EXISTS " + mappingTable + "(" + keys[0] + " INTEGER, " + keys[1] + " INTEGER)";
        ThyncRecord.adapter.run(sql);
      });
    });
  }
};
