//insert or update
JazzRecord.save = function(table, cols, record) {
  this.sql = "{saveMode} {table} {set} {data} {conditions}";
  var defaultOptions = {saveMode: "INSERT INTO", table: table, data: JazzRecord.columnNames(cols) + JazzRecord.columnValues(cols, record)};
  
  var options = {};
  if(record.originalData) {
    options.saveMode = "UPDATE";
    options.set = "SET";
    options.conditions = "WHERE id=" + record.originalData.id;
    
    options.data = "";
    JazzRecord.each(cols, function(colType, colName) {
      options.data += colName + "=" + JazzRecord.typeValue(cols, colName, record[colName]) + ", ";
    }, this);
    
    options.data = options.data.slice(0, -2);
  }
  
  options = JazzRecord.shallowMerge(defaultOptions, options);
  
  this.sql = JazzRecord.replaceAndClean(this.sql, options);
  return JazzRecord.adapter.save(this.sql);
};

JazzRecord.Model.prototype.save = function(record) {
  return JazzRecord.save(this.table, this.options.columns, record);
};