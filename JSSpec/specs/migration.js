describe("Automigration", {
  before_all: function() {
    initJazz();
  },
  "Migrating clean with no Fixtures": function() {
    value_of(JazzRecord.models.getLength()).should_be(6);
    value_of(Person.count()).should_be(0);
  },
  "Loading Fixtures with Refresh": function() {
    JazzRecord.migrate({fixtures: fixtures, refresh:true});
    value_of(Person.count()).should_be(5);
  },
  "Loading Fixtures without Refresh": function() {
    JazzRecord.migrate({fixtures:fixtures});
    value_of(Person.count()).should_be(10);
  }
});