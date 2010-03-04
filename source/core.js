// Portions of the code in this particular file are inspired or nicked straight from MooTools (http://www.mootools.net)
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
    return !(typeof obj === "undefined" || obj === null);
  },

  // only needs to know basic types and differentiate arrays from other objects
  getType: function(obj) {
    if(typeof obj === "undefined" || obj === null || (typeof obj === "number" && isNaN(obj)))
      return false;
    else if(obj.constructor === Array)
      return "array";
    else
      return typeof obj;
  },
  
  debug: false,
  //firebug/air debug function, kill by setting JazzRecord.debug = false
  puts: function(obj) {
    if(JazzRecord.debug === false)
      return;
      
    // branch the lazy definition of puts
    if(typeof Titanium !== "undefined") {
      JazzRecord.puts = function(obj) {
        Titanium.API.debug(obj);
      };
    }
    
    else if(typeof console !== "undefined" && console.log) {
      JazzRecord.puts = function(obj) {
        if(JazzRecord.debug === false)
          return;

        switch(JazzRecord.getType(obj)) {
          case "object":
            if(console.dir) {
              console.dir(obj);
              break;
            }
          default:
            console.log(obj);
        }
      };
    }

    else if(typeof air !== "undefined") {
      if (air.Introspector && air.Introspector.Console) {
        JazzRecord.puts = function(obj) {
          if(JazzRecord.debug === false)
            return;

          switch(JazzRecord.getType(obj)) {
            case "string":
              air.Introspector.Console.log(obj);
              break;
            case "object":
              air.Introspector.Console.dump(obj);
              break;
          }
        };
        
      }
      else
        JazzRecord.puts = function(obj) {
          if(JazzRecord.debug === false)
            return;
            
          air.trace(obj);
        };
    }
    
    else {
      JazzRecord.puts = function(obj) {};
    }
    
    JazzRecord.puts(obj);
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

  shallowMerge: function(origObj, mergeObj) {
    for(var prop in mergeObj)
      origObj[prop] = mergeObj[prop];
    return origObj;
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
  
  // mimic's MooTools' String.substitute() followed by String.clean()
  replaceAndClean: function(str, options) {
    for(opt in options) {
      str = str.replace("{" + opt + "}", options[opt]);
    }    
    str = str.replace(/{\w+}/g, "");
    return str.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
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
  },
  
  indexOf: function(arr, val) {
    var index = -1;
    if(arr.indexOf)
      index = arr.indexOf(val);
    else {
      for(var i = 0, l = arr.length; i < l; i++) {
        if(arr[i] === val) {
          index = i;
          break;
        }
      }
    }
    return index;
  },

  // check arr for an instance of val
  arrayContainsVal: function(arr, val) {
    if(JazzRecord.indexOf(arr, val) > -1)
      return true;
    else
      return false;
  },
  
  removeFromArray: function(arr, val) {
    var index = JazzRecord.indexOf(arr, val);
    arr.splice(index, 1);
  }
};

JazzRecord.Hash = function(obj) {
  this.data = obj || {};
};

// used to compare contents of original data and current data in isChanged
JazzRecord.Hash.toQueryString = function(obj) {
  var queryStringComponents = [];
  JazzRecord.each(this.data, function(val, key) {
    if(obj)
      key = obj + "[" + key + "]";
    var result;
    switch(JazzRecord.getType(val)) {
      case "object":
        result = JazzRecord.Hash.toQueryString(val, key);
        break;
      case "array":
        var queryString = {};
        JazzRecord.each(val, function(arrayVal, i) {
          queryString[i] = arrayVal;
        });
        result = JazzRecord.Hash.toQueryString(queryString, key);
        break;
      default:
        result = key + "=" + encodeURIComponent(val);
    }
    if(val)
      queryStringComponents.push(result);
  });
  return queryStringComponents.join("&");
};

JazzRecord.Hash.prototype = {
  has: function(key) {
    if(this.data.hasOwnProperty(key))
      return true;
    else
      return false;
  },
  set: function(key, value) {
    this.data[key] = value;
  },
  get: function(key) {
    return this.data[key];
  },
  getLength: function() {
    var length = 0;
    for(var i in this.data) {
       if(this.data.hasOwnProperty(i))
        length++;
    }
    return length;
  },
  each: function(iterator, bind) {
    JazzRecord.each(this.data, iterator, bind);
  },
  toQueryString: JazzRecord.Hash.toQueryString,
  getValues: function() {
    var keys = [];
    this.each(function(val) {
      keys.push(val);
    });
    return keys;
  },
  getKeys: function() {
    var values = [];
    this.each(function(val, key) {
      values.push(key);
    });
    return values;
  }
};

JazzRecord.models = new JazzRecord.Hash();

// Globals can be overridden in site-specific js
JazzRecord.depth = 1;
JazzRecord.run = function(sql, success, error) {
  return JazzRecord.adapter.run(sql, success, error);
};
JazzRecord.count = function(sql, success, error) {
  return parseInt(JazzRecord.adapter.count(sql, success, error), 10);
};
JazzRecord.save = function(sql, success, error) {
  return JazzRecord.adapter.save(sql, success, error);
};

JazzRecord.runTransaction = function(func, bind) {
  JazzRecord.adapter.runTransaction(func, bind);
};
