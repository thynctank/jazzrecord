ThyncRecord.Record.implement({
  validate: function() {
    // executes user-defined validations
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

  validatesAcceptanceOf: function(val, errText) {
    if (val == false || val == 0) {

      if(!$defined(errText))
        customMsg = "must be abided";

      this.errors.push(errText);
      return false;
    }
    return true;
  },
  
  validatesAssociated: function(assocName, errText) {
  var assocValid = true;
  var assocModel = ThyncRecord.models.get(this[assocName]);
  var assocKey = assocModel.foreignKey;

  // alternate paths depending on whether associated record is loaded or not
  if(this[assocName].unloaded) {
    if(!assocModel.find(this[assocKey]))
      assocValid = false;
  }
  else if(!this[assocName].id)
    assocValid = false;

  if(!$defined(errText))
    errText = assocName + " does not exist with ID " + this[assocKey];

  if(!assocValid)
    this.errors.push(errText);

  return assocValid;
  },
  
  validatesConfirmationOf: function() {},
  validatesEach: function() {},
  validatesExclusionOf: function() {},
  validatesFormatOf: function() {},
  validatesInclusionOkf: function() {},
  validatesLengthOf: function() {},
  validatesNumericalityOf: function() {},
  validatesPresenceOf: function() {},
  validatesSizeOf: function() {},
  validatesUniquenessOf: function() {},
  // Generic Validations
  validateIsString: function(val) {},
  validateIsBool: function(val) {},
  validateIsInt: function(val) {},
  validateIsFloat: function(val) {}

});
