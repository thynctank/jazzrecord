JazzRecord.Record.prototype.validatesAtCreate = function() {
  this.options.model.options.validate.atCreate.apply(this);
};
  
JazzRecord.Record.prototype.validatesAtUpdate = function() {
  this.options.model.options.validate.atUpdate.apply(this);
};
  
JazzRecord.Record.prototype.validatesAtSave = function() {
  this.options.model.options.validate.atSave.apply(this);
};

JazzRecord.Record.prototype.isValid = function(timing) {
  switch(timing) {
    case "create":
      this.validatesAtCreate();
      break;
    case "update":
      this.validatesAtUpdate();
      break;
    case "save":
      this.validatesAtSave();
      break;
    // if no string is passed in (ie it was called by user) run validation based on presence of ID
    default:
      this.errors = {};
      if(this.id) {
        this.validatesAtUpdate();
        this.validatesAtSave();
      }
      else {
        this.validatesAtCreate();
        this.validatesAtSave();
      }
  }
  
  var errorPropCount = 0;
  for(var prop in this.errors) {
    errorPropCount++;
  }

  if(errorPropCount === 0) {
    return true;
  }
  else {
    return false;
  }
};

JazzRecord.Record.prototype.pushError = function(col, errText) {
  if(!this.errors[col]) {
    this.errors[col] = [];
  }
  this.errors[col].push(errText);
};

JazzRecord.Record.prototype.validatesAcceptanceOf = function(col, errText) {
  var val = this[col];
  if(val && JazzRecord.isDefined(val) && JazzRecord.getType(val) === "boolean")
    return;
  
  errText = JazzRecord.isDefined(errText) ? errText : (col + " must be accepted");
  this.pushError(col, errText);
};

JazzRecord.Record.prototype.validatesConfirmationOf = function(col, errText) {
  var val = this[col];
  // App must assign confirmation value, but we shouldn't confuse this as being an actual column. It's a temporary variable.
  var confirmationVal = this[col + "_confirmation"];

  if (val !== confirmationVal || !JazzRecord.isDefined(confirmationVal) || confirmationVal == "") {
    errText = JazzRecord.isDefined(errText) ? errText : col + " doesn't match confirmation";
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesExclusionOf = function(col, list, errText) {
  if(this[col] && JazzRecord.indexOf(list, this[col]) > -1) {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is reserved");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesInclusionOf = function(col, list, errText) {
  if(this[col] && !(JazzRecord.indexOf(list, this[col]) > -1)) {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is not included in the list");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesFormatOf = function(col, regex, errText) {
  val = this[col];
  if (val && !val.match(regex)) {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " does not match expected format: " + regex.toString());
    this.pushError(col, errText);
  }  
};

JazzRecord.Record.prototype.validatesLengthOf = function(col, options, errText) {
/*
 Supported options:
    minimum: length
    maximum: length
    is: exact length
    allowEmpty: true or false
    tooShort: error message
    tooLong: error message
    wrongLength: error message
*/
  var defaultOptions = {minimum: 0, maximum: Infinity, allowEmpty: true, tooShort: col + " is too short", tooLong: col + " is too long", wrongLength: col + " is not the correct length"};
  options = JazzRecord.shallowMerge(defaultOptions, options);
  if(!JazzRecord.isDefined(this[col]) || this[col] && this[col].length && this[col].length >= options.minimum && this[col].length <= options.maximum) {
    if(!JazzRecord.isDefined(options.is) || (options.is && this[col].length === options.is))
      return;
  }
  if(this[col].length < options.minimum)
    this.pushError(col, options.tooShort);
  if(this[col].length > options.maximum)
    this.pushError(col, options.tooLong);
  if(options.is && this[col].length !== options.is)
    this.pushError(col, options.wrongLength);
};

JazzRecord.Record.prototype.validatesNumericalityOf = function(col, errText) {
  var val = this[col];
  if(val && JazzRecord.isDefined(val) && JazzRecord.getType(val) !== "number") {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is not a number"); 
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesPresenceOf = function(col, errText) {
  var val = this[col];

  if(!JazzRecord.isDefined(val) || val === "") {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " can't be empty, null or blank");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesUniquenessOf = function(col, errText) {
  var val = this[col];
  var existingRecord = this.options.model.findBy(col, val, 0);
  if(existingRecord && existingRecord.id != this.id) {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is not unique");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesAssociated = function(assoc, errText) {
  if(!JazzRecord.isDefined(this[assoc]) || (this[assoc] && this[assoc].unloaded))
    return;
  //handle single- or array-based associations
  var assocArray = [];
  if(JazzRecord.getType(this[assoc]) === "array")
    assocArray = this[assoc];
  else
    assocArray = [this[assoc]];
  JazzRecord.each(assocArray, function(item) {
    if(item && !item.isValid()) {
      errText = JazzRecord.isDefined(errText) ? errText : assoc + " is not valid";
      this.pushError(assoc, errText);
      return;
    }
  }, this);
};

// Generic Validations
JazzRecord.Record.prototype.validatesIsString = function(col, errText) {
  var val = this[col];

  if(JazzRecord.getType(val) && JazzRecord.getType(val) !== "string") {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is not a string");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesIsBool = function(col, errText) {
  var val = this[col];

  if(JazzRecord.getType(val) && JazzRecord.getType(val) !== "boolean") {
    errText = JazzRecord.isDefined(errText) ? errText : (col + " is not a bool");
    this.pushError(col, errText);
  }
};

JazzRecord.Record.prototype.validatesIsInt = function(col, errText) {
  var val = this[col];

  if(JazzRecord.getType(val))
    if(JazzRecord.getType(val) !== "number" || parseInt(val, 10) !== val) {
      errText = JazzRecord.isDefined(errText) ? errText : (col + " is not an integer");
      this.pushError(col, errText);
    }
};

JazzRecord.Record.prototype.validatesIsFloat = function(col, errText) {
  var val = this[col];
  
  if(JazzRecord.getType(val))
    if(JazzRecord.getType(val) !== "number" || parseFloat(val) !== val) {
      errText = JazzRecord.isDefined(errText) ? errText : (col + " is not an float");
      this.pushError(col, errText);
    }
};
