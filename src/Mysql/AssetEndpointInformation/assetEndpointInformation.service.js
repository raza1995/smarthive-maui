import { errorHandler } from "../../utils/errorHandler";
import { updateAssetRiskScore } from "../AssetScores/assetScore.controller";
import { updateEndpointAssetInfo } from "../Logs/ActivitiesType/EndpointActivityType";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import AssetEndpointInformationModel from "./assetEndpointInformation.model";

export const updateOrCreateEndpointInformation = async (data) => {
  try {
    if (data?.asset_id) {
      const asset = await AssetEndpointInformationModel.findOne({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: data.integration_id,
        },
      });

      if (asset) {
        await AssetEndpointInformationModel.update(data, {
          where: {
            id: asset.id,
          },
        });
        const updateAsset = await AssetEndpointInformationModel.findOne({
          where: { id: asset.id },
        });
        addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset endpoint information changed",
            user_id: null,
            company_id: asset.company_id,
            asset_id: asset.asset_id,
            isSystemLog: true,
          },
          updateEndpointAssetInfo.status.updateEndpointAssetInfoSuccess.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updateAsset)),
            JSON.parse(JSON.stringify(asset)),
            AssetEndpointInformationModel.tableName
          )
        );
        // console.log(
        //   `asset endpoint information updated for asset id ${asset.asset_id}`
        // );
        await updateAssetRiskScore(asset.asset_id);
      } else {
        const newAssetsEndpointInfo =
          await AssetEndpointInformationModel.create(data);
        await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset endpoint information added",
            user_id: null,
            company_id: newAssetsEndpointInfo.company_id,
            asset_id: newAssetsEndpointInfo.asset_id,
            isSystemLog: true,
          },
          updateEndpointAssetInfo.status.updateEndpointAssetInfoSuccess.code,
          createEventPayload(
            JSON.parse(JSON.stringify(newAssetsEndpointInfo)),
            {},
            AssetEndpointInformationModel.tableName
          )
        );
        // console.log(
        //   `new asset endpoint information  created for asset id ${newAssetsEndpointInfo.asset_id}`
        // );
        await updateAssetRiskScore(newAssetsEndpointInfo.asset_id);
      }
      await AssetEndpointInformationModel.destroy({
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
