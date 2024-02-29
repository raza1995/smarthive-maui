import { assetsLinkedApplicationsScoresUpdateTrigger, assetsLinkedHumansScoresUpdateTrigger } from "../Mysql/Applications/application.service";
import assetSQLModel from "../Mysql/Assets/assets.model";
import { calculateAndUpdateCompanyScore } from "../Mysql/Companies/company.controller";
import humanSQLModel from "../Mysql/Human/human.model";
import {
  assetsLinkedHumanScoresUpdateTrigger,
} from "../Mysql/HumanRiskScores/humanRiskScore.service";
import {
  assetsLinkedSecretsScoresUpdateTrigger,
  humanLinkedSecretsScoresUpdateTrigger,
} from "../Mysql/secrets/secret.service";

export const eventTypes = {
  assetScoreUpdated: "assetScoreUpdated",
  humanScoreUpdated: "humanScoreUpdated",
  applicationUpdated: "applicationUpdated",
};

export const triggerAssetScoreUpdate = async (asset_id) => {
  assetsLinkedSecretsScoresUpdateTrigger([asset_id]);
  assetsLinkedHumanScoresUpdateTrigger([asset_id]);
  const asset = await assetSQLModel.findOne({
    where: {
      id: asset_id,
    },
  });
  await calculateAndUpdateCompanyScore(asset.company_id);
  assetsLinkedApplicationsScoresUpdateTrigger([asset_id]);
};

export const triggerApplicationScoreUpdate = async (application_id) => {
//  await applicationLinkedHumanScoresUpdateTrigger([application_id]);
};

export const triggerHumanScoreUpdate = async (human_id) => {
  const human = await humanSQLModel.findOne({
    where: {
      id: human_id,
    },
  });
  await humanLinkedSecretsScoresUpdateTrigger([human.user_id]);
  await assetsLinkedHumansScoresUpdateTrigger([human_id]);
};
