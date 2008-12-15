JazzRecord.Model.implement({
  //insert or update
  save: function(record) {
    this.sql = "{saveMode} {table} {set} {data} {conditions}";
    var defaultOptions = {saveMode: "INSERT INTO", table: this.table, data: this.columnNames() + this.columnValues(record)};

    var options = {};
    if(record.id) {
      options.id = record.id;
      options.saveMode = "UPDATE";
      options.set = "SET";
      options.conditions = "WHERE id=" + record.id;
      
      options.data = "";
      $each(this.options.columns, function(colType, colName) {
        // implement association logic
        options.data += colName + "=" + this.typeValue(colName, record[colName]) + ", ";
      }, this);
      options.data = options.data.slice(0, -2);
    }
    
    options = $extend(defaultOptions, options);
    
    this.sql = this.sql.substitute(options).clean();
    return JazzRecord.adapter.save(this.sql);
  }
});