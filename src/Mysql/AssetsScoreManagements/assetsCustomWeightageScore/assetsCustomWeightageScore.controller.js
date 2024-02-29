import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import {
  calculateAssetScore,
  calculateLifecycleScore,
} from "../../AssetScores/assetScore.controller";
import { createAssetsCustomScoreActivity } from "../../Logs/ActivitiesType/assetsactivities";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import assetsCustomWeightageScoreModel from "./assetsCustomWeightageScore.model";
import assetSQLModel from "../../Assets/assets.model";
import AssetEndpointInformationModel from "../../AssetEndpointInformation/assetEndpointInformation.model";
import AssetPatchingInformationModel from "../../AssetPatchingInformation/assetPatchingInformation.model";
import AssetLifecycleInformationModel from "../../AssetLifecycleInformation/assetLifecycleInformation.model";
import { scoreNotAvailable } from "../../../utils/Constants/scoreWeightages";
import AssetScoreSQLModel from "../../AssetScores/assetScore.model";
import AssetBackupInformationModel from "../../AssetBackupInformation/assetBackupInformation.model";

const {
  getAssetsCompanyByFilterAndAttributes,
} = require("../../Assets/assets.service");
const {
  default: assetsScoreWeightageModel,
} = require("../assetsScoreWeightage/assetsScoreWeightage.model");

const addCustomScoreInAssetScoresTable = async (assetId) => {
  const assetsCustomWeightageScores =
    await assetsCustomWeightageScoreModel.findAll({
      where: {
        asset_id: assetId,
      },
      include: [
        {
          model: assetsScoreWeightageModel,
          required: true,
        },
      ],
      order: [[assetsScoreWeightageModel, "priority", "ASC"]],
    });
  return assetsCustomWeightageScores.length > 0
    ? AssetScoreSQLModel.update(
        {
          custom_methodology_risk_score:
            assetsCustomWeightageScores[0].risk_score,
        },
        {
          where: {
            asset_id: assetId,
          },
          individualHooks: true,
        }
      )
    : false;
};
const updateAndCreateCustomWeightageAssetScore = async (
  asset,
  assetRiskScoresWeightages,
  weightage_id,
  client
) => {
  const assetInfo = await assetSQLModel.findOne({
    where: { id: asset.id },
    include: [
      {
        model: AssetEndpointInformationModel,
        attributes: ["risk_score", "os_install_version", "os_current_version"],
      },
      {
        model: AssetPatchingInformationModel,
        attributes: ["risk_score", "os_version"],
      },
      {
        model: AssetLifecycleInformationModel,
        attributes: ["risk_score", "software_version"],
      },
      {
        model: AssetBackupInformationModel,
        attributes: ["risk_score"],
      },
    ],
  });
  const assetScoreData = {
    asset_type: assetInfo?.asset_type,
    lifecycle_score: assetInfo?.asset_lifecycle_informations?.[0]
      ? assetInfo?.asset_lifecycle_informations?.[0]?.risk_score
      : calculateLifecycleScore(asset),
    backup_score: assetInfo?.asset_backup_informations?.[0]
      ? assetInfo?.asset_backup_informations?.[0]?.risk_score
      : scoreNotAvailable,
    endpoint_score: assetInfo?.asset_endpoint_informations?.[0]
      ? assetInfo?.asset_endpoint_informations?.[0]?.risk_score
      : scoreNotAvailable,
    patching_score: assetInfo?.asset_patching_informations?.[0]
      ? assetInfo?.asset_patching_informations?.[0]?.risk_score
      : scoreNotAvailable,
    real_time_score: assetInfo?.asset_realtime_informations?.[0]
      ? assetInfo?.asset_realtime_informations?.[0]?.risk_score
      : 850,
  };

  const { risk_score, pureRiskScore, isPureScore } = calculateAssetScore(
    assetScoreData,
    assetRiskScoresWeightages
  );

  const assetsScoreInDb = await assetsCustomWeightageScoreModel.findOne({
    where: {
      asset_id: asset.id,
      weightage_id,
    },
  });
  const assetScore = {
    company_id: asset.company_id,
    weightage_id,
    asset_id: asset.id,
    risk_score,
    pure_risk_score: pureRiskScore,
  };
  if (assetsScoreInDb?.id) {
    await assetsCustomWeightageScoreModel.update(assetScore, {
      where: {
        id: assetsScoreInDb.id,
      },
    });
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Update "${asset.asset_name}" assets custom weightage score`,
          user_id: client?.client_id,
          asset_id: asset.id,
          target_id: assetsScoreInDb.id,
          effected_table: assetsCustomWeightageScoreModel.tableName,
          company_id: asset.company_id,
          isSystemLog: false,
        },
        createAssetsCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          { id: assetsScoreInDb.id, ...assetScore },
          JSON.parse(JSON.stringify(assetsScoreInDb)),
          assetsCustomWeightageScoreModel.tableName
        )
      );
    }
  } else {
    const newScore = await assetsCustomWeightageScoreModel.create(assetScore);
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Calculate "${asset.asset_name}" assets custom weightage score`,
          user_id: client?.client_id,
          asset_id: asset.id,
          target_id: newScore.id,
          effected_table: assetsCustomWeightageScoreModel.tableName,
          company_id: asset.company_id,
          isSystemLog: false,
        },
        createAssetsCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newScore)),
          {},
          assetsCustomWeightageScoreModel.tableName
        )
      );
    }
  }
  await addCustomScoreInAssetScoresTable(asset.id);
};
export const createCustomWeightageAssetsScore = async (
  customWeightageId,
  client
) => {
  try {
    const customWeightageData = await assetsScoreWeightageModel.findOne({
      where: {
        id: customWeightageId,
      },
    });
    const assetsLinked = await getAssetsCompanyByFilterAndAttributes(
      customWeightageData.company_id,
      "all",
      1,
      customWeightageData.filter
    );
    const assetRiskScoresWeightages = {
      lifecycleScoreWeightage: parseInt(
        customWeightageData.lifecycle_weightage,
        10
      ),
      backupScoreWeightage: parseInt(customWeightageData.backup_weightage, 10),
      endpointScoreWeightage: parseInt(
        customWeightageData.endpoint_weightage,
        10
      ),
      patchingScoreWeightage: parseInt(
        customWeightageData.patching_weightage,
        10
      ),
      real_timeScoreWeightage: parseInt(
        customWeightageData.realtime_weightage,
        10
      ),
    };

    const oldAssetsScore = await assetsCustomWeightageScoreModel.findAll({
      where: {
        weightage_id: customWeightageData.id,
      },
      order: [["updatedAt", "DESC"]],
      limit: 2,
    });
    const lastUpdatedAtDate = oldAssetsScore?.[0]?.updatedAt;
    for await (const asset of assetsLinked.Assets) {
      await updateAndCreateCustomWeightageAssetScore(
        asset,
        assetRiskScoresWeightages,
        customWeightageData.id,
        client
      );
    }
    if (lastUpdatedAtDate) {
      await assetsCustomWeightageScoreModel
        .destroy({
          where: {
            weightage_id: customWeightageData.id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
        })
        .then((resp) => {
          if (resp > 0) {
            console.log("score deleted", resp);
          }
          return resp;
        });
    }
  } catch (err) {
    errorHandler(err);
  }
};
