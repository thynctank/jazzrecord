describe("Automigration", {
  before_all: function() {
    initJazz();
  },
  "Migrating clean with no Fixtures": function() {
    JazzRecord.fixtures = null;
    JazzRecord.migrate({refresh: true});
    value_of(JazzRecord.models.getLength()).should_be(7);
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
    Caffeine = new JazzRecord.Model({
      table: 'caffeine',
      columns: {
        id: 'int',
        brand: 'text'
      }
    });
  
    JazzRecord.migrations = {
      1: {
        up: function() {
          JazzRecord.createTable("caffeine", {
            id: 'int',
            brand: 'text'
          });
        },
        down: function() {
          JazzRecord.dropTable("caffeine");
        }
      },
      2: {
        up: function() {
          JazzRecord.addColumn("caffeine", "caffeineContent", "int");
        },
        down: function() {
          JazzRecord.removeColumn("caffeine", "caffeineContent");
        }
      },
      3: {
        up: function() {
          JazzRecord.renameColumn("caffeine", "caffeineContent", "caffeine");
        },
        down: function() {
          JazzRecord.renameColumn("caffeine", "caffeine", "caffeineContent");
        }
      },
      4: {
        up: function() {
          JazzRecord.removeColumn("caffeine", "caffeineContent");
        },
        down: function() {
          JazzRecord.addColumn("caffeine", "caffeineContent", "int");
        }
      },
      5: {
        up: function() {
          JazzRecord.changeColumn("caffeine", "brand", "int");
        },
        down: function() {
          JazzRecord.changeColumn("caffeine", "brand", "text");
        }
      }
    };
    JazzRecord.fixtures = null;
    JazzRecord.migrate({refresh: true, number: 0});
  },
  after_all: function() {
    JazzRecord.migrations = null;
    JazzRecord.migrate({refresh: true});
    delete Caffeine;
  },
  "Migrating up and down": function() {
    value_of(JazzRecord.currentSchemaVersion()).should_be(0);
    JazzRecord.migrate(1);
    value_of(JazzRecord.currentSchemaVersion()).should_be(1);
    JazzRecord.migrate(0);
    value_of(JazzRecord.currentSchemaVersion()).should_be(0);
  },
  "Adding a table": function() {
    JazzRecord.migrate(1);
    value_of(Caffeine.count()).should_be(0);
    Caffeine.create({brand: 'Jolt'});
    value_of(Caffeine.count()).should_be(1);
  },
  "Adding a column": function() {
    value_of(Caffeine.last().caffeineContent).should_be(undefined);
    JazzRecord.migrate(2);
    Caffeine.create({brand: "Bawls", caffeineContent: 9000});
    value_of(Caffeine.last().caffeineContent).should_be(9000);
  },
  "Renaming a column": function() {
    value_of(JazzRecord.currentSchemaVersion()).should_be(2);
    JazzRecord.migrate(3);
    value_of(JazzRecord.currentSchemaVersion()).should_be(3);
    Caffeine.create({brand: "Bawls", caffeine: 5000});
    value_of(Caffeine.last().caffeine).should_be(5000);
  },
  "Removing a column": function() {
    JazzRecord.migrate(4);
    value_of(JazzRecord.currentSchemaVersion()).should_be(4);
    Caffeine.create({brand: "Bawls" });
    value_of(Caffeine.last().caffeine).should_be(null);
  },
  "Changing a columns type": function() {
    value_of(JazzRecord.currentSchemaVersion()).should_be(4);
    JazzRecord.migrate(5);
    value_of(JazzRecord.currentSchemaVersion()).should_be(5);
    value_of(Caffeine.options.columns.brand).should_be("int");
  
    // migrate all the way down
    JazzRecord.migrate(0);
    value_of(JazzRecord.currentSchemaVersion()).should_be(0);
  }
});