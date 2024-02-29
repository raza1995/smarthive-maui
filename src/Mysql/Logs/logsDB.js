import mysql from "mysql";
import { Sequelize } from "sequelize";

require("dotenv").config();

const username = process.env.SQL_USERNAME;
const password = process.env.SQL_PASSWORD;
const host = process.env.SQL_HOST;
const databaseName = process.env.SQL_DATABASE_NAME;
const port = process.env.SQL_PORT;
const logsDb = new Sequelize(databaseName, username, password, {
  host,
  port,
  dialect: "mysql",
  logging: false,
});
export default logsDb;
