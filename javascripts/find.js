ThyncRecord.Model.implement({
  //finders: find, find_by, all, first, last
  find: function(id, options) {
    if(!$defined(id))
      throw("Missing ID Parameter");
    switch($type(id)) {
      // add ability to find specific group of results by ID by passing in array
      case "array":
      case "number":
        options = $extend({id: id}, options);
        break;
    }
    return this.select(options);
  },
  find_by: function(field, value) {
    if(!this.options.columns[field])
      throw("column " + field + " does not exist in table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value), limit: 1});
  },
  find_all_by: function(field, value) {
    if(!this.options.columns[field])
      throw("column " + field + " does not exist in table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value)});
  },
  all: function(options) {
    return this.select(options);
  },
  first: function(options) {
    options = $extend({limit: 1}, options);
    return this.select(options);
  },
  last: function(options) {
    options = $extend({limit: 1, order: "id"}, options);
    options.order += " DESC";
    return this.select(options);
  },

  select: function(options) {
    if(!options)
      options = {};

    this.sql = "SELECT {select} FROM {table} {conditions} {order} {limit} {offset}";

    var defaultOptions = {select: "*", table: this.table};
  
    options = $extend(defaultOptions, options);

    if(!options.select == "*" && !options.select.contains("id"))
      options.select = "id, " + options.select;      
    if(options.order)
      options.order = "ORDER BY " + options.order;
    if($type(options.limit) == "number")
      options.limit = "LIMIT " + options.limit;
    if($type(options.offset) == "number")
      options.offset = "OFFSET " + options.offset;
    //add complex conditions handling as in AR
    if(options.conditions) {
      options.conditions = "WHERE " + options.conditions;
      if(options.id)
        options.conditions += " AND id=" + options.id;
    }
    else if(options.id)
      options.conditions = "WHERE id=" + options.id;
        
    this.sql = this.sql.substitute(options).clean() + ";";
    return this.query(options);
  }
});