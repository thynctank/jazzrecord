JazzRecord.Model.implement({
  //finders: find, find_by, all, first, last
  find: function(options) {
    if(!$defined(options))
      throw("Missing ID or Options");
    else
      switch($type(options)) {
        case "array":
          options = {id: options};
          break;
        case "number":
          options = {id: options, limit: 1};
          break;
        case "object":
          break;
        default:
          throw("Type Error. Model.find() expects Number, Array or Object");
      }
    return this.select(options);
  },
  findBy: function(field, value, depth) {
    if(!this.options.columns[field])
      throw("Column " + field + " Does Not Exist in Table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value), limit: 1, depth: depth});
  },
  findAllBy: function(field, value, depth) {
    if(!this.options.columns[field])
      throw("Column " + field + " Does Not Exist in Table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value), depth: depth});
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
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table;
    if(conditions)
      this.sql += " WHERE " + conditions;
    return JazzRecord.adapter.count(this.sql);
  },
  select: function(options) {
    if(!options)
      options = {};

    this.sql = "SELECT {select} FROM " + this.table + " {conditions} {order} {limit} {offset}";
    var defaultOptions = {select: "*"};
    
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
      if($type(options.id)=='number')
        options.conditions = "WHERE id=" + options.id;
      else if($type(options.id)=='array')
        options.conditions = "WHERE id IN (" + options.id + ")";
    this.sql = this.sql.substitute(options).clean() + ";";
    
    return this.query(options);
  }
});