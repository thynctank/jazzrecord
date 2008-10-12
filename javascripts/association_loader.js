var AssociationLoader = new Class({
  initialize: function(loader) {
    this.loader = loader;
    this.unloaded = true;
  },
  toString: function() {
    return "Not yet loaded";
  }
});