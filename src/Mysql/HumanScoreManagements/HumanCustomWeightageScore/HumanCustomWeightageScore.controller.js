import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import { getHumanList } from "../../Human/human.service";
import humanRiskScoreModel from "../../HumanRiskScores/humanRiskScore.model";
import { createHumanCustomScoreActivity } from "../../Logs/ActivitiesType/humanActivities";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import HumanScoreWeightageModel from "../HumanScoreWeightage/HumanScoreWeightage.model";
import HumanCustomWeightageScoreModel from "./HumanCustomWeightageScore.model";

const addCustomScoreInHumanScoresTable = async (human_id) => {
  const CustomWeightageScores = await HumanCustomWeightageScoreModel.findAll({
    where: {
      human_id,
    },
    include: [
      {
        model: HumanScoreWeightageModel,
        required: true,
      },
    ],
    order: [[HumanScoreWeightageModel, "priority", "ASC"]],
  });
  return CustomWeightageScores.length > 0
    ? humanRiskScoreModel.update(
        {
          custom_methodology_risk_score: CustomWeightageScores[0].risk_score,
        },
        {
          where: {
            human_id,
          },
          individualHooks: true,
        }
      )
    : false;
};
export const calculateFinalHumanScore = (
  asset_score = 0,
  mfa_score = 0,
  pishing_score = 0,
  security_awareness_score = 0,
  scoresWeightages
) => {
  const finalRiskScore = Math.round(
    (asset_score * scoresWeightages.asset +
      mfa_score * scoresWeightages.mfa +
      pishing_score * scoresWeightages.pishing +
      security_awareness_score * scoresWeightages.security_awareness) /
      (scoresWeightages.asset +
        scoresWeightages.pishing +
        scoresWeightages.mfa +
        scoresWeightages.security_awareness)
  );
  return finalRiskScore < 851 ? finalRiskScore : 850;
};
const updateAndCreateCustomWeightageHumansScore = async (
  Human,
  riskScoresWeightages,
  weightage_id,
  company_id,
  client
) => {
  const risk_score = calculateFinalHumanScore(
    Human.asset_score,
    Human.mfa_score,
    Human.pishing_score,
    Human.security_awareness_score,
    riskScoresWeightages
  );

  const ScoreInDb = await HumanCustomWeightageScoreModel.findOne({
    where: {
      Human_id: Human.id,
      weightage_id,
    },
  });
  const Score = {
    company_id,
    weightage_id,
    human_id: Human.id,
    risk_score,
  };
  if (ScoreInDb?.id) {
    await HumanCustomWeightageScoreModel.update(Score, {
      where: {
        id: ScoreInDb.id,
      },
    });
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Update "${Human.name}" human custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: ScoreInDb.id,
          effected_table: HumanCustomWeightageScoreModel.tableName,
          company_id: Human.company_id,
          isSystemLog: false,
        },
        createHumanCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          { id: ScoreInDb.id, ...Score },
          JSON.parse(JSON.stringify(ScoreInDb)),
          HumanCustomWeightageScoreModel.tableName
        )
      );
    }
  } else {
    const newScore = await HumanCustomWeightageScoreModel.create(Score);
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Calculate "${Human.name}" human custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: newScore.id,
          effected_table: HumanCustomWeightageScoreModel.tableName,
          company_id: Human.company_id,
          isSystemLog: false,
        },
        createHumanCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newScore)),
          {},
          HumanCustomWeightageScoreModel.tableName
        )
      );
    }
  }
  await addCustomScoreInHumanScoresTable(Human.id);
};

export const createHumanCustomWeightageSecretsScore = async (
  customWeightageId,
  client
) => {
  try {
    const customWeightageData = await HumanScoreWeightageModel.findOne({
      where: {
        id: customWeightageId,
      },
    });
    const filter = {
      company_id: customWeightageData.company_id,
    };
    if (
      customWeightageData.human_risks &&
      !customWeightageData.apply_on_all_human
    ) {
      filter.risk_level = { [Op.in]: [customWeightageData.human_risks] };
    }
    const Humans = await getHumanList(filter, 1, "all");
    const Weightages = {
      asset: parseInt(customWeightageData.linked_assets_weightage, 10),
      pishing: parseInt(customWeightageData.pishing_weightage, 10),
      mfa: parseInt(customWeightageData.mfa_weightage, 10),
      security_awareness: parseInt(
        customWeightageData.security_awareness_weightage,
        10
      ),
    };

    const oldAssetsScore = await HumanCustomWeightageScoreModel.findAll({
      where: {
        weightage_id: customWeightageData.id,
      },
      order: [["updatedAt", "DESC"]],
      limit: 2,
    });
    const lastUpdatedAtDate = oldAssetsScore?.[0]?.updatedAt;
    for await (const Human of Humans) {
      await updateAndCreateCustomWeightageHumansScore(
        Human,
        Weightages,
        customWeightageData.id,
        customWeightageData.company_id,
        client
      );
    }
    if (lastUpdatedAtDate) {
      const deleteScore = await HumanCustomWeightageScoreModel.destroy({
        where: {
          weightage_id: customWeightageData.id,
          updatedAt: { [Op.lte]: lastUpdatedAtDate },
        },
      });
      if (deleteScore) console.log("score deleted", deleteScore);
    }
  } catch (err) {
    errorHandler(err);
  }
};
