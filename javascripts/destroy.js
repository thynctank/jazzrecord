ThyncRecord.Model.implement({
  //delete
  destroy: function(id) {
    this.sql = "DELETE FROM " + this.table + " WHERE id=" + id;
    this.query();
  } 
});