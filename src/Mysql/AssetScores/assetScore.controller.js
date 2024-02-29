import { assetType } from "../../utils/constants";
import {
  assetRiskScoresWeightages,
  scoreNotAvailable,
} from "../../utils/Constants/scoreWeightages";
import AssetBackupInformationModel from "../AssetBackupInformation/assetBackupInformation.model";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import AssetLifecycleInformationModel from "../AssetLifecycleInformation/assetLifecycleInformation.model";
// import assetInfoSQLModel from "../AssetInformations/assetInfo.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import assetSQLModel from "../Assets/assets.model";
import { updateAndCreateAssetScore } from "./assetScore.service";

export const calculateLifecycleScore = (item) => {
  let lifecycle_score = 0;
  if (item.asset_type === assetType.network) {
    //     //* **********************lifecycle score calculation***********************
    const installVersion = item?.software_install_version;
    const currentVersion = item?.software_current_version;

    if (["Mikrotik", "Ubiquiti"].includes(item?.vendor_name)) {
      lifecycle_score = 720;
    } else if (currentVersion) {
      if (installVersion === currentVersion) {
        lifecycle_score = 850;
      } else {
        lifecycle_score = 350;
      }
    } else {
      lifecycle_score = scoreNotAvailable;
    }
  } else if (item.asset_type === assetType.nonNetwork) {
    //* *********************lifecycle score calculation*********************
    const installVersion =
      item?.asset_endpoint_informations?.[0]?.os_install_version ||
      item?.asset_patching_informations?.[0]?.os_version;
    const currentVersion =
      item?.asset_endpoint_informations?.[0]?.os_current_version || "0";
    if (installVersion) {
      if (installVersion === currentVersion) {
        lifecycle_score = 850;
      } else if (installVersion.slice(0, 2) === currentVersion.slice(0, 2)) {
        lifecycle_score = 750;
      } else {
        lifecycle_score = 710;
      }
    } else {
      lifecycle_score = scoreNotAvailable;
    }
  }
  return lifecycle_score;
};

