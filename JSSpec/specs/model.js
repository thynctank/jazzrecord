describe("Adding new Models", {
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
  "Should Allow for it to be queried": function() {
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
  "Should have working custom query" : function() {
    value_of(BlackBox.findMiddleBox().getData().label).should_be("Box 2");
  },
  "Should load associated data": function() {
    value_of(BlackBox.last().content.description).should_be("Box Contents 3");
  },
  "Associated record should update on primary record's save if primary has changed first-order data": function() {
    var firstBox = BlackBox.first();
    firstBox.label = "Closet Box";
    var secretText = "a deep dark secret";
    firstBox.content.description = secretText;
    firstBox.save();
    
    value_of(BlackBox.find(1).content.description).should_be(secretText);
  }
});
