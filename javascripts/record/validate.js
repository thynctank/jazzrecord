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

    if ($H(this.errors).toQueryString() === "") {
      return true;
    }
    else {
      return false;
    }
  },
  pushError: function(col, errText) {
    if(!this.errors[col]) {
      this.errors[col] = [];      
    }
    this.errors[col].push(errText);
  },
  validatesAcceptanceOf: function(col, errText) {
    var val = this[col];
    if(val && $chk(val) && $type(val) === "boolean")
      return;
    
    errText = $defined(errText) ? errText : (col + " must be accepted");
    this.pushError(col, errText);
  },
  validatesConfirmationOf: function(col, errText) {
    var val = this[col];
    // App must assign confirmation value, but we shouldn't confuse this as being an actual column. It's a temporary variable.
    var confirmationVal = this[col + "_confirmation"];

    if (val !== confirmationVal || !$defined(confirmationVal) || confirmationVal == "") {
      errText = $defined(errText) ? errText : col + " doesn't match confirmation";
      this.pushError(col, errText);
    }
  },
  validatesExclusionOf: function(col, values, errText) {
    // keyWordsArray Must be an array atm, implement string processing later
    var val = this[col];
    var passedValidate = true;

    $each(values, function(curValue) {
      if (val.toUpperCase() === curValue.toUpperCase()) {
        passedValidate = false;

        if (!$defined(errText)) {
          errText = curValue + " is reserved";
        }

        this.pushError(col, errText);
      }
    }, this);
    return passedValidate;
  },
  validatesFormatOf: function(col, regex, errText) {
    val = this[col];
    if (!val.match(regex)) {
      errText = $defined(errText) ? errText : (col + " does not match expected format: " + regex.toString());
      this.pushError(col, errText);
    }  
  },
  validatesInclusionOf: function(col, values, errText) {
    var val = this[col];
    var passedValidate = false;

    $each(values, function(curValue) {
      if (val.toUpperCase() === curValue.toUpperCase()) {
        passedValidate = true;
      }
    });

    if (!passedValidate) {
      if (!$defined(errText)) {
        errText = val + " is not included in the list";
      }

      this.pushError(col, errText);
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
        errText = "length out of bounds";
      }
      this.pushError(col, errText);
    }

  },
  validatesNumericalityOf: function(col, errText) {
    var val = this[col];
    if(val && $chk(val) && $type(val) !== "number") {
      errText = $defined(errText) ? errText : (col + " is not a number"); 
      this.pushError(col, errText);      
    }
  },
  validatesPresenceOf: function(col, errText) {
    var val = this[col];

    if(!$defined(val) || val === "") {
      errText = $defined(errText) ? errText : (col + " can't be empty, null or blank");
      this.pushError(col, errText);
    }
  },
  validatesUniquenessOf: function(col, val, errText) {
    if(findAllBy(col, val).length > 1) {
      errText = $defined(errText) ? errText : (col + " is not unique");
      this.pushError(col, errText);
    }
  },

  // Generic Validations
  validatesIsString: function(col, errText) {
    var val = this[col];

    if($type(val) && $type(val) !== "string") {
      errText = $defined(errText) ? errText : (col + " is not a string");
      this.pushError(col, errText);        
    }
  },
  validatesIsBool: function(col, errText) {
    var val = this[col];

    if($type(val) && $type(val) !== "boolean") {
      errText = $defined(errText) ? errText : (col + " is not a bool");
      this.pushError(col, errText);
    }
  },
  validatesIsInt: function(col, errText) {
    var val = this[col];

    if($type(val))
      if($type(val) !== "number" || val.toInt() !== val) {
        errText = $defined(errText) ? errText : (col + " is not an integer");
        this.pushError(col, errText);      
      }    
  },
  validatesIsFloat: function(col, errText) {
    var val = this[col];
    
    if($type(val))
      if($type(val) !== "number" || val.toFloat() !== val) {
        errText = $defined(errText) ? errText : (col + " is not an float");
        this.pushError(col, errText);      
      }    
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
      this.pushError(col, errText);
    }

    return assocValid;
  }
});
