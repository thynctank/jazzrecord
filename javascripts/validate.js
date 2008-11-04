JazzRecord.Record.implement({
  validatesAtCreate: function() {
    this.options.model.options.validate.atCreate.apply(this);
  },
  
  validatesAtUpdate: function() {
    this.options.model.options.validate.atUpdate.apply(this);
  },
  
  validatesAtSave: function() {
    this.options.model.options.validate.atSave.apply(this);
  },

  isValid: function(timing) {
    this.errors = [];
    
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
      default:
        throw("Invalid event passed to isValid(). Expecting 'save', 'create' or 'update'");
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
  validatesFormatOf: function(col, regex, errText) {
    val = this[col];
    if (!val.match(regex)) {
      if (!$defined(errText)) {
        errText = val + " does not match";
      }
      this.errors.push(errText);
    }
  
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
  validatesLengthOf: function(col, options, errText) {
  /*
   Supported options:
 
      minimum: length
      maximum: length
      is: length
      exactly: length
      allow_nil: true or false
  */
    var passedValidation = true;
    
    var val = this[col];
    var defaultOptions = {};
    options = $extend(defaultOptions, options);

    if ($defined(options.minimum)) {
      if (val.length < options.minimum) {
         passedValidation = false;
      }
    }
    
    if ($defined(options.maximum)) {
      if (val.length > options.maximum) {
         passedValidation = false;
      }
    }
    
    if ($defined(options.is) || $defined(options.exactly)) {
      if (val.length !== options.is || val.length !== options.exactly) {
        passedValidation = false;
      }
    }
        
    if ($defined(options.allow_nil)) {
      if (val !== options.allow_nill) {
        passedValidation = false;       
      }
    }
    
    if (!passedValidation) {
      if (!$defined(errText)) {
        errText = "impelement error messages for this later";
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

    if (!val || $type(val) === "string")
      return;

    if (!$defined(errText)) {
      errText = val + " is not a string";
    }

    this.errors.push(errText);
  },
  validatesIsBool: function(col, errText) {
    var val = this[col];

    if($type(val) === "boolean") {
      return;
    }

    if (!$defined(errText)) {
      errText = val + " is not boolean";
    }

    this.errors.push(errText);
  },
  validatesIsInt: function(col, errText) {
    var val = this[col];

    if(!val || val.toInt() === val)
      return;

    errText = val + " is not a int";

    this.errors.push(errText);
  },
  validatesIsFloat: function(col, errText) {
    var val = this[col];
    
    if(!val || val.toFloat() === val)
      return;

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
