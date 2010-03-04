//finders: find, find_by, all, first, last
JazzRecord.Model.prototype.find = function(options) {
  if(!JazzRecord.isDefined(options))
    throw("Missing ID or Options");
  else
    switch(JazzRecord.getType(options)) {
      case "array":
        options = {id: options};
        break;
      case "number":
        options = {id: options, limit: 1};
        break;
      case "object":
        options.limit = 1;
        break;
      default:
        throw("Type Error. Model.find() expects Number, Array or Object");
    }
  return this.select(options);
};

JazzRecord.Model.prototype.findBy = function(field, value, depth) {
  if(!this.options.columns[field])
    throw("Column " + field + " Does Not Exist in Table " + this.table);
  else
    return this.select({conditions: field + "=" + JazzRecord.typeValue(this.options.columns, field, value), limit: 1, depth: depth});
};

JazzRecord.Model.prototype.findAllBy = function(field, value, depth) {
  if(!this.options.columns[field])
    throw("Column " + field + " Does Not Exist in Table " + this.table);
  else
    return this.select({conditions: field + "=" + JazzRecord.typeValue(this.options.columns, field, value), depth: depth});
};

JazzRecord.Model.prototype.all = function(options) {
  return this.select(options);
};

JazzRecord.Model.prototype.first = function(options) {
  options = JazzRecord.shallowMerge({limit: 1}, options);
  return this.select(options);
};

JazzRecord.Model.prototype.last = function(options) {
  options = JazzRecord.shallowMerge({limit: 1, order: "id"}, options);
  options.order += " DESC";
  return this.select(options);
};

JazzRecord.Model.prototype.count = function(conditions) {
  this.sql = "SELECT COUNT(*) FROM " + this.table;
  if(conditions)
    this.sql += " WHERE " + conditions;
  return JazzRecord.count(this.sql);
};

JazzRecord.Model.prototype.select = function(options) {
  if(!options)
    options = {};

  this.sql = "SELECT {select} FROM " + this.table + " {conditions} {group} {order} {limit} {offset}";
  var defaultOptions = {select: "*"};
  
  options = JazzRecord.shallowMerge(defaultOptions, options);
  
  if(options.select.indexOf("id") === -1 && options.select.indexOf("*") === -1)
    options.select = "id, " + options.select;
  if(options.order || this.options.order) {
    if(!options.order && this.options.order)
      options.order = this.options.order;

    options.order = "ORDER BY " + options.order;
  }
  if(JazzRecord.getType(options.limit) == "number")
    options.limit = "LIMIT " + options.limit;
  if(JazzRecord.getType(options.offset) == "number")
    options.offset = "OFFSET " + options.offset;
  if(options.group)
    options.group = "GROUP BY " + options.group;

  //add complex conditions handling as in AR
  if(options.conditions) {
    var conditionSql = "WHERE ";
    // // simple string
    if(JazzRecord.getType(options.conditions) === "string") {
      options.conditions = conditionSql + options.conditions;
      if(options.id)
        options.conditions += " AND id=" + options.id;
    }
    else {
      // obj hash of cols/values
      JazzRecord.each(this.options.columns, function(colType, colName) {
        var conditionCol = options.conditions[colName];
        if(conditionCol) {
          var conditionType = JazzRecord.getType(conditionCol);
          switch(conditionType) {
            // equality
            case "string":
              conditionSql += (colName + "='" + conditionCol.replace(/'/g, "''") + "' AND ");
              break;
            // arbitrary comparison operator, comparison value
            case "array":
              conditionSql += colName + " " + conditionCol[0] + " ";
              if(JazzRecord.getType(conditionCol[1]) === "string")
                conditionSql += (conditionCol[1].replace(/'/g, "''") + " AND ");
              else
                conditionSql += conditionCol[1] + " AND ";
              break;
            default:
              conditionSql += (colName + "=" + conditionCol + " AND ");
              break;  
          }
        }
      });
      options.conditions = conditionSql.slice(0, -4);
    }
  }
  else if(options.id) {
    if(JazzRecord.getType(options.id)=='number') {
      options.conditions = "WHERE id=" + options.id;
      options.limit = "LIMIT 1";
    }
    else if(JazzRecord.getType(options.id)=='array')
      options.conditions = "WHERE id IN (" + options.id + ")";
  }
  
  this.sql = JazzRecord.replaceAndClean(this.sql, options);
  return this.query(options);
};