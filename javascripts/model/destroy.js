JazzRecord.Model.prototype.destroy = function(id) {
  var conditions = "";
  if(JazzRecord.getType(id) === 'number')
    conditions = "WHERE id=" + id;
  else if(JazzRecord.getType(id) === 'array')
    conditions = "WHERE id IN (" + id + ")";
  this.sql = "DELETE FROM " + this.table + " " + conditions;
  this.query();
};

JazzRecord.Model.prototype.destroyAll = function() {
  this.sql = "DELETE FROM " + this.table;
  this.query();
};

JazzRecord.Model.prototype.dropTable = function() {
     this.sql = "DROP TABLE IF EXISTS " + this.table;
     this.query();
};
