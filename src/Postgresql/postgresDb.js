import { Sequelize } from "sequelize";

require("dotenv").config();


const username = process.env.POSTGRESQL_USERNAME;
const password = process.env.POSTGRESQL_PASSWORD;
const databaseName = process.env.POSTGRESQL_DATABASE_NAME;
const host = process.env.POSTGRESQL_HOST;

const postgresqlDb = new Sequelize(databaseName, username, password, {
  host,
  dialect: "postgres",
  logging: false,
});

export default postgresqlDb;
