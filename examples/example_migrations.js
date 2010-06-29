var migrations = {
  1: {
    up: function() {
      JazzRecord.createTable("people", {
        id: "integer",
        name: "text",
        age: "integer",
        gender: "text",
        home_id: "integer",
        income: "float",
        has_vehicle: "bool"
      });
      
      JazzRecord.createTable("homes", {
        id: "integer",
        style: "text",
        footage: "integer",
        address: "text",
        vacant: "bool"
      });
      
      JazzRecord.createTable("vehicles", {
        id: "integer",
        make: "text",
        model: "text",
        year: "integer",
        person_id: "integer"
      });
      
      JazzRecord.createTable("high_school_classes", {
        id: "integer",
        name: "text",
        room: "integer"
      });
      
      JazzRecord.createTable("students", {
        id: "integer",
        name: "text",
        grade: "text",
        home_id: "integer"
      });
      
      JazzRecord.createTable("animals", {
        id: "integer",
        name: "text",
        species: "text",
        say: "text"
      });
      
      JazzRecord.createTable("books", {
        id: "integer",
        title: "text",
        author: "text",
        category: "text",
        person_id: "integer"
      });
      
      JazzRecord.createTable("high_school_classes_students", {
        student_id: "integer",
        high_school_class_id: "integer"
      });
    },
    down: function() {
      JazzRecord.dropTable("high_school_classes_students");
      JazzRecord.dropTable("animals");
      JazzRecord.dropTable("students");
      JazzRecord.dropTable("high_school_classes");
      JazzRecord.dropTable("vehicles");
      JazzRecord.dropTable("homes");
      JazzRecord.dropTable("people");
    }
  },
  2: {
    up: function() {
      JazzRecord.removeColumn("people", "income");
    },
    down: function() {
      JazzRecord.addColumn("people", "income", "float");
    }
  }
};