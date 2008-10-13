ThyncRecord.Record.implement({

  validate: function() {
     $each(this.options.columns, function(colType, colName) {
        switch(colType) {
        case "text":
	case "string":
                puts("String: " + colName);
        case "number":
                puts("Number: " + colName);
        case "int":
                puts("int: " + colName);
        case "float":
                puts("float: " + colName);
        case "bool":
                puts("bool: " + colName);
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
  
  validateOnSave: function() {},

  validates_acceptance_of: function() {},
  validates_associated: function() {},
  validates_confirmation_of: function() {},
  validates_each: function() {},
  validates_exclusion_of: function() {},
  validates_format_of: function() {},
  validates_inclusion_of: function() {},
  validates_length_of: function() {},
  validates_numericality_of: function() {},
  validates_presence_of: function() {},
  validates_size_of: function() {},
  validates_uniqueness_of: function() {}
  
});
