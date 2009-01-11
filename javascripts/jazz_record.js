var JazzRecord = {
  each: function(collection, iterator, bind) {
    switch(JazzRecord.getType(collection)) {
      case "array": 
        for(var i = 0, l = collection.length; i < l; i++)
          iterator.call(bind, collection[i], i);
        break;
      case "object":
        for(var property in collection) {
          if(collection.hasOwnProperty(property))
            iterator.call(bind, collection[property], property);
        }
        break;
    }
  },
  
  isDefined: function(obj) {
    return !(typeof obj === "undefined");
  },

  // only needs to know basic types and differentiate arrays from other objects
  getType: function(obj) {
    if(obj && typeof obj === "object" && obj.length && typeof obj.length === "number" && obj.sort && typeof obj.sort === "function")
      return "array";
    else if(obj === null)
      return "null";
    else
      return typeof obj;
  },
  
  //firebug/air debug function, kill by setting window.debug = false
  puts: function(obj) {
    if(JazzRecord.isDefined(window.debug) && window.debug == false)
      return;
    if(console && console.log) {
      switch(JazzRecord.getType(obj)) {
        case "object":
          console.dir(obj);
          break;
        default:
          console.log(obj);
      }
    }
    if(typeof air !== "undefined") {
      if (air.Introspector && air.Introspector.Console) {
        switch(JazzRecord.getType(obj)) {
          case "string":
            air.Introspector.Console.log(obj);
            break;
          case "object":
            air.Introspector.Console.dump(obj);
            break;
        }
      }
      else
        air.trace(obj);
    }
  },

  merge: function() {
    var mergedObject = {};
    for(var i = 0, l = arguments.length; i < l; i++) {
      var object = arguments[i];
      if(JazzRecord.getType(object) !== "object")
        continue;
      for(var prop in object) {
        var objectProp = object[prop], mergedProp = mergedObject[prop];
        if(mergedProp && JazzRecord.getType(objectProp) === "object" && JazzRecord.getType(mergedProp) === "object")
          mergedObject[prop] = JazzRecord.merge(mergedProp, objectProp);
        else
          mergedObject[prop] = objectProp;
      }
    }
    return mergedObject;
  },
  
  setOptions: function(options, defaults) {
    if(!options)
      options = {};
    if(!this.options)
      this.options = {};
    mergedOptions = JazzRecord.merge(defaults, options);
    for(var opt in defaults) {
      this.options[opt] = mergedOptions[opt];
    }
  },
  
  extend: function(baseClass, options) {
    if(!this.options)
      this.options = {};
    this.parent = new baseClass(options);
    for(var prop in this.parent) {
      this[prop] = this[prop] || this.parent[prop];
    }
    // copy base options over
    for(var opt in this.parent.options) {
      this.options[opt] = this.options[opt] || this.parent.options[opt];
    }
  }
};

// Globals can be overridden in site-specific js
JazzRecord.depth = 1;
JazzRecord.models = new Hash();
JazzRecord.run = function(sql) {
  return JazzRecord.adapter.run(sql);
};
JazzRecord.count = function(sql) {
  return JazzRecord.adapter.count(sql);
};
JazzRecord.save = function(sql) {
  return JazzRecord.adapter.save(sql);
};

// Thanks to Uriel Katz and his JStORM lib (http://labs.urielkatz.com/wiki/JStORM) for this idea
// Specify reason for rollback in thrown exception
JazzRecord.runTransaction = function(func, bind) {
  JazzRecord.run("BEGIN");
  try {
    func.apply(bind || this);
  }
  catch(e) {
    JazzRecord.run("ROLLBACK");
    throw(e);
  }
  JazzRecord.run("END");
};
