// no callbacks, more efficient
JazzRecord.Model.prototype.deleteRecords = function(id) {
  var conditions = "";
  if(JazzRecord.getType(id) === 'number')
    conditions = "WHERE id=" + id;
  else if(JazzRecord.getType(id) === 'array')
    conditions = "WHERE id IN (" + id + ")";
  this.sql = "DELETE FROM " + this.table + " " + conditions;
  this.query();
};

// no callbacks, more efficient
JazzRecord.Model.prototype.deleteAll = function(conditions) {
  this.sql = "DELETE FROM " + this.table;
  if(conditions)
    this.sql += " WHERE " + conditions;
  this.query();
};

JazzRecord.Model.prototype.dropTable = function() {
  this.sql = "DROP TABLE IF EXISTS " + this.table;
  this.query();
};

// callbacks
JazzRecord.Model.prototype.destroy = function(ids) {
  var records = this.find(ids);
  if(JazzRecord.getType(records) === "array") {
    JazzRecord.each(records, function(rec, index) {
      rec.destroy();
    });
    return records;
  }
  else {
    records.destroy();
  }
};

JazzRecord.Model.prototype.destroyAll = function(conditions) {
  var records = this.all({conditions: conditions});
  JazzRecord.each(records, function(rec, index) {
    rec.destroy();
  });
};