var migrations = {
  1: {
    up: function() {
      JazzRecord.createTable("people", {
        id: "number",
        name: "text",
        age: "number",
        gender: "text",
        home_id: "number",
        income: "float",
        has_vehicle: "bool"
      });
      
      JazzRecord.createTable("homes", {
        id: "number",
        style: "text",
        footage: "number",
        address: "text",
        vacant: "bool"
      });
      
      JazzRecord.createTable("vehicles", {
        id: "number",
        make: "text",
        model: "text",
        year: "number",
        person_id: "number"
      });
      
      JazzRecord.createTable("high_school_classes", {
        id: "number",
        name: "text",
        room: "number"
      });
      
      JazzRecord.createTable("students", {
        id: "number",
        name: "text",
        grade: "text",
        home_id: "number"
      });
      
      JazzRecord.createTable("animals", {
        id: "number",
        name: "text",
        species: "text",
        say: "text"
      });
      
      JazzRecord.createTable("high_school_classes_students", {
        student_id: "number",
        high_school_class_id: "number"
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
  }
};