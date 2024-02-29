import { CliProgressBar } from "../../utils/cliProgressBar";
import { scoreTitles } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import { assetsPatchingScoreUpdateActivity } from "../Logs/ActivitiesType/AssetPatchingInformationActivityType";
import { assetsBackupScoreUpdateActivity } from "../Logs/ActivitiesType/BackupActivity";
import { assetsEndpointScoreUpdateActivity } from "../Logs/ActivitiesType/EndpointActivityType";
import { assetsLifecycleScoreUpdateActivity } from "../Logs/ActivitiesType/LifecycleActivity";
import { assetsRealtimeScoreUpdateActivity } from "../Logs/ActivitiesType/RealtimeActivity";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import assetRiskScoreImpactModel from "./assetRiskScoreImpact.model";

const logsActivitiesSource = {
  patching_score: assetsPatchingScoreUpdateActivity,
  lifecycle_score: assetsLifecycleScoreUpdateActivity,
  endpoint_score: assetsEndpointScoreUpdateActivity,
  backup_score: assetsBackupScoreUpdateActivity,
  real_time_score: assetsRealtimeScoreUpdateActivity,
};
export const updateOrCreateAssetRiskScoreImpact = async (item) => {
  try {
    const assetRiskScoreImpact = await assetRiskScoreImpactModel.findOne({
      where: {
        asset_id: item.asset_id,
        company_id: item.company_id,
        impact_by_source: item.impact_by_source,
      },
    });

    if (assetRiskScoreImpact) {
      await assetRiskScoreImpactModel.update(
        { ...item, updatedAt: new Date() },
        {
          where: {
            id: assetRiskScoreImpact.id,
          },
        }
      );
      const updateAsset = await assetRiskScoreImpactModel.findOne({
        where: { id: assetRiskScoreImpact.id },
      });
      const oldData = JSON.parse(JSON.stringify(assetRiskScoreImpact));
      const updateData = JSON.parse(JSON.stringify(updateAsset));
      delete oldData.total_risk_score;
      delete updateData.total_risk_score;
      await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: `${scoreTitles[item.impact_by_source]} changed`,
          user_id: null,
          company_id: updateAsset.company_id,
          asset_id: updateAsset.asset_id,
          isSystemLog: true,
        },
        logsActivitiesSource[item.impact_by_source].status
          .assetScoreUpdatedSuccessfully.code,
        createEventPayload(
          updateData,
          oldData,
          assetRiskScoreImpactModel.tableName
        )
      );
    } else {
      const newAssetRiskScore = await assetRiskScoreImpactModel.create(item);
      await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: `${scoreTitles[item.impact_by_source]} calculated`,
          user_id: null,
          company_id: newAssetRiskScore.company_id,
          asset_id: newAssetRiskScore.asset_id,
          isSystemLog: true,
        },
        logsActivitiesSource[item.impact_by_source].status
          .assetScoreUpdatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newAssetRiskScore)),
          {},
          assetRiskScoreImpactModel.tableName
        )
      );
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
