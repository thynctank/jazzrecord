ThyncRecord.Model.implement({
  //insert or update
  save: function(record) {
    this.sql = "{saveMode} {table} {data} {conditions};";
    var defaultOptions = {saveMode: "INSERT INTO", table: this.table, data: this.columnNames() + this.columnValues(record)};

    var options = {};
    if(record.id) {
      options.id = record.id;
      options.saveMode = "UPDATE";
      options.conditions = "WHERE id=" + record.id;
      
      options.data = "";
      for(col in this.options.columns) {
        // remove association when passed back null reference
        if(col.contains("_id")) {
          var association_reference = col.split("_id")[0];
          if(record[association_reference] && record[col] == record.originalData[col])
            record[col] = record[association_reference].id;
        }
        options.data += col + " = " + this.typeValue(col, record[col]) + ", ";
      }
      options.data = "SET " + options.data.substr(0, options.data.length - 2);
    }
    
    options = $extend(defaultOptions, options);
    
    this.sql = this.sql.substitute(options).clean();
    
    return this.query(options);
  }
});