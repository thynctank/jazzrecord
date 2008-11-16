var migrations = [
  {up:["createTable", "rabbits", {name: "text", parent_id: "number"}], down: ["dropTable", "rabbits"]},
  {up:["renameTable", "rabbits", "hares"], down: ["renameTable", "hares", "rabbits"]},
  {up:["addColumn", "hares", "title", "text"], down: ["removeColumn", "hares", "title"]}
];