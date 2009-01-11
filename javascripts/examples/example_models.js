Person = new JazzRecord.Model({
  table: "people",
  foreignKey: "person_id",
  belongsTo: { home: "homes"},
  hasOne: { vehicle: "vehicles"},
  columns: {
    name: "text",
    age: "number",
    gender: "text",
    home_id: "number",
    income: "float",
    has_vehicle: "bool"
  },
  events: {
    onUpdate: function() {
      JazzRecord.puts("A person was updated");
    },
    onDestroy: function() {
      JazzRecord.puts("A person was destroyed");
    }
  },
  
  validate: {
    atSave: function() {
      this.validatesUniquenessOf("name");
      this.validatesLengthOf("name", {minimum: 4});
      this.validatesPresenceOf("age");
      this.validatesIsInt("age");
      this.validatesIsFloat("income");
      this.validatesInclusionOf("gender", ["m", "f"], "gender must be m or f");
      this.validatesExclusionOf("age", [111], "we don't like eleventy-one year olds");
      this.validatesAssociated("vehicle");
    },
    atCreate: function() {
      this.validatesIsInt("age", "ya caint be a non-numeric age, genius");
    }
  }
});

Home = new JazzRecord.Model({
  table: "homes",
  foreignKey: "home_id",
  hasMany: { people: "people", students: "students"},
  columns: {
    style: "text",
    footage: "number",
    address: "text",
    vacant: "bool"
  },
  validate: {
    atSave: function() {
      this.validatesAssociated("people");
    }
  }
});

Vehicle = new JazzRecord.Model({
  table: "vehicles",
  foreignKey: "vehicle_id",
  belongsTo: { owner: "people"},
  columns: {
    make: "text",
    model: "text",
    year: "number",
    person_id: "number"
  },
  validate: {
    atSave: function() {
      this.validatesPresenceOf("model");
    }
  }
});

HighSchoolClass = new JazzRecord.Model({
  table: "high_school_classes",
  foreignKey: "high_school_class_id",
  hasAndBelongsToMany: { students: "students"},
  columns: {
    name: "text",
    room: "number"
  }
});

Student = new JazzRecord.Model({
  table: "students",
  foreignKey: "student_id",
  belongsTo: { home: "homes"},
  hasAndBelongsToMany: { classes: "high_school_classes"},
  columns: {
    name: "text",
    grade: "text",
    home_id: "number"
  }
});

Animal = new JazzRecord.Model({
  table: "animals",
  foreignKey: "animal_id",
  columns: {
    name: "text",
    species: "text",
    say: "text"
  },
  modelMethods: {
    findTiger: function() {
      return this.findBy("species", "tiger");
    }
  },
  recordMethods: {
    speak: function() {
      return this["say"];
    }
  }
});
