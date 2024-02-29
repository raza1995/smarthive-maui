import { OpenCVECronFunction } from "../mongo/OpenCVE/OpenCVECron";
import { RunCreateCompanyAverageAndPeerScoreHistoryCrone } from "../Mysql/CompaniesAverageScoreHistory/CompaniesAverageScoreHistory.service";
import cron from "./cronFunction";

const schedule = require("node-schedule");

const time = 1;
const job = schedule.scheduleJob(`*/${time} * * * *`, () => {
  if (process.env.ENVIRONMENT === "CRON") {
    // OpenCVECronFunction()
    cron();
  }
});
RunCreateCompanyAverageAndPeerScoreHistoryCrone();
