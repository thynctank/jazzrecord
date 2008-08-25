ThyncRecord.Migration = {
  addTable: function() {},
  removeTable: function() {},
  addColumn: function() {},
  removeColumn: function() {},
  renameColumn: function() {},
  changeColumn: function() {}
};

ThyncRecord.migrate = function() {
  if(this.migrations) {
    this.migrations.each(function(m, index) {
    });
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
