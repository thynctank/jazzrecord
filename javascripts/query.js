ThyncRecord.Model.implement({
  query: function(options) {
    if(typeof options == "undefined")
      options = {};
    // run query on SQLite

    var data = ThyncRecord.adapter.run(this.sql);

    if(!data || data.length == 0) {
      puts("Found Nothing");
      return;
    }
        
    if(this.sql.contains("LIMIT 1")) {
      data = data[0];
      
      // implement eager/lazy loading for associations
      
      var errors = {};
      var record = new ThyncRecord.Record({
        model: this,
        columns: this.options.columns,
        data: data,
        errors: errors
      });
      
      $each(this.options.hasOne, function(table, assoc) {
        var foreignId = data[assoc + "_id"];
        if(foreignId)
          record[assoc] = ThyncRecord.models.get(table).find(foreignId);
      });
      
      $each(this.options.hasMany, function(table, assoc) {
        record[assoc] = ThyncRecord.models.get(table).findAllBy(this.options.foreignKey, data.id);
      }, this);
      
      $each(this.options.belongsTo, function(table, assoc) {
        var foreignId = data[assoc + "_id"];
        if(foreignId)
          record[assoc] = ThyncRecord.models.get(table).find(foreignId);
      });
      
      $each(this.options.hasAndBelongsToMany, function(foreignTable, assoc) {
        // var tableInfo = {
        //   mappingTable: [this.table, table].sort().toString().replace(",", "_"),
        //   foreignTable: foreignTable,
        //   foreignKey: ThyncRecord.models.get(foreignTable).foreignKey,
        //   localTable: this.table,
        //   id: data.id
        // };
        // this.sql = "SELECT * FROM {mappingTable} INNER JOIN {foreignTable} ON {mappingTable}.{foreignKey} = {foreignTable}.id WHERE {localTable}.id = {id}";
        // this.sql = this.sql.substitute(tableInfo);
        // debugger;
        // var mapResults = this.query();
        // if(mapResults[0][this.options.foreignKey]) {
        //   var assocRecords = [];
        //   $each(mapResults, function(row) {
        //     var foreignId = mappingTable.findBy(this.options.foreignKey, data.id);
        //     
        //   });
        // }
        // record[assoc] = ThyncRecord.models.get(this.table)
      }, this);
      
      return record;
    }
    else {
      var records = [];
      $each(data, function(row) {
        records.push(new ThyncRecord.Record({
          model: this,
          columns: this.options.columns,
          data: row,
          errors: {}
        }));
      }, this);
      return records;
    }
  }  
});