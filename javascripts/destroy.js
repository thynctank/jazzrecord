ThyncRecord.Model.implement({
  //delete
  destroy: function(id) {
    this.query({statement: "DELETE", select: "", id: id});
  } 
});