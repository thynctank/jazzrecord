ThyncRecord.Migration = {
  createTable: function(name, columns) {
    if(!($defined(name) && $defined(columns))) {
      return;
    }
    var sql = "CREATE TABLE IF NOT EXISTS " + name;
    if (columns) {
      sql += "(";
      for (col in columns) {
        sql += (col + " " + columns[col].toUpperCase() + ", ");
      }
      sql = sql.substr(0, sql.length - 2);
      sql += ");";
      ThyncRecord.adapter.run(sql);
    }
  },
  dropTable: function(name) {
    var sql = "DROP TABLE " + name + ";";
    ThyncRecord.adapter.run(sql);
  },
  renameTable: function(oldName, newName) {
    var sql = "ALTER TABLE " + oldName + " RENAME TO " + newName + ";";
    ThyncRecord.adapter.run(sql);
  },
  addColumn: function(tableName, columnName, dataType) {
    var sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + dataType.toUpperCase() + ";";
    ThyncRecord.adapter.run(sql);
  },
  //last three mods will need temp table copy due to sqlite limitations
  removeColumn: function(tableName, columnName) {},
  renameColumn: function(oldName, newName) {},
  changeColumn: function(tableName, columnName, type) {}
};

ThyncRecord.migrate = function(startIndex) {
  if(this.migrations) {
    //tack in code that only runs migrations starting from most recently-run index
    for( var i = startIndex || 0, j = this.migrations.length; i < j; i++) {
      m = this.migrations[i];
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
    }
  }
  else {
    this.models.each(function(model) {
      model.sql = "CREATE TABLE IF NOT EXISTS " + model.table + "(id INTEGER PRIMARY KEY AUTOINCREMENT";
      for(col in model.options.columns) {
        model.sql += (", " + col + " " + model.options.columns[col].toUpperCase());
      }
      model.sql += ");";
      model.query();
    });
  }
}
