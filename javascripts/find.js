ThyncRecord.Model.implement({
  //finders: find, find_by, all, first, last
  find: function(query) {
			// if($type(options)=='number')
			// 	options = $extend({id: options});
			// else if($type(options)=='string')
			// 	options = $extend({conditions: " id = " + ids.toString().replace(/,/g, " or id = ")}, options);
			
    if(!$defined(query))
      throw("Missing ID or Options Parameters");
		else
			if($type(query)=='number' || $type(query)=='array')
      	options = {id: query};
	    else if($type(query)=='object')
	      options = query;
			else
				throw("Type Error. You can find by either an ID, an array of IDs, or an object literal containing values for SELECT, TABLE, CONDITIONS, ORDER, LIMIT, and OFFSET.");
	  return this.select(options);
  },
  findBy: function(field, value) {
    if(!this.options.columns[field])
      throw("Column " + field + " Does Not Exist in Table " + this.table);
    else
      return this.select({conditions: field + "=" + this.typeValue(field, value), limit: 1});
  },
  findAllBy: function(field, value) {
    if(!this.options.columns[field])
      throw("Column " + field + " Does Not Exist in Table " + this.table);
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
  count: function(conditions) {
    this.sql = "SELECT COUNT(*) FROM " + this.table;
    if(conditions)
      this.sql += " WHERE " + conditions;
    return ThyncRecord.adapter.count(this.sql);
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
			if($type(options.id)=='number')
      	options.conditions = "WHERE id=" + options.id;
			else if($type(options.id)=='array')
      	options.conditions = "WHERE id IN (" + options.id + ")";
    this.sql = this.sql.substitute(options).clean() + ";";
    
    return this.query(options);
  }
});