JazzRecord.setupSchema = function(force) {
  JazzRecord.createTable("schema_migrations", {version: "text"});
  if(JazzRecord.count("SELECT COUNT(*) FROM schema_migrations") === 0) {
    var sql = "INSERT INTO schema_migrations (version) VALUES(0)";
    JazzRecord.run(sql);
  }
  if(force && JazzRecord.count("SELECT COUNT(*) FROM schema_migrations") === 1) {
    var sql = "UPDATE schema_migrations set version = 0";
    JazzRecord.run(sql);
  }
};

JazzRecord.currentSchemaVersion = function() {
  var sql = "SELECT version FROM schema_migrations LIMIT 1";
  return parseInt(JazzRecord.run(sql)[0].version);
};

JazzRecord.updateSchemaVersion = function(number) {
  var sql = "UPDATE schema_migrations SET version = " + number;
  JazzRecord.run(sql);
};

JazzRecord.createTable = function(name, columns) {
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
    JazzRecord.run(sql);
  }
};

JazzRecord.dropTable = function(name) {
  var sql = "DROP TABLE " + name;
  JazzRecord.run(sql);
};

JazzRecord.renameTable = function(oldName, newName) {
  var sql = "ALTER TABLE " + oldName + " RENAME TO " + newName;
  JazzRecord.run(sql);
};

JazzRecord.addColumn = function(tableName, columnName, dataType) {
  var sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + dataType.toUpperCase();
  JazzRecord.run(sql);
};

//last three operations will need temp table copy due to sqlite limitations
JazzRecord.removeColumn = function(tableName, columnName) {
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
  JazzRecord.createTable(tempTableName, tempColumns);
  // Insert each record into the temp table
  JazzRecord.dropTable(tableName);
  JazzRecord.renameTable(tempTableName, tableName);
  JazzRecord.dropTable(tempTableName);
};

JazzRecord.renameColumn = function(oldName, newName) {};
JazzRecord.changeColumn = function(tableName, columnName, type) {};
