JazzRecord.Model.implement({
  //utilities - used in building query strings
  columnNames: function() {
    var columns = "(";
    $each(this.options.columns, function(colType, colName) {
      if(colName != "id")
        columns += colName + ", ";
    });
    columns = columns.substr(0, columns.length - 2);
    return columns + ")";
  },
  columnValues: function(data) {
    var values = " VALUES(";
    $each(this.options.columns, function(colType, colName) {
      if(colName != "id")
        values += this.typeValue(colName, data[colName]) + ", ";
    }, this);
    values = values.substr(0, values.length - 2);
    return values + ")";
  },
  typeValue: function(field, val) {
    if(val == null)
      return "NULL";
    else
      switch(this.options.columns[field]) {
        case "string":
        case "text":
          return "'" + val + "'";
        
        case "int":
          val = val.toInt();
          return $type(val) === "number" ? val : 0;
        case "number":
        case "float":
          val = val.toFloat();
          return $type(val) === "number" ? val : 0;
        
        case "bool":
          if(val)
            return 1;
          else
            return 0;
      }
  }
});