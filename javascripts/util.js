ThyncRecord.Model.implement({
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
           return "'" + (val || this[field]) + "'";
        
        case "number":
        case "int":
        case "float":
           return val || this[field];
        
        case "bool":
           if (val || this[field])
              return 1
           else
              return 0;
      
      }
  }
});