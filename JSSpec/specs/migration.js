describe("Automigration", {
  before_all: function() {
    initJazz();
  },
  "Migrating clean with no Fixtures": function() {
    JazzRecord.fixtures = null;
    JazzRecord.migrate({refresh: true});
    value_of(JazzRecord.models.getLength()).should_be(6);
    value_of(Person.count()).should_be(0);
  },
  "Loading Fixtures with Refresh": function() {
    JazzRecord.migrations = null;
    JazzRecord.fixtures = fixtures;
    JazzRecord.migrate({refresh:true});
    value_of(Vehicle.count()).should_be(2);
  },
  "Loading Fixtures through loadFixtures": function() {
    JazzRecord.fixtures = fixtures;
    JazzRecord.loadFixtures();
    value_of(Vehicle.count()).should_be(4);
  }
});

describe("Manual Migrations", {
    before_all: function() {
      JazzRecord.migrations = null;
      JazzRecord.fixtures = null;
      JazzRecord.migrate({refresh: true});
    },                                     
    "Adding Tables": function() {
        JazzRecord.createTable('caffeine', 
        {
           id: "int",
           brand: "text"
        });
        Caffeine = new JazzRecord.Model({
            table: 'caffeine',
            columns: {
                id: 'int',
                brand: 'text'
            }
        });
        value_of(Caffeine.count()).should_be(0);
        Caffeine.create({
           brand: 'jolt'
        });
        value_of(Caffeine.count()).should_be(1);       
    },
    
    "Adding a new column": function() {
      Caffeine.create({
          brand: 'bawls',
          caffeineContent: 9000
      });
      value_of(Caffeine.last().caffeineContent).should_be(undefined);      
      JazzRecord.addColumn('caffeine', 'caffeineContent',"int");
      
      Caffeine.create({
          brand: 'fullthrottle',
          caffeineContent: 9000
      });
      value_of(Caffeine.last().caffeineContent).should_be(9000);
    }
    
});