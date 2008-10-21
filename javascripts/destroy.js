JazzRecord.Model.implement({
  //delete
  destroy: function(id) {
    this.sql = "DELETE FROM " + this.table + " WHERE id=" + id;
    this.query();
  },
  destroyAll: function() {
    this.sql = "DELETE FROM " + this.table;
    this.query();
  },
  dropTable: function() {
     this.sql = "DROP TABLE IF EXISTS " + this.table;
     this.query();
  }
  
});