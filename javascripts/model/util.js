//utilities - used in building query strings
JazzRecord.Model.prototype.columnNames = function() {
  var columns = "(";
  JazzRecord.each(this.options.columns, function(colType, colName) {
    if(colName != "id")
      columns += colName + ", ";
  });
  columns = columns.substr(0, columns.length - 2);
  return columns + ")";
};

JazzRecord.Model.prototype.columnValues = function(data) {
  var values = " VALUES(";
  JazzRecord.each(this.options.columns, function(colType, colName) {
    if(colName != "id")
      values += this.typeValue(colName, data[colName]) + ", ";
  }, this);
  values = values.substr(0, values.length - 2);
  return values + ")";
};

JazzRecord.Model.prototype.typeValue = function(field, val) {
  if(val == null)
    return "NULL";
  else
    switch(this.options.columns[field]) {
      case "string":
      case "text":
        return "'" + val + "'";
      
      case "int":
        val = parseInt(val, 10);
        return JazzRecord.getType(val) === "number" ? val : 0;
      case "number":
      case "float":
        val = parseFloat(val);
        return JazzRecord.getType(val) === "number" ? val : 0;
      
      case "bool":
        if(val)
          return 1;
        else
          return 0;
    }
};