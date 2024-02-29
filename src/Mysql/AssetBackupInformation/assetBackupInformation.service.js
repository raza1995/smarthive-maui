import moment from "moment";
import { errorHandler } from "../../utils/errorHandler";
import { updateAssetRiskScore } from "../AssetScores/assetScore.controller";
import AssetBackupInformationModel from "./assetBackupInformation.model";

export const calculateBackupScore = (lastBackupAt) => {
  let riskScore = 350;
  const currentDate = moment();
  const lastBackupAtDate = moment(lastBackupAt);
  const timeDiff = currentDate.diff(lastBackupAtDate, "hours");
  console.log("timeDiff", timeDiff, "lastBackupAtDate", lastBackupAtDate);
  if (timeDiff <= 24) {
    riskScore = 850;
  } else if (timeDiff <= 48) {
    riskScore = 720;
  } else if (timeDiff <= 72) {
    riskScore = 650;
  } else {
    riskScore = 350;
  }
  return riskScore;
};
export const updateOrCreateBackupInformation = async (data) => {
  try {
    if (data?.asset_id) {
      const asset = await AssetBackupInformationModel.findOne({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: data.integration_id,
        },
      });

      if (asset) {
        await AssetBackupInformationModel.update(data, {
          where: {
            id: asset.id,
          },
        });
        const updatePatchingInformation =
          await AssetBackupInformationModel.findOne({
            where: { id: asset.id },
          });
        console.log(
          `asset backup information updated for asset id ${asset.asset_id}`
        );
        // addEventLog(
        //   {
        //     client_id: null,
        //     client_email: "system",
        //     process: "asset patching information updated",
        //     user_id: null,
        //     company_id: asset.company_id,
        //     asset_id: asset.asset_id,
        //     isSystemLog: true
        //   },
        //   updatePatchingAssetInfo.status.updatePatchingAssetInfoSuccess.code,
        //   createEventPayload(
        //     JSON.parse(JSON.stringify(updatePatchingInformation)),
        //     JSON.parse(JSON.stringify(asset)),
        //     AssetPatchingInformationModel.tableName
        //   )
        // );
        await updateAssetRiskScore(asset.asset_id);
      } else {
        const newAssetsPatchInfo = await AssetBackupInformationModel.create(
          data
        );
        console.log(
          `new asset Backup information created for asset id ${newAssetsPatchInfo.id}`
        );
        // await addEventLog(
        //   {
        //     client_id: null,
        //     client_email: "system",
        //     process: "asset patching information added",
        //     user_id: null,
        //     company_id: newAssetsPatchInfo.company_id,
        //     asset_id: newAssetsPatchInfo.asset_id,
        //     isSystemLog: true
        //   },
        //   createPatchingAssetInfo.status.createPatchingAssetInfoSuccess.code,
        //   createEventPayload(
        //     JSON.parse(JSON.stringify(newAssetsPatchInfo)),
        //     {},
        //     AssetPatchingInformationModel.tableName
        //   )
        // );

        await updateAssetRiskScore(newAssetsPatchInfo.asset_id);
      }
      const deleteAssets = await AssetBackupInformationModel.destroy({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: null,
        },
      }).then((resp) => {
        if (resp > 0) {
          console.log("delete Backup information", resp);
        }
        return resp;
      });
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
