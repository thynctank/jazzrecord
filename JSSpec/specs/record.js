describe("Record", {
  before_all: function() {
    initJazz();
    JazzRecord.migrate({fixtures:fixtures, refresh:true});
  },
  before_each: function() {
    p = Person.first();
  },
  after_all: function() {
    delete p;
  },
  "Revert flips back to original data": function() {
    value_of(p.name).should_be("Nick");
    p.name = "Nicholas";    
    value_of(p.name).should_be("Nicholas");
    p.revert();
    value_of(p.name).should_be("Nick");
  },
  "Reload reloads original associations": function() {
    value_of(p.vehicle.model).should_be("Forenza");
    p.vehicle.model = "Vitara";
    value_of(p.vehicle.model).should_be("Vitara");
    p.revert();
    // revert doesn't hit db, but also doesn't reload associations
    value_of(p.vehicle.model).should_be("Vitara");
    p.reload();
    value_of(p.vehicle.model).should_be("Forenza");
  },
  "Destroy eliminates record in db and removes ID": function() {
    value_of(p.name).should_be("Nick");
    value_of(p.id).should_be(1);
    p.destroy();
    value_of(p.id).should_be_null();
    p = Person.first();
    value_of(p.name).should_be("Terri");
  },
  "updateAttribute updates and saves record": function() {
    value_of(p.name).should_be("Terri");
    p.updateAttribute("name", "Tabitha");
    p = Person.first();
    value_of(p.name).should_be("Tabitha");
  },
  "Creating a new record and saving sets ID": function() {
    var p = Person.newRecord({name: "Winston", age: 33});
    value_of(p.id).should_be_null();
    p.save();
    value_of(p.id).should_not_be_null();
  }
});

describe("Validation", {
  before_all: function() {
    initJazz();
    JazzRecord.migrate({fixtures:fixtures, refresh:true});    
  },
  before_each: function() {
    p = Person.newRecord({name: "Dummy", age: 22});
  },
  after_all: function() {
    delete p;
  },
  "Failing a validation and using custom error messaging": function() {
    p.age = "dead";
    value_of(p.isValid()).should_be_false();
    value_of(p).should_have(1, "errors");
    value_of(p.errors[0]).should_be("Ya caint be a non-numeric age, genius");
    // Should not save
    value_of(p.save()).should_be_false();
    value_of(p).should_have(1, "errors");
  }
});

describe("AssociationLoader", {
  before_all: function() {
    initJazz();
    JazzRecord.migrate({fixtures:fixtures, refresh:true});
  },
  before_each: function() {
    p = Person.first({depth: 0});
  },
  after_all: function() {
    delete p;
  },
  "Loading hasOne": function() {
    value_of(p.vehicle).should_include("unloaded");
    p.load("vehicle");
    value_of(p.vehicle).should_not_include("unloaded");
    value_of(p.vehicle.model).should_be("Forenza");
  },
  "Loading belongsTo": function() {
    value_of(p.home).should_include("unloaded");
    p.load("home");
    value_of(p.home).should_not_include("unloaded");
    value_of(p.home.address).should_be("4605 Deming Ave");
  },
  "Loading hasMany": function() {
    var h = Home.first({depth: 0});
    value_of(h.people).should_include("unloaded");
    h.load("people");
    value_of(h.people.unloaded).should_be_undefined();
    value_of(h).should_have(2, "people");
    value_of(h.people[0].name).should_be("Nick");
  },
  "Loading hasAndBelongsToMany": function() {
    var s = Student.first({depth: 0});
    value_of(s.classes).should_include("unloaded");
    s.load("classes");
    value_of(s.classes.unloaded).should_be_undefined();
    value_of(s.classes[0].name).should_be("English");
  }
});