var Person = new JazzRecord.Model({
  table: "people",
  foreignKey: "person_id",
  belongsTo: { home: "homes"},
  hasOne: { vehicle: "vehicles"},
  columns: {
    id: "number",
    name: "text",
    age: "number",
    gender: "text",
    home_id: "number",
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
      this.validatesLengthOf("name", {minimum: 4});
      this.validatesPresenceOf("age");
      this.validatesIsInt("age");
      this.validatesInclusionOf("gender", ["m", "f"], "gender must be m or f");
      this.validatesExclusionOf("age", [111], "we don't like eleventy-one year olds");
      this.validatesAssociated("vehicle");
    },
    atCreate: function() {
      this.validatesIsInt("age", "ya caint be a non-numeric age, genius");
    }
  }
});

var Home = new JazzRecord.Model({
  table: "homes",
  foreignKey: "home_id",
  hasMany: { people: "people", students: "students"},
  columns: {
    id: "number",
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

var Vehicle = new JazzRecord.Model({
  table: "vehicles",
  foreignKey: "vehicle_id",
  belongsTo: { owner: "people"},
  columns: {
    id: "number",
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

var HighSchoolClass = new JazzRecord.Model({
  table: "high_school_classes",
  foreignKey: "high_school_class_id",
  hasAndBelongsToMany: { students: "students"},
  columns: {
    id: "number",
    name: "text",
    room: "number"
  }
});

var Student = new JazzRecord.Model({
  table: "students",
  foreignKey: "student_id",
  belongsTo: { home: "homes"},
  hasAndBelongsToMany: { classes: "high_school_classes"},
  columns: {
    id: "number",
    name: "text",
    grade: "text",
    home_id: "number"
  }
});

var Animal = new JazzRecord.Model({
  table: "animals",
  foreignKey: "animal_id",
  columns: {
    id: "number",
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
