import { Op } from "sequelize";
import companyModel from "../Companies/company.model";
import { createCompaniesPeerScoreHistoryLog } from "../CompaniesPeerScoreHistory/CompaniesPeerScoreHistory.service";
import sequelize from "../db";
import CompaniesAverageScoreHistoryModel from "./CompaniesAverageScoreHistory.model";

const schedule = require("node-schedule");

export const createCompaniesAverageScoreHistoryLog = async () => {
  try {
    const avgScore = await companyModel.findOne({
      where: { company_score: { [Op.gt]: 0 } },
      attributes: [sequelize.fn("AVG", sequelize.col("company_score"))],
      raw: true,
    });
    await CompaniesAverageScoreHistoryModel.create({
      average_score: avgScore["AVG(`company_score`)"],
    });
  } catch (err) {
    return err?.message;
  }
};

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = "Etc/UTC";

export const RunCreateCompanyAverageAndPeerScoreHistoryCrone = async () => {
  schedule.scheduleJob(rule, async () => {
    console.log("CreateCompanyAverageAndPeerScoreHistory Crone run at",new Date())
    await createCompaniesAverageScoreHistoryLog();
    await createCompaniesPeerScoreHistoryLog()
  });
};
