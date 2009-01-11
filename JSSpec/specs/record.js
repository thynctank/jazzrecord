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
  "Destroying a record with hasOne association and depth set to 0 should not cause exception": function() {
    JazzRecord.depth = 0;
    JazzRecord.migrate({fixtures:fixtures, refresh: true});
    p = Person.first();
    value_of(p.name).should_be("Nick");
    p.destroy();
    value_of(Person.count()).should_be(4);
  },
  "Destroying a record with hasOne association, depth set to 0, and destroying the associated record first should not cause exception": function() {
    JazzRecord.depth = 0;
    JazzRecord.migrate({fixtures:fixtures, refresh: true});
    p = Person.first();
    value_of(p.name).should_be("Nick");
    v = Vehicle.first();
    v.destroy();
    p.destroy();
    value_of(Person.count()).should_be(4);
  },
  "updateAttribute updates and saves record": function() {
    value_of(p.name).should_be("Terri");
    p.updateAttribute("name", "Tabitha");
    p = Person.first();
    value_of(p.name).should_be("Tabitha");
  },
  "Creating a new record and saving sets ID": function() {
    p = Person.newRecord({name: "Winston", age: 33});
    value_of(p.id).should_be_null();
    p.save();
    value_of(p.id).should_not_be_null();
  },
  "Calling save() several times with depth 0 and with hasOne relationship should not raise error exception": function() {
    JazzRecord.depth = 0;
    p = Person.newRecord({name: 'Person Test'});
    p.save();
    p.name = "Person Test1";
    p.save();
    p.name = "Person Test2";
    p.save();
    p.name = "Person Test3";
    p.save();
    value_of(p.name).should_be('Person Test3');
  },
  'Calling save() after fetching records should not raise error exception': function() {
    JazzRecord.depth = 0;
    p = Person.last();
    p.name = "Person Test 1";
    p.save();
    p.name = "Person Test 1-1";
    p.save();
    p.name = "Person Test 1-1-1";
    p.save();
    p.name = "Person Test 1";
    p.save();
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
    value_of(p.errors).should_include("age");
    value_of(p.errors.age[0]).should_be("ya caint be a non-numeric age, genius");
    // should not save due to incorrect type
    value_of(p.save()).should_be_false();
    value_of(p.errors.age).should_have(2, "items");
    // should not save due to left out value
    delete p.age;
    value_of(p.save()).should_be_false();
    value_of(p.errors.age).should_have(1, "items");
    value_of(p.errors.age[0]).should_be("age can't be empty, null or blank");
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
  "Retreiving a record and calling save() after load() of unloaded association should not cause exception": function() {
    h = Home.first({depth: 0});
    h.address = "123 Test St";
    h.load("people");
    h.save();
    value_of(h.address).should_be('123 Test St');
  },
  "Loading hasAndBelongsToMany": function() {
    var s = Student.first({depth: 0});
    value_of(s.classes).should_include("unloaded");
    s.load("classes");
    value_of(s.classes.unloaded).should_be_undefined();
    value_of(s.classes[0].name).should_be("English");
  }
});