JazzRecord.AssociationLoader = function(loader) {
  this.loader = loader;
  this.unloaded = true;
};

JazzRecord.AssociationLoader.prototype = {
  toString: function() {
    return "Not yet loaded";
  }
};