export const calculateAssetScore = (item, scoreWeightages) => {
  let risk_score = 0;
  let pureRiskScore = 0;
  let isPureScore = true;
  if (item.asset_type === assetType.network) {
    const totalWeightage =
      scoreWeightages.lifecycleScoreWeightage +
      scoreWeightages.patchingScoreWeightage;

    let totalPureScore = 0;
    let totalRiskScore = 0;
    let totalRiskScoreWeightage = 0;
    /* **********************lifecycle score calculation*********************** */
    if (
      item.lifecycle_score !== scoreNotAvailable &&
      item.lifecycle_score >= 0
    ) {
      const scoreIntoWeightage =
        item.lifecycle_score * scoreWeightages.lifecycleScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.lifecycleScoreWeightage;
    } else {
      totalPureScore += 350 * scoreWeightages.lifecycleScoreWeightage;
      isPureScore = false;
    }
    /* ********************** patching score calculation*********************** */
    if (item.patching_score !== scoreNotAvailable && item.patching_score >= 0) {
      const scoreIntoWeightage =
        item.patching_score * scoreWeightages.patchingScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.patchingScoreWeightage;
    } else {
      isPureScore = false;
    }
    //* **********************final score calculation***********************
    pureRiskScore = Math.round(totalPureScore / totalWeightage);
    risk_score = Math.round(totalRiskScore / totalRiskScoreWeightage);
  } else if (item.asset_type === assetType.nonNetwork) {
    const totalWeightage =
      scoreWeightages.lifecycleScoreWeightage +
      scoreWeightages.backupScoreWeightage +
      scoreWeightages.endpointScoreWeightage +
      scoreWeightages.patchingScoreWeightage +
      scoreWeightages.real_timeScoreWeightage;
    let totalPureScore = 0;
    let totalRiskScore = 0;
    let totalRiskScoreWeightage = 0;

    /* **********************lifecycle score calculation*********************** */
    if (
      item.lifecycle_score !== scoreNotAvailable &&
      item.lifecycle_score >= 0
    ) {
      const scoreIntoWeightage =
        item.lifecycle_score * scoreWeightages.lifecycleScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.lifecycleScoreWeightage;
    } else {
      totalPureScore += 350 * scoreWeightages.lifecycleScoreWeightage;
      isPureScore = false;
    }

    /* **********************backup score calculation*********************** */
    if (item.backup_score !== scoreNotAvailable && item.backup_score >= 0) {
      const scoreIntoWeightage =
        item.backup_score * scoreWeightages.backupScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.backupScoreWeightage;
    } else {
      isPureScore = false;
    }

    /* ********************** Endpoint score calculation*********************** */
    if (item.endpoint_score !== scoreNotAvailable && item.endpoint_score >= 0) {
      const scoreIntoWeightage =
        item.endpoint_score * scoreWeightages.endpointScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.endpointScoreWeightage;
    } else {
      totalPureScore += 350 * scoreWeightages.endpointScoreWeightage;
      isPureScore = false;
    }

    /* ********************** patching score calculation*********************** */
    if (item.patching_score !== scoreNotAvailable && item.patching_score >= 0) {
      const scoreIntoWeightage =
        item.patching_score * scoreWeightages.patchingScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.patchingScoreWeightage;
    } else {
      isPureScore = false;
    }

    /* ********************** Real_time score calculation*********************** */
    if (
      item.real_time_score !== scoreNotAvailable &&
      item.real_time_score >= 0
    ) {
      const scoreIntoWeightage =
        item.real_time_score * scoreWeightages.real_timeScoreWeightage;
      totalPureScore += scoreIntoWeightage;
      totalRiskScore += scoreIntoWeightage;
      totalRiskScoreWeightage += scoreWeightages.real_timeScoreWeightage;
    } else {
      isPureScore = false;
    }

    //* **********************final score calculation***********************
    pureRiskScore = Math.round(totalPureScore / totalWeightage);
    risk_score = Math.round(totalRiskScore / totalRiskScoreWeightage);
  } else if (item.asset_type === assetType.unknown) {
    pureRiskScore =
      (item.lifecycle_score * scoreWeightages.lifecycleScoreWeightage +
        item.backup_score * scoreWeightages.backupScoreWeightage +
        item.endpoint_score * scoreWeightages.endpointScoreWeightage +
        item.patching_score * scoreWeightages.patchingScoreWeightage +
        item.real_time_score * scoreWeightages.real_timeScoreWeightage) /
      100;
  }
  return { risk_score, pureRiskScore, isPureScore };
};
export const updateAssetRiskScore = async (AssetId) => {
  const asset = await assetSQLModel.findOne({
    where: { id: AssetId },
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
    asset_type: asset?.asset_type,
    lifecycle_score: asset?.asset_lifecycle_informations?.[0]
      ? asset?.asset_lifecycle_informations?.[0]?.risk_score
      : calculateLifecycleScore(asset),
    backup_score: asset?.asset_backup_informations?.[0]
      ? asset?.asset_backup_informations?.[0]?.risk_score
      : scoreNotAvailable,
    endpoint_score: asset?.asset_endpoint_informations?.[0]
      ? asset?.asset_endpoint_informations?.[0]?.risk_score
      : scoreNotAvailable,
    patching_score: asset?.asset_patching_informations?.[0]
      ? asset?.asset_patching_informations?.[0]?.risk_score
      : scoreNotAvailable,
    real_time_score: asset?.asset_realtime_informations?.[0]
      ? asset?.asset_realtime_informations?.[0]?.risk_score
      : 850,
  };
  const { risk_score, pureRiskScore, isPureScore } = calculateAssetScore(
    assetScoreData,
    assetRiskScoresWeightages
  );
  console.log({ risk_score, pureRiskScore, isPureScore });

  await updateAndCreateAssetScore(
    {
      asset_id: asset?.id,
      company_id: asset?.company_id,
      pure_risk_score: pureRiskScore,
      is_pure_score: isPureScore,
      default_risk_score: risk_score,
      ...assetScoreData,
      lifecycle_score:
        assetScoreData.lifecycle_score !== scoreNotAvailable
          ? assetScoreData.lifecycle_score
          : 350,
      backup_score:
        assetScoreData.backup_score !== scoreNotAvailable
          ? assetScoreData.backup_score
          : 0,
      endpoint_score:
        assetScoreData.endpoint_score !== scoreNotAvailable
          ? assetScoreData.endpoint_score
          : 350,
      patching_score:
        assetScoreData.patching_score !== scoreNotAvailable
          ? assetScoreData.patching_score
          : 0,
      real_time_score:
        assetScoreData.real_time_score !== scoreNotAvailable
          ? assetScoreData.real_time_score
          : 0,
    },
    asset?.asset_name
  );
};
