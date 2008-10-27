JazzRecord.Record.implement({

/*
  Nick -- I'm not sure what you wanted these in here for, leaving them blank for now, while I work on the documentation ..
  
  validateOnCreate: function() {},
  validateOnSave: function() {},

*/

  pushError: function(errDefault, errCustom) {
    /*
    Use this in all the methods eventually to avoid repeating if (!$defined(errText)  etc... 
    */
    message = errDefault;
    if ($defined(errCustom) && errCustom != "") message = errCustom;

    this.errors.push(message);
  },

  parseVars: function(blah) {}, // Use this later on to parse %strings into usable data, for custom validations,
  validate: function() {
    // executes user-defined validations
    this.options.model.options.validate.apply(this);
  },

  // run validate and determine if current Record is valid
  isValid: function() {
    this.validate();
    if (this.errors.length != 0) return false;
    else return true;
  },

  validatesAcceptanceOf: function(val, errText) {
    if (val == false || val == 0) {

      if (!$defined(errText)) customMsg = "must be abided";

      this.errors.push(errText);
      return false;
    }
    return true;
  },

  validatesAssociated: function(assocName, errText) {
    // This still isn't working, I'm not sure what the issue is
    var assocValid = true;
    var assocModel = JazzRecord.models.get(this[assocName]);
    var assocKey = assocModel.foreignKey;

    // alternate paths depending on whether associated record is loaded or not
    if (this[assocName].unloaded) {
      if (!assocModel.find(this[assocKey])) assocValid = false;
    }
    else if (!this[assocName].id) assocValid = false;

    if (!$defined(errText)) errText = assocName + " does not exist with ID " + this[assocKey];

    if (!assocValid) this.errors.push(errText);

    return assocValid;
  },

  validatesConfirmationOf: function(val1, val2, errText) {
    if (val1 != val2) {

      if (!$defined(errText)) errText = "does not match";

      this.errors.push(errText);
      return false;
    }
    else return true;
  },

  validatesExclusionOf: function(val, keyWordsArray, errText) {
    // keyWordsArray Must be an array atm, implement string processing later
    var passed_Validate = true;

    $each(keyWordsArray,
    function(cur_Word) {
      if (val.contains(cur_Word)) {
        passed_Validate = false;

        if (!$defined(errText)) errText = val + " must not contain " + cur_Word;

        this.errors.push(errText);
      }

      return passed_Validate;
    });
  },
  
  validatesFormatOf: function() {
    // cant believe I missed one lol
  },
  
  validatesInclusionOf: function(val, keyWordsArray, errText) {
    /*
      Fix this tomorrow.......
    */
    var passed_Validate = false;

    $each(keyWordsArray,
    function(cur_Word) {
      if (val.contains(cur_Word)) {
        passed_Validate = true;
      }
    })
    if (!passed_Validate) {
      if (!$defined(errText)) errText = val + " must contain " + cur_Word;

      this.errors.push(errText);
    }
    return passed_Validate;

  },
  
  validatesLengthOf: function(val, min, max, errText) {
    if ((val.length) > max || (val.length) < min) {

      if (!$defined(errText)) errText = "must be between " + min + " and " + max;

      this.errors.push(errText);
      return false;
    }
    else return true;
  },
  
  validatesNumericalityOf: function(val, errText) {
    if (validatesIsInt(val) || validatesIsFloat(val)) {
      return true;
    }
    else {
      if (!$defined(errText)) errText = "must be numeric";

      this.errors.push(errText);
      return false;
    }
  },
  
  validatesPresenceOf: function(val, errText) {
    if (!$defined(val) || val == "") {
      if (!$defined(errText)) errText = "must be defined";

      this.errors.push(errText);
      return false;
    }
    else {
      return true;
    }
  },
  
  validatesUniquenessOf: function(colName, val, errText) {
    if (findBy(colName, val).length > 0) {
      if (!$defined(errText)) errText = "is not unique";

      this.errors.push(errText);
      return false;
    } else {
       return true;
    }
  },
  
  // Generic Validations
  validateIsString: function(val, errText) {
    if (typeof(val) == "string") return true;
    if (!$defined(errText)) errText = "must be string";

    this.errors.push(errText);
    return false;
  },
  
  validateIsBool: function(val, errText) {
    if (typeof(val) == "boolean") return true;
    if (!$defined(errText)) errText = "must be boolean";

    this.errors.push(errText);
    return false;
  },
  
  validateIsInt: function(val, errText) {
    if (typeof(val) == "number") return true;
    if (!$defined(errText)) errText = "must be int";

    this.errors.push(errText);
    return false;
  },
  
  validateIsFloat: function(val) {
    if ((typeof(val) == "number") && (val.contains("."))) return true;
    if (!$defined(errText)) errText = "must be boolean";

    this.errors.push(errText);
    return false;
  }

});
