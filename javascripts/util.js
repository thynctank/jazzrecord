ThyncRecord.Model.implement({
  //utilities - used in building query strings
  columnNames: function() {
    var columns = "(";
    for(col in this.options.columns) {
      if(col != "id")
        columns += col + ", ";
    }
    columns = columns.substr(0, columns.length - 2);
    return columns + ")";
  },
  columnValues: function(data) {
    var values = " VALUES(";
    for(col in this.options.columns) {
      if(col != "id")
        values += this.typeValue(col, data[col]) + ", ";
    }
    values = values.substr(0, values.length - 2);
    return values + ")";
  },
  typeValue: function(field, val) {
    if(val == null)
      return "NULL";
    else
      switch(this.options.columns[field]) {
        case "number":
          return val || this[field];
        case "text":
          return "'" + (val || this[field]) + "'";
      }
  }  
});