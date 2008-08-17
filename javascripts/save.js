ThyncRecord.Model.implement({
  //insert or update
  save: function(data) {
    this.sql = "{saveMode} {table} {data} {conditions};";
    var defaultOptions = {saveMode: "INSERT INTO", table: this.table, data: this.columnNames() + this.columnValues(data)};
    
    var options = {};
    if(data.id) {
      options.id = data.id;
      options.saveMode = "UPDATE";
      options.conditions = "WHERE id=" + data.id;
      
      options.data = "";
      for(col in this.options.columns) {
        // remove association when passed back null reference
        if(col.contains("_id")) {
          var association_reference = col.split("_id")[0];
          if(data[association_reference])
            data[col] = data[association_reference].id;
          else
            data[col] = null;
        }
        options.data += col + " = " + this.typeValue(col, data[col]) + ", ";
      }
      options.data = "SET " + options.data.substr(0, options.data.length - 2);
    }
    
    options = $extend(defaultOptions, options);
    
    this.sql = this.sql.substitute(options).clean();
    return this.query(options);
  }
});