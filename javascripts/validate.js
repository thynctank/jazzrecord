JazzRecord.Record.implement(
{

/*
  Nick -- I'm not sure what you wanted these in here for, leaving them blank for now, while I work on the documentation ..
  
  validateOnCreate: function() {},
  validateOnSave: function() {},

*/

  pushError: function(errDefault, errCustom){
    /*
    Use this in all the methods eventually to avoid repeating if (!$defined(errText)  etc... 
    */
    var message = errDefault;

    if ($defined(errCustom) && errCustom !== "") {
      message = errCustom;
    }

    this.errors.push(message);
  },
  parseVars: function(blah){}, // Use this later on to parse %strings into usable data, for custom validations,
  validate: function(){
    // executes user-defined validations
    this.options.model.options.validate.apply(this);
  },

  // run validate and determine if current Record is valid
  isValid: function(){
    this.validate();

    if (this.errors.length !== 0) {
      return false;
    }
    else {
      return true;
    }
  },
  validatesAcceptanceOf: function(col, errText){
    var val = this[col];
    if (val === false || val === 0) {
      if (!$defined(errText)) {
        customMsg = col + " must be abided";
      }

      this.errors.push(errText);
      return false;
    }
    return true;
  },
  validatesAssociated: function(assocName, errText){
    // This still isn't working, I'm not sure what the issue is
    var assocValid = true;
    var assocModel = JazzRecord.models.get(this[assocName]);
    var assocKey = assocModel.foreignKey;

    // alternate paths depending on whether associated record is loaded or not
    if (this[assocName].unloaded){
      if (!assocModel.find(this[assocKey]))
        assocValid = false;
    }
    else if (!this[assocName].id) {
      assocValid = false;
    }

    if (!$defined(errText))
      errText = assocName + " does not exist with ID " + this[assocKey];

    if (!assocValid)
      this.errors.push(errText);

    return assocValid;
  },
  validatesConfirmationOf: function(col1, col2, errText){
    var val1 = this[col1];
    var val2 = this[col2];
    if (val1 != val2) {
      if (!$defined(errText)) {
        errText = "does not match";
      }

      this.errors.push(errText);
      return false;
    }
    else {
      return true;
    }
  },
  validatesExclusionOf: function(col, keyWordsArray, errText){
    // keyWordsArray Must be an array atm, implement string processing later
    var val = this[col];
    var passed_Validate = true;

    $each(keyWordsArray, function(cur_Word){
      if (val.contains(cur_Word)){
        passed_Validate = false;

        if (!$defined(errText)) {
          errText = col + " must not contain " + cur_Word;
        }

        this.errors.push(errText);
      }
    }, this);
    return passed_Validate;
  },
  validatesFormatOf: function(){
  // cant believe I missed one lol
  },
  validatesInclusionOf: function(col, keyWordsArray, errText){
    var val = this[col];
    var passed_Validate = false;

    $each(keyWordsArray, function(cur_Word){
      if (val.contains(cur_Word)){
        passed_Validate = true;
      }
    });

    if (!passed_Validate){
      var flatarr = "";
      $each(keyWordsArray, function(cwop){
        flatarr += cwop + ", ";
      });

      if (!$defined(errText)) {
        errText = col + " must contain at least one of the following: " + flatarr;
      }

      this.errors.push(errText);
    }
    return passed_Validate;
  },
  validatesLengthOf: function(col, min, max, errText){
    var val = this[col];
    if ((val.length) > max || (val.length) < min){
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
  validatesNumericalityOf: function(col, errText){
    if (validatesIsInt(col) || validatesIsFloat(col)){
      return true;
    }
    else{
      if (!$defined(errText)) {
        errText = col + " must be numeric";
      }
      this.errors.push(errText);
      return false;
    }
  },
  validatesPresenceOf: function(col, errText){
    var val = this[col];
    if (!$defined(val) || val === ""){
      if (!$defined(errText)) {
        errText = col + " must be defined";
      }

      this.errors.push(errText);
      return false;
    }
    else {
      return true;
    }
  },
  validatesUniquenessOf: function(colName, val, errText){
          //**********************************************
    if (findBy(colName, val).length > 0){
      if (!$defined(errText))
        errText = val + " is not unique";

      this.errors.push(errText);
      return false;
    }
    else {
      return true;
    }
  },

  // Generic Validations
  validateIsString: function(col, errText){
    var val = this[col];
    if (typeof (val) == "string") {
      return true;
    }

    if (!$defined(errText)) {
      errText = col + " must be string";
    }

    this.errors.push(errText);
    return false;
  },
  validateIsBool: function(col, errText){
    var val = this[col];
    if (typeof (val) == "boolean") {
      return true;
    }

    if (!$defined(errText)) {
      errText = col + " must be boolean";
    }

    this.errors.push(errText);
    return false;
  },
  validateIsInt: function(col, errText){
    var val = this[col];
    if (typeof (val) == "number") {
      return true;
    }

    if (!$defined(errText)) {
      errText = col + " must be int";
    }

    this.errors.push(errText);
    return false;
  },
  validateIsFloat: function(col, errText){
          //**************************************
    var val = this[col];
    if (( typeof (val) == "number") && (val.contains("."))) {
      return true;
    }

    if (!$defined(errText)) {
      errText = col + " must be boolean";
    }

    this.errors.push(errText);
    return false;
  }
});
