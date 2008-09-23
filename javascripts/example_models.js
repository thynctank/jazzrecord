var Person = new ThyncRecord.Model({
  table: "people",
  foreignKey: "person_id",
  hasOne: { home: "homes"},
  hasMany: { vehicles: "vehicles"},
  columns: {
    name: "text",
    age: "number",
    home_id: "number"
  }
});

var Home = new ThyncRecord.Model({
  table: "homes",
  foreignKey: "home_id",
  hasMany: { people: "people"},
  columns: {
    style: "text",
    footage: "number",
    address: "text"
  }    
});

var Vehicle = new ThyncRecord.Model({
  table: "vehicles",
  foreignKey: "vehicle_id",
  belongsTo: { person: "people"},
  columns: {
    make: "text",
    model: "text",
    year: "number",
    person_id: "number"
  }
});

var HighSchoolClass = new ThyncRecord.Model({
  table: "high_school_classes",
  foreignKey: "high_school_class_id",
  hasAndBelongsToMany: { students: "students"},
  columns: {
    name: "text",
    room: "number"
  }
});

var Student = new ThyncRecord.Model({
  table: "students",
  foreignKey: "student_id",
  hasOne: { home: "homes"},
  hasAndBelongsToMany: { highSchoolClasses: "high_school_classes"},
  columns: {
    name: "text",
    grade: "text",
    home_id: "number"
  }
});

var migrations = [
  {up:["createTable", "rabbits", {name: "text", parent_id: "number"}], down: ["dropTable", "rabbits"]},
  {up:["renameTable", "rabbits", "hares"], down: ["renameTable", "hares", "rabbits"]},
  {up:["addColumn", "hares", "title", "text"], down: ["removeColumn", "hares", "title"]}
];

ThyncRecord.migrate([], 0);