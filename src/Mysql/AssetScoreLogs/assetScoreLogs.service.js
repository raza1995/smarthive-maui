import { errorHandler } from "../../utils/errorHandler";
import AssetScoreLogsModel from "./assetScoreLogs.model";

export const addAssetScoreLogs = async (item) => {
  try {
    const oldScore = await AssetScoreLogsModel.findAll({
      where: { asset_id: item.asset_id, company_id: item.company_id },
      order: [["updatedAt", "DESC"]],
      limit: 2,
    });
    const lastScore = oldScore?.[0]?.risk_score;
    if (lastScore !== item.risk_score) {
      await AssetScoreLogsModel.create(item);
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
