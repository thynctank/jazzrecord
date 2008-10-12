var AssociationLoader = new Class({
  initialize: function(loader) {
    this.loader = loader;
  },
  load: function(depth) {
    if(!this.loader)
      return;
    if(!depth)
      depth = 0;
    var results = this.loader(depth);
    $extend(this, results);
    delete this.loader;
  }
});