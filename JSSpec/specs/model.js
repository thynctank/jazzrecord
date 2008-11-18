describe("Model", {
  before_all: function() {
    initJazz();
    
    BlackBox = new JazzRecord.Model({
      table: "black_boxes",
      foreignKey: "black_box_id",
      hasOne: {content: "box_contents"},
      columns: {
        label: "string",
        number: "number"
      },
      modelMethods: {
        "findMiddleBox": function() {
          var middleNumber = (this.count()/2).round();
          return this.find(middleNumber);
        }
      },
      validate: {
        atSave: function() {
          this.validatesIsString("label");
          this.validatesIsInt("number");
        }
      }
    });
    
    BoxContent = new JazzRecord.Model({
      table: "box_contents",
      belongsTo: {box: "black_boxes"},
      columns: {
        description: "string",
        black_box_id: "number"
      }
    });
    
    JazzRecord.migrate({refresh: true});
  },
  after_all: function() {
    delete BlackBox;
    delete BoxContent;
    JazzRecord.migrate({refresh: true, fixtures: fixtures});
  },
  "Querying user-provided models": function() {
    value_of(BlackBox.count()).should_be(0);
    
    (3).times(function(i) {
      var boxNum = i + 1;
      var b = BlackBox.create({label: "Box " + boxNum, number: boxNum});
      b.content = BoxContent.create({description: "Box Contents " + boxNum});
      b.save();
    });
    
    value_of(BlackBox.count()).should_be(3);
    value_of(BlackBox.find(1).getData()).should_be({label: "Box 1", number: 1});
  },
  "Custom query using modelMethods" : function() {
    value_of(BlackBox.findMiddleBox().getData().label).should_be("Box 2");
  },
  "Loading associated records": function() {
    value_of(BlackBox.last().content.description).should_be("Box Contents 3");
  },
  "Updating associated record data on save of primary": function() {
    var firstBox = BlackBox.first();
    firstBox.label = "Closet Box";
    var secretText = "a deep dark secret";
    firstBox.content.description = secretText;
    firstBox.save();
    
    value_of(BlackBox.find(1).content.description).should_be(secretText);
  },
  "Should not allow saving of invalid data": function() {
    var invalidBox = BlackBox.create({label: 2, number: "Not a Number"});
    value_of(invalidBox).should_have(2, "errors");
  }
});
describe("Finders", {
  before_all: function() {
    initJazz();
    JazzRecord.migrate({fixtures:fixtures, refresh:true});
  },
  
  // test for ID or array, custom select, custom order, limit, offset, conditions
  
  "find": function() {
    // single ID
    value_of(Person.find(1).name).should_be("Nick");
    // array of IDs
    value_of(Person.find([1,3,5])).should_have(3, "items");
  },
  "all": function() {
    value_of(Person.all()).should_have(5, "items");
    value_of(Person.all().getLast().name).should_be("Jesse");
    // custom orders
    value_of(Person.all({order: "name desc"})[0].name).should_be("Terri");
    value_of(Person.all({order: "name asc"})[0].name).should_be("David");
    // custom conditions
    value_of(Person.all({conditions: "name like '%i%'"})).should_have(3, "items");
    value_of(Person.all({conditions: "name like '%k%'"})).should_have(2, "items");
    // custom limit
    value_of(Person.all({limit: 4})).should_have(4, "items");
    // custom offset
    value_of(Person.all({limit: 4, offset: 2})).should_have(3, "items");
  },
  "findBy": function() {
    value_of(Person.findBy("name", "Nick").id).should_be(1);
    // verify even with multiple matching items, only first is returned
    value_of(Person.findBy("home_id", 1).name).should_be("Nick");
  },
  "findAllBy": function() {
    value_of(Person.findAllBy("name", "Nick")).should_have(1, "items");
    // verify with multiple matching items, all are returned
    value_of(Person.findAllBy("home_id", 1)).should_have(2, "items");
  },
  "first": function() {
    value_of(Animal.first().speak()).should_be("rawr!");
    // without custom select, other columns are not ommitted
    value_of(Person.first()).should_include("age");
    value_of(Person.first()).should_include("home_id");
    value_of(Person.first()).should_include("has_vehicle");
    
    // custom select, other columns should be ommitted
    value_of(Person.first({select: "name"}).name).should_be("Nick");
    value_of(Person.first({select: "name"})).should_not_include("age");
    value_of(Person.first({select: "name"})).should_not_include("home_id");
    value_of(Person.first({select: "name"})).should_not_include("has_vehicle");
  },
  "last": function() {
    value_of(Person.last().name).should_be("Jesse");
  },
  "count": function() {
    value_of(Person.count()).should_be(5);
  }
});

// test each of 4 kinds of associations
describe("Finder association loading", {
  before_all: function() {
    initJazz();
    JazzRecord.migrate({fixtures:fixtures, refresh:true});
  },
  "Loading a hasOne association": function() {
    value_of(Person.first().vehicle.model).should_be("Forenza");
  },
  "Loading a belongsTo association": function() {
    value_of(Person.first().home.address).should_be("4605 Deming Ave");
  },
  "Loading a hasMany association": function() {
    value_of(Home.first()).should_have(2, "people");
    value_of(Home.first().people[0].name).should_be("Nick");
  },
  "Loading hasAndBelongsToMany associations": function() {
    value_of(HighSchoolClass.first()).should_have(2, "students");
    value_of(HighSchoolClass.first().students[0].name).should_be("Joe Bob");
    
    value_of(Student.first()).should_have(2, "classes");
    value_of(Student.first().classes[1].name).should_be("Phys. Ed.");
  }
});