ThyncRecord.Record.implement({
  // push errors onto this.errors for every failed validation
  validate: function() {
    $each(this.options.columns, function(colType, colName) {
      switch(colType) {
        case "text":
        case "string":
          break;
        case "number":
          break;
        case "int":
          break;
        case "float":
          break;
        case "bool":
          break;
        default:
          throw "Invalid datatype passed to validate";
      }
    });
    // call user-defined validation
    this.options.model.options.validate.apply(this);
  },
  
  // run validate and determine if current Record is valid
  isValid: function() {
    this.validate();
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
