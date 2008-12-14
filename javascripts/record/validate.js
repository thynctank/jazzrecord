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
  validatesExclusionOf: function(col, list, errText) {
    if(this[col] && list.contains(this[col])) {
      errText = $defined(errText) ? errText : (col + " is reserved");
      this.pushError(col, errText);
    }
  },
  validatesInclusionOf: function(col, list, errText) {
    if(this[col] && !list.contains(this[col])) {
      errText = $defined(errText) ? errText : (col + " is not included in the list");
      this.pushError(col, errText);
    }
  },
  validatesFormatOf: function(col, regex, errText) {
    val = this[col];
    if (!val.match(regex)) {
      errText = $defined(errText) ? errText : (col + " does not match expected format: " + regex.toString());
      this.pushError(col, errText);
    }  
  },
  validatesLengthOf: function(col, options, errText) {
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
    options = $extend(defaultOptions, options);
    if(!$defined(this[col]) || this[col] && this[col].length && this[col].length >= options.minimum && this[col].length <= options.maximum) {
      if(!$defined(options.is) || (options.is && this[col].length === options.is))
        return;
    }
    if(this[col].length < options.minimum)
      this.pushError(col, options.tooShort);
    if(this[col].length > options.maximum)
      this.pushError(col, options.tooLong);
    if(options.is && this[col].length !== options.is)
      this.pushError(col, options.wrongLength);
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
  validatesUniquenessOf: function(col, errText) {
    var val = this[col];
    var acceptableCount = this.id ? 1 : 0;
    if(this.options.model.findAllBy(col, val).length > acceptableCount) {
      errText = $defined(errText) ? errText : (col + " is not unique");
      this.pushError(col, errText);
    }
  },
  validatesAssociated: function(assoc, errText) {
    if(!$defined(this[assoc]) || (this[assoc] && this[assoc].unloaded))
      return;
    //handle single- or array-based associations
    $splat(this[assoc]).each(function(item) {
      if(!item.isValid()) {
        errText = $defined(errText) ? errText : assoc + " is not valid";
        this.pushError(assoc, errText);
        return;
      }
    }, this);
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
  }
});
