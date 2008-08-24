ThyncRecord.Migration = {
  addTable: function() {},
  removeTable: function() {},
  addColumn: function() {},
  removeColumn: function() {},
  renameColumn: function() {},
  changeColumn: function() {}
};

ThyncRecord.Model.implement({
  migrate: function(migrations) {
    migrations.each(function(m, index) {
      puts("Migration " + index + ": ");
      ThyncRecord.Migration[m.command](this.table);
    });
  }
});
