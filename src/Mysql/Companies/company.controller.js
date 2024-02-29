import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import { updateCompanyScoreHistory } from "../CompanyScoreHistory/companyScoreHistory.service";
import { updateCompany, getCompaniesWithSize } from "./company.service";

export const calculateAndUpdateCompanyScore = async (company_id) => {
  const sumOfAllRiskScores = await AssetScoreSQLModel.sum("risk_score", {
    where: {
      company_id,
    },
  });
  const count = await AssetScoreSQLModel.count({
    where: {
      company_id,
    },
  });
  const score = sumOfAllRiskScores > 0 ? Math.round(sumOfAllRiskScores / count) : 0;
  await updateCompany(company_id, {
    company_score: score,
  });
  await updateCompanyScoreHistory(company_id, score)
};

export const getAllCompanies = async (req, res) => {
  try {
    const { filter } = req.query;
    const { page } = req.query;
    const { size } = req.query;
    const companies = await getCompaniesWithSize(filter, page, size);
    res.status(StatusCodes.OK).json({
        valid: true,
        ...companies,
        message: "Partners fetched successfully",
    });
  } catch (err) {
      errorHandler(err);
      return res
      .status(400)
      .json({ valid: false, error: err?.message});
  }
}
