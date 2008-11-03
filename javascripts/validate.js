JazzRecord.Record.implement(
{
  validatesOnCreate: function() {
    this.options.model.options.validate.onCreate.apply(this);
  },
  
  validatesOnUpdate: function() {
    this.options.model.options.validate.onUpdate.apply(this);
  },
  
  validatesOnSave: function() {
    this.options.model.options.validate.onSave.apply(this);
  },

  isValid: function(event) {
    this.errors = Array();
    
    if (event === "oncreate") {
      this.validatesOnCreate();
    }
    
    else if (event === "onupdate") {
     this.validatesOnUpdate();
    }
    
    else if (event === "onsave") {
      this.validatesOnSave(); 
    }
    
    else {
      throw("Invalid event passed to isValid(). Expecting 'onsave', 'oncreate' or 'onupdate'");
    }

    if (this.errors.length !== 0) {
      return false;
    }
    else {
      return true;
    }
  },
  pushError: function(errDefault, errCustom) {
    /*
      Use this in all the methods eventually to avoid repeating if (!$defined(errText)  etc... 
    */
    var message = errDefault;

    if ($defined(errCustom) && errCustom !== "") {
      message = errCustom;
    }

    this.errors.push(message);
  },
  validatesAcceptanceOf: function(col, errText) {
    var val = this[col];
    errText = $defined(errText) ? errText : (col + " must be accepted");

    if(val)
      return;
    else {
      this.errors.push(errText);
    }
  },
  validatesConfirmationOf: function(col, errText) {
    var val = this[col];
    // App must assign confirmation value, but we shouldn't confuse this as being an actual column. It's a temporary variable.
    var confirmationVal = this[col + "_confirmation"];

    if (val !== confirmationVal || !$defined(confirmationVal) || confirmationVal == "") {
      errText = $defined(errText) ? errText : "doesn't match confirmation";
    }
  },
  validatesExclusionOf: function(col, values, errText) {
    // keyWordsArray Must be an array atm, implement string processing later
    var val = this[col];
    var passedValidate = true;

    $each(values, function(curValue) {
      if (val.contains(curValue)) {
        passedValidate = false;

        if (!$defined(errText)) {
          errText = curValue + " is reserved" + curValue;
        }

        this.errors.push(errText);
      }
    }, this);
    return passedValidate;
  },
  validatesFormatOf: function() {
  // cant believe I missed one lol
  },
  validatesInclusionOf: function(col, values, errText) {
    var val = this[col];
    var passedValidate = false;

    $each(values, function(curValue) {
      if (val.contains(curValue)) {
        passedValidate = true;
      }
    });

    if (!passedValidate) {
      if (!$defined(errText)) {
        errText = val + " is not included in the list";
      }

      this.errors.push(errText);
    }
    return passedValidate;
  },
  validatesLengthOf: function(col, min, max, errText) {
          //options ..
    var val = this[col];

    if ((val.length) > max || (val.length) < min) {
      if (!$defined(errText)) {
        errText = col + " must be between " + min + " and " + max;
      }
      this.errors.push(errText);
    }
  },
  validatesNumericalityOf: function(col, errText) {
    if (validatesIsInt(col) || validatesIsFloat(col)) {
      return;
    }
    
    if (!$defined(errText)) {
      errText = this[col] + " is not a number";
    }
    
    this.errors.push(errText);
  },
  validatesPresenceOf: function(col, errText) {
    var val = this[col];

    if (!$defined(val) || val === "") {
      if (!$defined(errText)) {
        errText = col + " can't be empty, null or blank";
      }

      this.errors.push(errText);
    }
  },
  validatesUniquenessOf: function(col, val, errText) {
    if (findBy(col, val).length > 0) {
      if (!$defined(errText)) {
        errText = val + " is not unique";
      }

      this.errors.push(errText);
    }
  },

  // Generic Validations
  validatesIsString: function(col, errText) {
    var val = this[col];

    if (typeof (val) == "string") {
      return;
    }

    if (!$defined(errText)) {
      errText = val + " is not a string";
    }

    this.errors.push(errText);
  },
  validatesIsBool: function(col, errText) {
    var val = this[col];

    if (typeof (val) == "boolean") {
      return;
    }

    if (!$defined(errText)) {
      errText = val + " is not boolean";
    }

    this.errors.push(errText);
  },
  validatesIsInt: function(col, errText) {
    var val = this[col];

    if (typeof (val) == "number") {
      return;
    }

    if (!$defined(errText)) {
      errText = val + " is not a int";
    }

    this.errors.push(errText);
  },
  validatesIsFloat: function(col, errText) {
    var val = this[col];

    if (( typeof (val) == "number") && ((val + '').contains("."))) {
      return;
    }

    if (!$defined(errText)) {
      errText = col + " is not a float";
    }

    this.errors.push(errText);
  },
  validatesAssociated: function(assocName, errText) {
    // This still isn't working, I'm not sure what the issue is
    var assocValid = true;
    var assocModel = JazzRecord.models.get(this[assocName]);
    var assocKey = assocModel.foreignKey;

    // alternate paths depending on whether associated record is loaded or not
    if (this[assocName].unloaded) {
      if (!assocModel.find(this[assocKey])) {
        assocValid = false;
      }
    }
    else if (!this[assocName].id) {
      assocValid = false;
    }

    if (!$defined(errText)) {
      errText = assocName + " does not exist with ID " + this[assocKey];
    }

    if (!assocValid) {
      this.errors.push(errText);
    }

    return assocValid;
  }
});
