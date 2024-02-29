import { Op } from "sequelize";
import { triggerApplicationScoreUpdate } from "../../../EventEmitter";
import { errorHandler } from "../../../utils/errorHandler";
import ApplicationSQLModel from "../../Applications/application.model";
// eslint-disable-next-line import/no-cycle
import {
  calculateFinalApplicationScore,
  getAllApplications,
} from "../../Applications/application.service";
import { createApplicationCustomScoreActivity } from "../../Logs/ActivitiesType/ApplicationActivites";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import ApplicationScoreWeightageModel from "../ApplicationScoreWeightage/ApplicationScoreWeightage.model";
import ApplicationCustomWeightageScoreModel from "./ApplicationCustomWeightageScore.model";

const addCustomScoreInApplicationTable = async (ApplicationId) => {
  const applicationCustomWeightageScores =
    await ApplicationCustomWeightageScoreModel.findAll({
      where: {
        application_id: ApplicationId,
      },
      include: [
        {
          model: ApplicationScoreWeightageModel,
          required: true,
        },
      ],
      order: [[ApplicationScoreWeightageModel, "priority", "ASC"]],
    });
  const addRiskScore = async () => {
    const OldApplicationData = await ApplicationSQLModel.findOne({
      where: {
        id: ApplicationId,
      },
    });
    await ApplicationSQLModel.update(
      {
        custom_methodology_risk_score:
          applicationCustomWeightageScores[0].risk_score,
      },
      {
        where: {
          id: ApplicationId,
        },
        individualHooks: true,
      }
    );
    const applicationData = await ApplicationSQLModel.findOne({
      where: {
        id: ApplicationId,
      },
    });
    if (applicationData.risk_score !== OldApplicationData.risk_score) {
      triggerApplicationScoreUpdate(applicationData.id);
    }
  };
  return applicationCustomWeightageScores.length > 0 ? addRiskScore() : false;
};
const updateAndCreateCustomWeightageApplicationsScore = async (
  application,
  secretsRiskScoresWeightages,
  weightage_id,
  client
) => {
  const risk_score = calculateFinalApplicationScore(
    application?.linked_asset_score || 0,
    application?.linked_human_score || 0,
    secretsRiskScoresWeightages
  );

  const ScoreInDb = await ApplicationCustomWeightageScoreModel.findOne({
    where: {
      application_id: application.id,
      weightage_id,
    },
  });
  const Score = {
    company_id: application.company_id,
    weightage_id,
    application_id: application.id,
    risk_score,
  };
  if (ScoreInDb?.id) {
    await ApplicationCustomWeightageScoreModel.update(Score, {
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
          process: `Update "${application.name}" application custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: ScoreInDb.id,
          effected_table: ApplicationCustomWeightageScoreModel.tableName,
          company_id: application.company_id,
          isSystemLog: false,
        },
        createApplicationCustomScoreActivity.status.successfully.code,
        createEventPayload(
          { id: ScoreInDb.id, ...Score },
          JSON.parse(JSON.stringify(ScoreInDb)),
          ApplicationCustomWeightageScoreModel.tableName
        )
      );
    }
  } else {
    const newScore = await ApplicationCustomWeightageScoreModel.create(Score);
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Calculate "${application.name}" application custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: newScore.id,
          effected_table: ApplicationCustomWeightageScoreModel.tableName,
          company_id: application.company_id,
          isSystemLog: false,
        },
        createApplicationCustomScoreActivity.status.successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newScore)),
          {},
          ApplicationCustomWeightageScoreModel.tableName
        )
      );
    }
  }
  await addCustomScoreInApplicationTable(application.id);
};
export const createApplicationCustomWeightageSecretsScore = async (
  customWeightageId,
  client
) => {
  try {
    const customWeightageData = await ApplicationScoreWeightageModel.findOne({
      where: {
        id: customWeightageId,
      },
    });
    const applications = await getAllApplications(
      customWeightageData.company_id,
      1,
      "all",
      customWeightageData.apply_on_all_application
        ? {}
        : {
            applicationIds:
              customWeightageData?.application_ids?.map((el) => el.id) || [],
          }
    );
    const Weightages = {
      human: customWeightageData.linked_humans_weightage,
      asset: customWeightageData.linked_assets_weightage,
    };

    const oldAssetsScore = await ApplicationCustomWeightageScoreModel.findAll({
      where: {
        weightage_id: customWeightageData.id,
      },
      order: [["updatedAt", "DESC"]],
      limit: 2,
    });
    const lastUpdatedAtDate = oldAssetsScore?.[0]?.updatedAt;
    for await (const application of applications.tableData) {
      await updateAndCreateCustomWeightageApplicationsScore(
        application,
        Weightages,
        customWeightageData.id,
        client
      );
    }
    if (lastUpdatedAtDate) {
      const deleteScore = await ApplicationCustomWeightageScoreModel.destroy({
        where: {
          weightage_id: customWeightageData.id,
          updatedAt: { [Op.lte]: lastUpdatedAtDate },
        },
      });
    }
  } catch (err) {
    errorHandler(err);
  }
};
