import { Op, Sequelize } from "sequelize";
import { applicationRiskWeightages } from "../../utils/constants";
import ApplicationAssetsSQLModel from "../ApplicationAssets/applicationAssets.model";
import ApplicationHumansSQLModel from "../ApplicationHumans/applicationHumans.model";
import ApplicationCustomWeightageScoreModel from "../ApplicationScoreManagements/ApplicationCustomWeightageScore/ApplicationCustomWeightageScore.model";
import ApplicationScoreWeightageModel from "../ApplicationScoreManagements/ApplicationScoreWeightage/ApplicationScoreWeightage.model";
// eslint-disable-next-line import/no-cycle
import { ApplicationsScoreWeightagesScoresUpdateTrigger } from "../ApplicationScoreManagements/Triggers/TriggerFunctions";
import ApplicationServicesSQLModel from "../ApplicationServices/applicationServices.model";
import assetSQLModel from "../Assets/assets.model";
import { getSourceValidation } from "../Assets/assets.service";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import humanSQLModel from "../Human/human.model";

import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import humanSourcesModel from "../HumanSource/humanSources.model";
import IntegrationModel from "../Integration/integration.model";
import {
  applicationCreateActivity,
  applicationDeleteActivity,
  applicationUpdateActivity,
} from "../Logs/ActivitiesType/ApplicationActivites";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import ApplicationSQLModel from "./application.model";
import { scoreNotAvailable } from "../../utils/Constants/scoreWeightages";
import { triggerApplicationScoreUpdate } from "../../EventEmitter";

export const sortApplicationScore = (custom_weightage_scores, defaultScore) => {
  const scores = custom_weightage_scores.sort(
    (a, b) =>
      a.applications_score_weightage.priority -
      b.applications_score_weightage.priority
  );
  scores.push({
    risk_score: defaultScore,
    applications_score_weightage: {
      name: "Default",
      priority:
        (scores?.[scores.length - 1]?.applications_score_weightage?.priority ||
          0) + 1,
    },
  });
  return scores;
};
export const findOldApplication = async (company_id, body) => {
  const filterObj = {};
  filterObj.company_id = company_id;
  filterObj.name = body.name;
  if (body.id) {
    filterObj.id = { [Op.ne]: body.id };
  }
  const count = await ApplicationSQLModel.count({
    where: filterObj,
  });
  return count;
};

export const createApplication = async (payload, clientDetails) => {
  try {
    const applicationData = await ApplicationSQLModel.create(payload, {
      hooks: true,
    });
    clientDetails.target_id = applicationData.id;
    clientDetails.effected_table = ApplicationSQLModel.tableName;
    await addEventLog(
      { ...clientDetails, user_id: null },
      applicationCreateActivity.status.applicationCreatedSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(applicationData)),
        applicationData.tableName
      )
    );
    return applicationData;
  } catch (error) {
    await addEventLog(
      { ...clientDetails, user_id: null },
      applicationCreateActivity.status.applicationCreationFailed.code,
      null
    );
    return error.message;
  }
};

