import { Op } from "sequelize";
import { humanRiskWeightages, humansRiskTypes } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import ApplicationHumansSQLModel from "../ApplicationHumans/applicationHumans.model";
import assetSQLModel from "../Assets/assets.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import humanSQLModel from "../Human/human.model";
import humanAssetsSQLModel from "../HumanAssets/humanAssets.model";
import humanRiskScoreHistoryModel from "../HumanRiskScoreHistory/humanRiskScoreHistory.model";
import { createHumanRiskScoreHistory } from "../HumanRiskScoreHistory/humanRiskScoreHistory.service";
// eslint-disable-next-line import/named
import { HumansScoreWeightagesScoresUpdateTrigger } from "../HumanScoreManagements/Triggers/TriggerFunctions";
import { updateUserSecretsScore } from "../UserSecrets/UserSecrets.service";
import humanRiskScoreModel from "./humanRiskScore.model";

const calculateScoreOnHistory = async (score, incPer, humanRiskScore) => {
  const diff = score - humanRiskScore;
  if (diff > 0) {
    return score - (diff * incPer) / 100;
  }
  return humanRiskScore > 850 ? 850 : humanRiskScore;
};

const getSecurityAwarenessScore = async (company_id, human) => {
  const fyndSecurityAwarenessHistory = await humanRiskScoreHistoryModel.findOne(
    {
      where: {
        company_id,
        human_id: human.id,
        column_effected: "security_awareness",
      },
      order: [["updatedAt", "DESC"]],
    }
  );
  const response = {
    risk_score: 0.0,
    weightage_risk_score: 0.0,
  };
  let incPer = 100;
  if (human.risk_level === humansRiskTypes.high) {
    incPer = 200;
  } else if (human.risk_level === humansRiskTypes.medium) {
    incPer = 150;
  }
  const humanRiskScore = (human.current_risk_score * 850) / 100;
  if (fyndSecurityAwarenessHistory) {
    response.risk_score = await calculateScoreOnHistory(
      fyndSecurityAwarenessHistory.security_awareness,
      incPer,
      humanRiskScore
    );
  } else {
    response.risk_score = humanRiskScore;
  }

  response.weightage_risk_score =
    (response.risk_score * humanRiskWeightages.security_awareness) / 100;
  return response;
};

const getAssetScore = async (company_id, human) => {
  const fyndSecurityAwarenessHistory = await humanRiskScoreHistoryModel.findOne(
    {
      where: {
        company_id,
        human_id: human.id,
        column_effected: "asset",
      },
      order: [["updatedAt", "DESC"]],
    }
  );
  const response = {
    risk_score: 0.0,
    weightage_risk_score: 0.0,
  };
  let incPer = 100;
  if (human.risk_level === humansRiskTypes.high) {
    incPer = 200;
  } else if (human.risk_level === humansRiskTypes.medium) {
    incPer = 150;
  }
  let score = 0;
  const relatedAssets = await humanAssetsSQLModel.findAll({
    where: {
      company_id,
      human_id: human.id,
    },
  });
  let count = 0;
  for await (const item of relatedAssets) {
    const fyndAssetRiskScore = await AssetScoreSQLModel.findOne({
      where: {
        asset_id: item.asset_id,
        company_id,
      },
    }).then((resp) => resp.risk_score);
    if (fyndSecurityAwarenessHistory) {
      score += await calculateScoreOnHistory(
        fyndSecurityAwarenessHistory.asset,
        incPer,
        fyndSecurityAwarenessHistory.risk_score
      );
    } else {
      score += fyndAssetRiskScore;
    }
    count++;
    response.risk_score = score;
  }

  const wriskScore =
    response.risk_score > 0 ? response.risk_score / count : response.risk_score;

  response.weightage_risk_score =
    (wriskScore * humanRiskWeightages.asset) / 100;
  console.log({ response });
  return response;
};

export const getPishingScore = async (company_id, human) => {
  const response = {
    risk_score: 850,
    weightage_risk_score: (850 * humanRiskWeightages.pishing) / 100,
  };
  return response;
};

export const getMfaScore = async (company_id, human) => {
  const response = {
    risk_score: 850,
    weightage_risk_score: (850 * humanRiskWeightages.mfa) / 100,
  };
  return response;
};

export const updateRiskScore = async (company_id, human, client) => {
  try {
    const payload = {
      company_id,
      human_id: human.id,
      security_awareness: 0.0,
      asset: 0,
      pishing: 0,
      mfa: 0,
      default_risk_score: 0,
    };
    const security_awareness = await getSecurityAwarenessScore(
      company_id,
      human
    );
    const asset_score = await getAssetScore(company_id, human);
    const pishing_score = await getPishingScore(company_id, human);
    const mfa_score = await getMfaScore(company_id, human);
    payload.asset = asset_score.risk_score;
    payload.security_awareness = security_awareness.risk_score;
    payload.pishing = pishing_score.risk_score;
    payload.mfa = mfa_score.risk_score;
    payload.default_risk_score =
      security_awareness.weightage_risk_score +
      asset_score.weightage_risk_score +
      pishing_score.weightage_risk_score +
      mfa_score.weightage_risk_score;
    console.log(asset_score);
    const fyndHumanRiskScore = await humanRiskScoreModel.findOne({
      where: {
        company_id,
        human_id: human.id,
      },
    });
    if (fyndHumanRiskScore) {
      await humanRiskScoreModel.update(payload, {
        where: {
          id: fyndHumanRiskScore.id,
        },
        individualHooks: true,
      });
    } else {
      await humanRiskScoreModel
        .create(payload, {
          hooks: true,
        })
        .catch((err) => errorHandler(err));
    }
    console.log(payload);
    await createHumanRiskScoreHistory(company_id, human.id, payload);
    const humanUser = await humanSQLModel.findOne({
      where: { id: human.id },
      attributes: ["user_id"],
    });
    HumansScoreWeightagesScoresUpdateTrigger(company_id);
    updateUserSecretsScore(humanUser.user_id, client);
  } catch (err) {
    return err.message;
  }
};

export const updateCompanyRiskScore = async (company) => {
  try {
    const humans = await humanSQLModel.findAll({
      where: {
        company_id: company.id,
      },
      raw: true,
      nest: true,
    });
    humans.forEach(async (element) => {
      await updateRiskScore(company.id, element, {
        id: "",
        email: "",
        full_name: "",
        ipAddress: "",
        company_id: "",
      });
    });
  } catch (err) {
    return err.message;
  }
};
export const assetsLinkedHumanScoresUpdateTrigger = async (asset_ids) => {
  const humans = await humanSQLModel.findAll({
    include: [
      {
        model: humanAssetsSQLModel,
        where: {
          asset_id: { [Op.in]: asset_ids },
        },
      },
    ],
    raw: true,
    nest: true,
  });
  console.log({ humans });
  humans.forEach(async (element) => {
    await updateRiskScore(element.company_id, element, {
      id: "",
      email: "",
      full_name: "",
      ipAddress: "",
      company_id: "",
    });
  });
};

export const applicationLinkedHumanScoresUpdateTrigger = async (
  application_ids
) => {
  const humans = await humanSQLModel.findAll({
    include: [
      {
        model: ApplicationHumansSQLModel,
        where: {
          application_id: { [Op.in]: application_ids },
        },
      },
    ],
    raw: true,
    nest: true,
  });
  humans.forEach(async (element) => {
    await updateRiskScore(element.company_id, element, {
      id: "",
      email: "",
      full_name: "",
      ipAddress: "",
      company_id: "",
    });
  });
};
