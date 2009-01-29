//insert or update
JazzRecord.Model.prototype.save = function(record) {
  this.sql = "{saveMode} {table} {set} {data} {conditions}";
  var defaultOptions = {saveMode: "INSERT INTO", table: this.table, data: this.columnNames() + this.columnValues(record)};

  var options = {};
  if(record.originalData) {
    options.saveMode = "UPDATE";
    options.set = "SET";
    options.conditions = "WHERE id=" + record.originalData.id;
    
    options.data = "";
    JazzRecord.each(this.options.columns, function(colType, colName) {
      options.data += colName + "=" + this.typeValue(colName, record[colName]) + ", ";
    }, this);
    
    options.data = options.data.slice(0, -2);
  }
  
  options = JazzRecord.shallowMerge(defaultOptions, options);
  
  this.sql = JazzRecord.replaceAndClean(this.sql, options);
  return JazzRecord.adapter.save(this.sql);
};