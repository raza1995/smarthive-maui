const neo4j = require("neo4j-driver");

export const driver = neo4j.driver(
  "bolt://18.204.197.170:7687",
  neo4j.auth.basic("neo4j", "conjecture-tons-produce")
);
export const neoSession = driver.session({ database: "neo4j" });
