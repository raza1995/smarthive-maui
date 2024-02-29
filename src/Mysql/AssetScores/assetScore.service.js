import { getRiskCostToleranceScoreApi } from "../../api/riskCost";
import { CliProgressBar } from "../../utils/cliProgressBar";
import { errorHandler } from "../../utils/errorHandler";
import { addAssetScoreLogs } from "../AssetScoreLogs/assetScoreLogs.service";
import {
  assetsScoreCreateActivity,
  assetsScoreDeleteActivity,
  assetsScoreUpdateActivity,
} from "../Logs/ActivitiesType/assetsScoreActivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import AssetScoreSQLModel from "./assetScore.model";

export const updateAndCreateAssetScore = async (item, asset_name) => {
  const asset = await AssetScoreSQLModel.findOne({
    where: { asset_id: item.asset_id },
  });
  // const tolerance_score = await getRiskCostToleranceScoreApi(item)
  // item.tolerance_score = tolerance_score;
  if (asset) {
    await AssetScoreSQLModel.update(item, {
      where: {
        asset_id: item.asset_id,
      },
      individualHooks: true,
    })
      .then(async () => {
        const updateAssetScore = await AssetScoreSQLModel.findOne({
          where: {
            id: asset.id,
          },
        });
        await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: `risk score changed, asset ${asset_name || ""}.`,
            user_id: null,
            asset_id: asset.asset_id,
            company_id: asset.company_id,
            isSystemLog: true,
          },

          assetsScoreUpdateActivity.status.assetUpdatedSuccessfully.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updateAssetScore)),
            JSON.parse(JSON.stringify(asset)),
            AssetScoreSQLModel.tableName
          )
        );
      })
      .catch(async (err) => {
        await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: `risk score changed, asset ${asset_name || ""}`,
            user_id: null,
            company_id: asset.company_id,
            asset_id: asset.asset_id,
            isSystemLog: true,
          },
          assetsScoreUpdateActivity.status.assetUpdatingFailed.code,
          null,
          err.message
        );
      });
  } else {
    const newAssetScore = await AssetScoreSQLModel.create(item, {
      hooks: true,
    });
    await addEventLog(
      {
        client_id: null,
        client_email: "system",
        process: `risk score calculated, asset ${asset_name || ""}`,
        user_id: null,
        company_id: newAssetScore.company_id,
        asset_id: newAssetScore.asset_id,
        isSystemLog: true,
      },
      assetsScoreCreateActivity.status.assetsScoreCreatedSuccessfully.code,
      createEventPayload(
        JSON.parse(JSON.stringify(newAssetScore)),
        {},
        AssetScoreSQLModel.tableName
      )
    );
  }
  await addAssetScoreLogs({
    company_id: item.company_id,
    asset_id: item.asset_id,
    risk_score: item.risk_score,
  });
};
export const updateOrCreateAssetsScore = async (items) => {
  try {
    let i = 0;
    const startTime = new Date();
    console.log("assets to save", items.length);
    for await (const item of items) {
      await updateAndCreateAssetScore(item);
      CliProgressBar("Asset-score save to db", i, items.length, startTime);
      i++;
      // console.log("Asset-score save to db", percentage, "%done...");
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const findAssetScoreByFilter = async (filterObj) => {
  try {
    const assetData = await AssetScoreSQLModel.findOne({
      where: filterObj,
    });
    return Promise.resolve(assetData);
  } catch (err) {
    return Promise.reject(err);
  }
};
