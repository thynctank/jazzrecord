JazzRecord.Record.implement(
{
  validate: function() {
    // executes user-defined validations
    this.options.model.options.validate.apply(this);
  },
  // run validate and determine if current Record is valid
  isValid: function() {
    this.validate();

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
    else
      this.errors.push(errText);
  },
  validatesConfirmationOf: function(col, errText) {
    var val = this[col];
    // App must assign confirmation value, but we shouldn't confuse this as being an actual column. It's a temporary variable.
    var confirmationVal = this[col + "_confirmation"];

    if (val !== confirmationVal || !$defined(confirmationVal) || confirmationVal == "") {
      errText = $defined(errText) ? errText : "does not match";
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
          errText = col + " must not contain " + curValue;
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
    var flatarr = '';
    var passedValidate = false;

    $each(values, function(curValue) {
      flatarr += curValue + ", ";
      if (val.contains(curValue)) {
        passedValidate = true;
      }
    });

    if (!passedValidate) {
      if (!$defined(errText)) {
        errText = col + " must contain at least one of the following: " + flatarr;
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
      return false;
    }
    else {
      return true;
    }
  },
  validatesNumericalityOf: function(col, errText) {
    if (validatesIsInt(col) || validatesIsFloat(col)) {
      return;
    }
    else {
      if (!$defined(errText)) {
        errText = col + " must be numeric";
      }
      this.errors.push(errText);
    }
  },
  validatesPresenceOf: function(col, errText) {
    var val = this[col];

    if (!$defined(val) || val === "") {
      if (!$defined(errText)) {
        errText = col + " must be defined";
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
      errText = col + " must be string";
    }

    this.errors.push(errText);
  },
  validatesIsBool: function(col, errText) {
    var val = this[col];

    if (typeof (val) == "boolean") {
      return;
    }

    if (!$defined(errText)) {
      errText = col + " must be boolean";
    }

    this.errors.push(errText);
  },
  validatesIsInt: function(col, errText) {
    var val = this[col];

    if (typeof (val) == "number") {
      return;
    }

    if (!$defined(errText)) {
      errText = col + " must be int";
    }

    this.errors.push(errText);
  },
  validatesIsFloat: function(col, errText) {
    var val = this[col];

    if (( typeof (val) == "number") && ((val + '').contains("."))) {
      return;
    }

    if (!$defined(errText)) {
      errText = col + " must be boolean";
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
