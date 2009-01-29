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