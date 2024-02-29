import { errorHandler } from "../../utils/errorHandler";
import { updateAssetRiskScore } from "../AssetScores/assetScore.controller";
import { updateLifecycleAssetInfo } from "../Logs/ActivitiesType/LifecycleActivity";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import AssetLifecycleInformationModel from "./assetLifecycleInformation.model";

export const updateOrCreateLifecycleInformation = async (data) => {
  try {
    if (data?.asset_id) {
      const asset = await AssetLifecycleInformationModel.findOne({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: data.integration_id,
        },
      });

      if (asset) {
        await AssetLifecycleInformationModel.update(data, {
          where: {
            id: asset.id,
          },
        });
        const updateAsset = await AssetLifecycleInformationModel.findOne({
          where: { id: asset.id },
        });
        addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset lifecycle information changed",
            user_id: null,
            company_id: asset.company_id,
            asset_id: asset.asset_id,
            isSystemLog: true,
          },
          updateLifecycleAssetInfo.status.updateLifecycleAssetInfoSuccess.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updateAsset)),
            JSON.parse(JSON.stringify(asset)),
            AssetLifecycleInformationModel.tableName
          )
        );
        // console.log(
        //   `asset endpoint information updated for asset id ${asset.asset_id}`
        // );
        await updateAssetRiskScore(asset.asset_id);
      } else {
        const newAssetLifecycleInfo =
          await AssetLifecycleInformationModel.create(data);
        await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset lifecycle information added",
            user_id: null,
            company_id: newAssetLifecycleInfo.company_id,
            asset_id: newAssetLifecycleInfo.asset_id,
            isSystemLog: true,
          },
          updateLifecycleAssetInfo.status.updateLifecycleAssetInfoFailed.code,
          createEventPayload(
            JSON.parse(JSON.stringify(newAssetLifecycleInfo)),
            {},
            AssetLifecycleInformationModel.tableName
          )
        );
        // console.log(
        //   `new asset endpoint information  created for asset id ${newAssetLifecycleInfo.asset_id}`
        // );
        await updateAssetRiskScore(newAssetLifecycleInfo.asset_id);
      }
      await AssetLifecycleInformationModel.destroy({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: null,
        },
      }).then((res) => {
        console.log("delete assets", res);
      });
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
