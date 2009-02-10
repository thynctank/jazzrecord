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
  "Destroying a record with associated hasMany objects should unlink those objects and set the main record's id to null": function() {
    var h = Home.first();
    h.destroy();
    value_of(h.id).should_be_null();
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
  },
  "Calling isNew() will return true for a new record and false after saved": function() {
    p = Person.newRecord({name: 'George', age: 43});
    value_of(p.isNew()).should_be(true);
    p.save();
    value_of(p.isNew()).should_be(false);
  },
  "Calling isNew() on a record after successful call to create() should return false, unsuccessful return true": function() {
    p = Person.create({name: 'abc', age: 43});
    value_of(p.isNew()).should_be(true);
    p = Person.create({name: 'abcd', age: 43});
    value_of(p.isNew()).should_be(false);
  }
});

describe("Validation", {
  before_all: function() {
    initJazz();
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
  },
  "validatesAcceptanceOf should verify a bool has been set to true": function() {
    p.has_vehicle = false;
    value_of(p.errors).should_be({});
    p.validatesAcceptanceOf("has_vehicle");
    value_of(p.errors.has_vehicle[0]).should_be("has_vehicle must be accepted");
    p.errors = {};
    p.has_vehicle = true;
    p.validatesAcceptanceOf("has_vehicle");
    value_of(p.errors).should_be({});
  },
  "validatesConfirmationOf should verify a second confirming property has been set": function() {
    p.password = "simplepassword";
    p.validatesConfirmationOf("password");
    value_of(p.errors.password[0]).should_be("password doesn't match confirmation");
    p.errors = {};
    p.password_confirmation = "simplepassword";
    p.validatesConfirmationOf("password");
    value_of(p.errors).should_be({});
  },
  "validatesExclusionOf should verify no elements from the list are used for the given property": function() {
    p.password = "password";
    p.validatesExclusionOf("password", ["password", "pass", "idiotic_password"]);
    value_of(p.errors.password[0]).should_be("password is reserved");
    p.errors = {};
    p.password = "waybetterpassword";
    p.validatesExclusionOf("password", ["password", "pass", "idiotic_password"]);
    value_of(p.errors).should_be({});
  },
  "validatesInclusionOf should verify an element from the list is used for the given property": function() {
    p.gender = "robot";
    p.validatesInclusionOf("gender", ["m", "f"], "gender must be m or f");
    value_of(p.errors.gender[0]).should_be("gender must be m or f");
    p.errors = {};
    p.gender = "m";
    p.validatesInclusionOf("gender", ["m", "f"], "gender must be m or f");
    value_of(p.errors).should_be({});
  },
  "validatesFormatOf should verify the property value matches a regex": function() {
    p.name = "Nick Carter";
    // enforce last name, first name format
    p.validatesFormatOf("name", /\w+, \w+/, "name is not last name, first name");
    value_of(p.errors.name[0]).should_be("name is not last name, first name");
    p.errors = {};
    p.name = "Carter, Nick";
    p.validatesFormatOf("name", /\w+, \w+/, "name is not last name, first name");
    value_of(p.errors).should_be({});
  },
  "validatesNumericalityOf should verify the property is numeric or int": function() {
    p.age = "shfify shfive";
    p.validatesNumericalityOf("age", "must be numeric");
    value_of(p.errors.age[0]).should_be("must be numeric");
    p.errors = {};
    
    p.age = 1.25;
    p.validatesNumericalityOf("age", "must be numeric");
    value_of(p.errors).should_be({});
    
    p.age = 5;
    p.validatesNumericalityOf("age", "must be numeric");
    value_of(p.errors).should_be({});
  },
   "validatesPresenceOf should verify the property is not null or empty": function() {
    p.name = null;
    p.validatesPresenceOf("name", "can't be null");
    value_of(p.errors.name[0]).should_be("can't be null");
    p.errors = {};
    
    p.name = "";
    p.validatesPresenceOf("name", "can't be null");
    value_of(p.errors.name[0]).should_be("can't be null");
    p.errors = {};
    
    p.name = "Jesse";
    p.validatesPresenceOf("name", "can't be null");
    value_of(p.errors).should_be({});
  },
   "validatesLengthOf should verify the length of a property": function() {
    var length = { minimum: 5, maximum: 6 };
    p.name = "J";
    p.validatesLengthOf("name", length);
    value_of(p.errors.name[0]).should_be("name is too short");
    p.errors = {};
    
    p.name = "JesseTeates";
    p.validatesLengthOf("name", length);
    value_of(p.errors.name[0]).should_be("name is too long");
    p.errors = {};
    
    p.name = "Jesse";
    p.validatesLengthOf("name", length);
    value_of(p.errors).should_be({});
    
    length = { is: 5 };
    p.name = "J";
    p.validatesLengthOf("name", length);
    value_of(p.errors.name[0]).should_be("name is not the correct length");
    p.errors = {};
    
    p.name = "JesseT";
    p.validatesLengthOf("name", length);
    value_of(p.errors.name[0]).should_be("name is not the correct length");
    p.errors = {};
    
    p.name = "Jesse";
    p.validatesLengthOf("name", length);
    value_of(p.errors).should_be({});
    
    length = { allowEmpty: true };
    p.name = null;
    p.validatesLengthOf("name", length);
    value_of(p.errors).should_be({});
    p.errors = {};   
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

describe("Auto-linking and unlinking", {
  before_all: function() {
    initJazz();
  },
  after_all: function() {
    delete p;
    delete v;
    delete h;
    delete s;
    delete c;
  },
  "Loading a record which hasOne other record and deleting association property should unlink": function() {
    p = Person.first();
    v = p.vehicle;
    value_of(v.model).should_be("Forenza");
    value_of(v.person_id).should_be(1);
    delete p.vehicle;
    p.save();
    p = Person.first();
    v = Vehicle.find(v.id);
    value_of(v.person_id).should_be_null();
    value_of(p.vehicle).should_be_null();
  },
  "Assigning blongsTo record to hasOne record by association should link the two": function() {
    p = Person.first();
    value_of(p.vehicle).should_be_null();
    p.vehicle = Vehicle.first();
    value_of(p.vehicle.person_id).should_be_null();
    p.save();
    value_of(p.vehicle.person_id).should_be(1);
  },
  "Loading a belongsTo record and deleting association property should unlink": function() {
    v = Vehicle.first();
    value_of(v.owner.name).should_be("Nick");
    delete v.owner;
    v.save();
    value_of(v.owner).should_be_null();
    value_of(v.person_id).should_be_null();
  },
  "Assigning a hasOne record to a belongsTo record by association should link the two": function() {
    v = Vehicle.newRecord({model: "Diablo"});
    value_of(v.owner).should_be_undefined();
    v.owner = Person.last();
    v.save();
    value_of(v.person_id).should_be(5);
  },
  "Loading a record and deleting one of its hasMany items should unlink": function() {
    h = Home.first();
    value_of(h.people.length).should_be(2);
    value_of(h.people[0].name).should_be("Nick");
    delete h.people[0];
    h.save();
    value_of(h.people.length).should_be(1);
  },
  "Adding a record to a hasMany array should link the two records": function() {
    h = Home.first();
    value_of(h.people.length).should_be(1);
    h.people.push(Person.last());
    h.save();
    value_of(h.people.length).should_be(2);
  },
  "Loading a record and deleting one of its hasAndBelongsToMany items should unlink": function() {
    c = HighSchoolClass.first();
    value_of(c.students.length).should_be(2);
    value_of(Student.last().classes.length).should_be(1);
    c.students.pop();
    c.save();
    value_of(c.students.length).should_be(1);
    value_of(Student.last().classes.length).should_be(0);
  }
});