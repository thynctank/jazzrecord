var migrations = {
  1: {
    up: function() {
      JazzRecord.createTable("rabbits", {name: "text", parent_id: "number"});
    },
    down: function() {
      JazzRecord.dropTable("rabbits");
    }
  },
  
  2: {
    up: function() {
      JazzRecord.renameTable("rabbits", "hares");
    },
    down: function() {
      JazzRecord.renameTable("hares", "rabbits");
    }
  },
  
  3: {
    up: function() {
      JazzRecord.addColumn("hares", "title", "text");
    },
    down: function() {
      JazzRecord.removeColumn("hares", "title");
    }
  }
};