export const updateApplication = async (payload, body, clientDetails) => {
  try {
    const OldApplicationData = await ApplicationSQLModel.findOne({
      where: {
        id: body.id,
      },
    });
    await ApplicationSQLModel.update(payload, {
      where: { id: body.id },
    });
    const applicationData = await ApplicationSQLModel.findOne({
      where: {
        id: body.id,
      },
    });
    clientDetails.target_id = body.id;
    clientDetails.effected_table = ApplicationSQLModel.tableName;
    if (applicationData.risk_score !== OldApplicationData.risk_score) {
      triggerApplicationScoreUpdate(applicationData.id);
    }
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails },
      applicationUpdateActivity.status.applicationUpdatedSuccessfully.code,
      createEventPayload(
        payload,
        JSON.parse(JSON.stringify(applicationData)),
        ApplicationSQLModel.tableName
      )
    );
  } catch (error) {
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      applicationUpdateActivity.status.applicationUpdationFailed.code,
      null,
      error.message
    );
    return error.message;
  }
};
export const findApplicationById = async (body) => {
  const applicationData = await ApplicationSQLModel.findOne({
    where: {
      id: body.id,
    },
    include: [
      {
        model: ApplicationCustomWeightageScoreModel,
        attributes: ["risk_score"],
        include: [
          {
            model: ApplicationScoreWeightageModel,
            attributes: ["name", "priority"],
          },
        ],
      },
      {
        model: ApplicationAssetsSQLModel,
        include: [
          {
            model: assetSQLModel,
          },
        ],
      },
      {
        model: ApplicationHumansSQLModel,
        include: [
          {
            model: humanSQLModel,
            required: true,
            include: [
              {
                model: humanSourcesModel,
                where: {
                  integration_id: { [Op.ne]: null },
                },
                required: true,
                include: [
                  {
                    model: IntegrationModel,
                    required: true,
                    attributes: [],
                  },
                ],
                attributes: [],
              },
            ],
          },
        ],
      },
    ],
  });
  return applicationData;
};

export const getAllApplications = async (company_id, page, size, filter) => {
  let whereInCondition = {
    [Op.notIn]: [""],
  };
  let paginationQuery = {};
  if (size !== "all") {
    paginationQuery = {
      offset: (page - 1) * size,
      limit: +size,
    };
  }
  if (filter?.applicationIds?.length > 0) {
    whereInCondition = {
      [Op.in]: filter.applicationIds,
    };
  }
  const applicationData = await ApplicationSQLModel.findAll({
    where: {
      company_id,
      id: whereInCondition,
    },
    include: [
      {
        model: ApplicationAssetsSQLModel,
        attributes: ["id"],
        include: [
          {
            model: assetSQLModel,
            attributes: [],
            // include:[
            //   {
            //     ...SourceValidation,
            //   },
            // ]
          },
        ],
      },
      {
        model: ApplicationCustomWeightageScoreModel,
        attributes: ["risk_score"],
        include: [
          {
            model: ApplicationScoreWeightageModel,
            attributes: ["name", "priority"],
          },
        ],
      },
      {
        model: ApplicationHumansSQLModel,
        attributes: ["id"],
        // include:[
        //   {
        //     model: humanSQLModel,
        //     attributes:[],
        //     include:[
        //       { ...humanSourceValidation },
        //     ]
        //   }
        // ]
      },
    ],
    ...paginationQuery,
  });

  const totalCount = await ApplicationSQLModel.findAndCountAll({
    where: {
      company_id,
      id: whereInCondition,
    },
    include: [
      {
        model: ApplicationAssetsSQLModel,
        attributes: ["id"],
        include: [
          {
            model: assetSQLModel,
            attributes: [],
            // include:[
            //   {
            //     ...SourceValidation,
            //   },
            // ]
          },
        ],
      },
      {
        model: ApplicationHumansSQLModel,
        attributes: ["id"],
        // include:[
        //   {
        //     model: humanSQLModel,
        //     attributes:[],
        //     include:[
        //       { ...humanSourceValidation },
        //     ]
        //   }
        // ]
      },
    ],
  }).then((resp) => resp.rows.length);
  let applicationCountWithCustomScore = 0;
  if (filter?.customScoreFilter) {
    const applicationCountWithCustomScoreQuery = {};
    if (filter?.customScoreFilter?.notIncludedWeightageIds) {
      applicationCountWithCustomScoreQuery.weightage_id = {
        [Op.notIn]: filter?.customScoreFilter?.notIncludedWeightageIds || [],
      };
    }
    applicationCountWithCustomScore = await ApplicationSQLModel.findAndCountAll(
      {
        where: {
          company_id,
          id: whereInCondition,
        },
        include: [
          {
            model: ApplicationAssetsSQLModel,
            attributes: ["id"],
            include: [
              {
                model: assetSQLModel,
                attributes: [],
                // include:[
                //   {
                //     ...SourceValidation,
                //   },
                // ]
              },
            ],
          },
          {
            model: ApplicationHumansSQLModel,
            attributes: ["id"],
            // include:[
            //   {
            //     model: humanSQLModel,
            //     attributes:[],
            //     include:[
            //       { ...humanSourceValidation },
            //     ]
            //   }
            // ]
          },
          {
            model: ApplicationCustomWeightageScoreModel,
            where: applicationCountWithCustomScoreQuery,
            required: true,
          },
        ],
      }
    ).then((resp) => resp.rows.length);
  }
  const finalArray = await Promise.all(
    applicationData.map(async (app) => {
      const { application_custom_weightage_scores } = app;
      app.scores = sortApplicationScore(
        application_custom_weightage_scores,
        app.default_risk_score
      );

      return {
        application_assets: app.application_assets,
        application_humans: app.application_humans,
        company_id: app.company_id,
        createdAt: app.createdAt,
        description: app.description,
        id: app.id,
        is_shared_service: app.is_shared_service,
        is_using_other_services: app.is_using_other_services,
        name: app.name,
        scores: app.scores,
        risk_score: app.risk_score,
        linked_human_score: app.linked_human_score,
        linked_asset_score: app.linked_asset_score,
        updatedAt: app.updatedAt,
        shared_services: await ApplicationServicesSQLModel.findAll({
          where: {
            application_id: app.id,
          },
          include: [{ model: ApplicationSQLModel }],
        }),
      };
    })
  );

  let totalPage;
  if (size) {
    totalPage =
      totalCount % size > 0
        ? Math.floor(totalCount / size) + 1
        : Math.floor(totalCount / size);
  }

  return {
    tableData: finalArray,
    totalCount,
    applicationCountWithCustomScore,
    totalPage,
  };
};

