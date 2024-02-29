import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import { updateAssetRiskScore } from "../AssetScores/assetScore.controller";
import assetSourcesModel from "../AssetSources/assetSources.model";
import IntegrationModel from "../Integration/integration.model";
import {
  createPatchingAssetInfo,
  updatePatchingAssetInfo
} from "../Logs/ActivitiesType/AssetPatchingInformationActivityType";
import {
  addEventLog,
  createEventPayload
} from "../Logs/eventLogs/eventLogs.controller";
import AssetPatchingInformationModel from "./assetPatchingInformation.model";

export const updateOrCreatePatchingInformation = async (data) => {
  try {
    if (data?.asset_id) {
      const asset = await AssetPatchingInformationModel.findOne({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: data.integration_id
        }
      });

      if (asset) {
        await AssetPatchingInformationModel.update(data, {
          where: {
            id: asset.id
          }
        });
        const updatePatchingInformation =
          await AssetPatchingInformationModel.findOne({
            where: { id: asset.id }
          });
        console.log(
          `asset patching information updated for asset id ${asset.asset_id}`
        );
        addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset patching information updated",
            user_id: null,
            company_id: asset.company_id,
            asset_id: asset.asset_id,
            isSystemLog: true
          },
          updatePatchingAssetInfo.status.updatePatchingAssetInfoSuccess.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updatePatchingInformation)),
            JSON.parse(JSON.stringify(asset)),
            AssetPatchingInformationModel.tableName
          )
        );
        await updateAssetRiskScore(asset.asset_id);
      } else {
        const newAssetsPatchInfo = await AssetPatchingInformationModel.create(
          data
        );
        console.log(
          `new asset patching information created for asset id ${newAssetsPatchInfo.id}`
        );
        await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset patching information added",
            user_id: null,
            company_id: newAssetsPatchInfo.company_id,
            asset_id: newAssetsPatchInfo.asset_id,
            isSystemLog: true
          },
          createPatchingAssetInfo.status.createPatchingAssetInfoSuccess.code,
          createEventPayload(
            JSON.parse(JSON.stringify(newAssetsPatchInfo)),
            {},
            AssetPatchingInformationModel.tableName
          )
        );

        await updateAssetRiskScore(newAssetsPatchInfo.asset_id);
      }
      const deleteAssets = await AssetPatchingInformationModel.destroy({
        where: {
          asset_id: data.asset_id,
          company_id: data.company_id,
          integration_id: null
        }
      });
      console.log("delete assets", deleteAssets);
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const assetswithoutPatchService = async (filterObj, SourceValidation) =>
  assetSQLModel
    .findAndCountAll({
      where: filterObj,
      col: "id",
      include: [
        {
          model: assetSourcesModel,
          required: true,
          include: [
            {
              model: IntegrationModel,
              where: {
                integration_category_type: { [Op.notIn]: ["Patching"] }
              },
              required: true
            }
          ]
        },
        { ...SourceValidation }
      ]
    })
    .then((resp) => resp.rows.length);

export const totalPatchingAssetsCountService = async (
  filterObj,
  SourceValidation
) =>
  assetSQLModel
    .findAndCountAll({
      where: filterObj,
      col: "id",
      include: [{ ...SourceValidation }]
    })
    .then((resp) => resp.rows.length);

export const updatedPatchingAssetsCountService = async (
  filterObj,
  SourceValidation
) =>
  assetSQLModel
    .findAndCountAll({
      where: filterObj,
      col: "id",
      include: [
        {
          model: AssetPatchingInformationModel,
          where: {
            all_patch_installed: true,
            is_compatible: true
          },
          required: true
        },
        {
          ...SourceValidation
        }
      ]
    })
    .then((resp) => resp.rows.length);
