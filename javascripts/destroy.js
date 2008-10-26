JazzRecord.Model.implement({
  //delete
  destroy: function(id) {
    var conditions = "";
    if($type(id) === 'number')
      conditions = "WHERE id=" + id;
    else if($type(id) === 'array')
      conditions = "WHERE id IN (" + id + ")";
    this.sql = "DELETE FROM " + this.table + " " + conditions;
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