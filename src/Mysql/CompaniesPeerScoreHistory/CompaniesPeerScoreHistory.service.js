import { Op } from "sequelize";
import companyModel, { companyIndustryTypes } from "../Companies/company.model";
import sequelize from "../db";
import CompaniesPeerScoreHistoryModel from "./CompaniesPeerScoreHistory.model";

export const createCompaniesPeerScoreHistoryLog = async () => {
  try {
    companyIndustryTypes.map(async (industry_type) => {
      const peerScore = await companyModel.findOne({
        where: {
          company_score: { [Op.gt]: 0 },
          industry_type,
        },
        attributes: [sequelize.fn("AVG", sequelize.col("company_score"))],
        raw: true,
      });
      const peer_score = peerScore["AVG(`company_score`)"];
      console.log(peer_score, peer_score >= 0);
      if (peer_score >= 0 && peer_score !== null) {
        await CompaniesPeerScoreHistoryModel.create({
          industry_type,
          peer_score,
        });
      }
    });
  } catch (err) {
    return err?.message;
  }
};