export const deleteApplicationByID = async (
  applicationData,
  clientDetails,
  res
) => {
  await ApplicationSQLModel.destroy({
    where: { id: applicationData?.dataValues?.id },
  })
    .then(async () => {
      // Event Logs Handler
      clientDetails.target_id = applicationData.dataValues.id;
      clientDetails.effected_table = ApplicationSQLModel.tableName;
      await addEventLog(
        { ...clientDetails, user_id: null },
        applicationDeleteActivity.status.applicationDeletedSuccessfully.code,
        createEventPayload(
          {},
          JSON.parse(JSON.stringify(applicationData)),
          ApplicationSQLModel.tableName
        )
      );
      return res
        .status(200)
        .json({ message: "Application deleted successfully" });
    })
    .catch(async (err) => {
      await addEventLog(
        { ...clientDetails, user_id: null },
        applicationDeleteActivity.status.applicationDeletionFailed.code,
        null,
        err.message
      );
      return res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
};
export const calculateFinalApplicationScore = (
  assetScore = 0,
  humanScore = 0,
  scoresWeightages
) => {
  // const finalSecretsRiskScore = Math.round(
  //   (assetScore * scoresWeightages.asset) / 100 +
  //     (humanScore * scoresWeightages.human) /
  //       (scoresWeightages.asset + scoresWeightages.human)
  // );

  let totalScore = 0;
  let totalScoreWeightage = 0;

  if (assetScore !== scoreNotAvailable && assetScore >= 0) {
    const scoreIntoWeightage = assetScore * scoresWeightages.asset;
    totalScore += scoreIntoWeightage;
    totalScoreWeightage += scoresWeightages.asset;
  }

  if (humanScore !== scoreNotAvailable && humanScore >= 0) {
    const scoreIntoWeightage = humanScore * scoresWeightages.human;
    totalScore += scoreIntoWeightage;
    totalScoreWeightage += scoresWeightages.human;
  }

  const finalSecretsRiskScore = Math.round(totalScore / totalScoreWeightage);

  console.log({
    humanScore,
    assetScore,
    finalSecretsRiskScore,
  });
  return finalSecretsRiskScore < 851 ? finalSecretsRiskScore : 850;
};

export const updateApplicationScore = async (application) => {
  try {
    const assetIds = await ApplicationAssetsSQLModel.findAll({
      where: { application_id: application.id },
      attributes: ["asset_id"],
    }).then((asset) => asset?.map((assetId) => assetId?.asset_id));
    const assetScores = await AssetScoreSQLModel.findAll({
      where: {
        asset_id: { [Op.in]: assetIds },
      },
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.cast(Sequelize.col("risk_score"), "integer")
          ),
          "totalScore",
        ],
        [
          Sequelize.fn(
            "AVG",
            Sequelize.cast(Sequelize.col("risk_score"), "integer")
          ),
          "avgScore",
        ],
      ],
      raw: true,
      nest: true,
    }).then((resp) => resp[0]?.avgScore);

    const humanIds = await ApplicationHumansSQLModel.findAll({
      where: {
        application_id: application.id,
      },
      attributes: ["human_id"],
    }).then((resp) => resp?.map((hum) => hum.human_id));
    const humanScores = await humanRiskScoreModel
      .findAll({
        where: {
          human_id: { [Op.in]: humanIds },
        },
        attributes: [
          [
            Sequelize.fn(
              "SUM",
              Sequelize.cast(Sequelize.col("risk_score"), "integer")
            ),
            "totalScore",
          ],
          [
            Sequelize.fn(
              "AVG",
              Sequelize.cast(Sequelize.col("risk_score"), "integer")
            ),
            "avgScore",
          ],
        ],
        raw: true,
        nest: true,
      })
      .then((resp) => resp[0]?.avgScore);
    const finalScores = calculateFinalApplicationScore(
      assetScores || scoreNotAvailable,
      humanScores || scoreNotAvailable,
      applicationRiskWeightages
    );
    console.log(
      "finalScores",
      finalScores,
      "humanScores",
      humanScores,
      "assetScores",
      assetScores
    );
    if (finalScores) {
      const OldApplicationData = await ApplicationSQLModel.findOne({
        where: {
          id: application.id,
        },
      });
      await ApplicationSQLModel.update(
        {
          default_risk_score: finalScores,
          linked_asset_score: assetScores,
          linked_human_score: humanScores,
        },
        {
          where: {
            id: application.id,
          },
        }
      );
      const applicationData = await ApplicationSQLModel.findOne({
        where: {
          id: application.id,
        },
      });
      if (applicationData.risk_score !== OldApplicationData.risk_score) {
        triggerApplicationScoreUpdate(application.id);
      }

      await ApplicationsScoreWeightagesScoresUpdateTrigger(
        application.company_id
      );
    }
  } catch (err) {
    return err.message;
  }
};

export const assetsLinkedApplicationsScoresUpdateTrigger = async (
  asset_ids
) => {
  const applicationData = await ApplicationSQLModel.findAll({
    include: [
      {
        model: ApplicationAssetsSQLModel,
        where: {
          asset_id: { [Op.in]: asset_ids },
        },
      },
    ],
  });
  console.log(
    "total asset applications to update ----------- ",
    applicationData.length
  );
  for await (const application of applicationData) {
    await updateApplicationScore(application);
  }
};

export const assetsLinkedHumansScoresUpdateTrigger = async (human_ids) => {
  const applicationData = await ApplicationSQLModel.findAll({
    include: [
      {
        model: ApplicationHumansSQLModel,
        where: {
          human_id: { [Op.in]: human_ids },
        },
      },
    ],
  });
  console.log(
    "total human applications to update ----------- ",
    applicationData.length
  );
  for await (const application of applicationData) {
    await updateApplicationScore(application);
  }
};
