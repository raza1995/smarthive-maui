const winstonLogger = require("./config");

const { logger } = winstonLogger;

const limit = process.argv?.[2]?.replace("--", "");
console.log({ limit });
const options = {
  from: new Date() - 7 * 24 * 60 * 60 * 1000,
  until: new Date(),
  limit: +limit || 10,
  start: 0,
  order: "desc",
};

//
// Find items logged between today and yesterday.
//
logger.query(options, (err, results) => {
  if (err) {
    /* TODO: handle me */
    throw err;
  }

  console.log(results);
});
