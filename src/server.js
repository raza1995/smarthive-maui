import cors from "cors";
import { existsSync } from "fs";
import morgan from "morgan";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import setupDataDog from "./dataDog/setup";
import sequelize from "./Mysql/db";
import logsDb from "./Mysql/Logs/logsDB";
import postgresqlDb from "./Postgresql/postgresDb";
import { errorHandler } from "./utils/errorHandler";
// This line must come before importing any instrumented module.
const express = require("express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smarthive APIs",
      version: "1.0.0",
      description: "Swagger documentation of smarthive backend api",
    },
    servers: [
      {
        url:`${process.env.SERVER_LINK}/api/v1` ,
      },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};

const specs = swaggerJsDoc(options);
const app = express();

/** ************************* swagger documentation route *********************** */
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(specs));

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const apiRoutes = require("./routes/api");
const mainRoutes = require("./routes/index");
require("./cron/cronjob");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(`${__dirname}../public`));
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../public/uploads"))
);
app.use(
  "/media",
  express.static(path.resolve(__dirname, "../public/assets"))
);
app.use(
  express.urlencoded({
    extended: true,
  })
);
// Middle ware that is specific to this router
app.use("/api", (req, res, next) => {
  console.log("API end point", `/api${req.url}`, "API Time: ", Date.now());
  next();
});
app.use(express.json());
setupDataDog();
app.engine("html", require("ejs").renderFile);

app.set("view engine", "html");
app.set("views", __dirname);
// app.use(morgan('dev'));
try {
  sequelize.authenticate().then(() => {
    console.log("mySQl Connection has been established successfully.");
  });
  // eslint-disable-next-line no-console-in-catch
} catch (error) {
  console.error("Unable to connect to the mySQL database:", error);
}
try {
  postgresqlDb
    .authenticate()
    .then(() => {
      console.log(
        "opencve postgresql Connection has been established successfully."
      );
    })
    .catch((err) => {
      console.log(err);
    });
  // eslint-disable-next-line no-console-in-catch
} catch (error) {
  console.error("Unable to connect to the postgresql database:", error);
}
// deviceController.import()

try {
  logsDb.authenticate().then(() => {
    console.log(
      "mySQl Logs Database Connection has been established successfully."
    );
  });
  // eslint-disable-next-line no-console-in-catch
} catch (error) {
  console.error("Unable to connect to the Logs mySQL database:", error);
}

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("MongoDB connect successfully");
  })
  .catch((err) => errorHandler(err));

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use("/api/v1", apiRoutes);
app.use(mainRoutes);
app.get("*", (req, res) => {
  const filePath = path.resolve(__dirname, "../client/build", "index.html")
  if(existsSync(filePath)){
    res.sendFile(filePath);
  }else{
    res.sendFile(path.resolve(__dirname, "../public", "index.html"));
  }
});

app.listen(port, () =>
  console.log(`Server listening on port http://127.0.0.1:${port}`)
);
