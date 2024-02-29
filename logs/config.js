const { format } = require("winston");
const winston = require("winston");
require("dotenv").config();

const httpTransportOptions = {
  host: "http-intake.logs.datadoghq.com",
  path: `/api/v2/logs?dd-api-key=${process.env.DATADOG_API_KEY}&ddsource=nodejs&service=smarthive-server`,
  ssl: true,
};
const logConfiguration = winston.createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.Http(httpTransportOptions),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

exports.logger = winston.createLogger(logConfiguration);
