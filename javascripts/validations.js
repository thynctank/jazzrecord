ThyncRecord.Record.implement({

  validate: function() {
     $each(this.options.columns, function(colType, colName) {
        switch(colType) {
        case "text":
                
        case "number":
                
        case "int":
                
        case "float":
                
        case "bool":
                
        case null:
           throw "Invalid datatype passed to validate";
        
        }
     });
  },
  
  isValid: function() {
    if (this.errors.length != 0)
       return false;
    else
       return true;
  },
  
  validateOnCreate: function() {},
  
  validateonSave: function() {}
  
});
