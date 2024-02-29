import { Op } from "sequelize";
import moment from "moment";
import { humansRiskTypes, integrationsNames } from "../../utils/constants";
import humanAssetsSQLModel from "../HumanAssets/humanAssets.model";
import humanSourcesModel from "../HumanSource/humanSources.model";
import humanSQLModel from "./human.model";
import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import { getCompanyWithIntegtation } from "../Companies/company.service";
import ApplicationHumansSQLModel from "../ApplicationHumans/applicationHumans.model";
import IntegrationModel from "../Integration/integration.model";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import { getAllApplications } from "../Applications/application.service";
import userModel from "../Users/users.model";
import ApplicationSQLModel from "../Applications/application.model";
import ApplicationAssetsSQLModel from "../ApplicationAssets/applicationAssets.model";
import ApplicationServicesSQLModel from "../ApplicationServices/applicationServices.model";
import humanRiskScoreHistoryModel from "../HumanRiskScoreHistory/humanRiskScoreHistory.model";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import {
  humanCreateActivity,
  humanUpdateActivity,
} from "../Logs/ActivitiesType/humanActivities";
import HumanCustomWeightageScoreModel from "../HumanScoreManagements/HumanCustomWeightageScore/HumanCustomWeightageScore.model";
import HumanScoreWeightageModel from "../HumanScoreManagements/HumanScoreWeightage/HumanScoreWeightage.model";

export const sortHumanScores = (custom_weightage_scores, defaultScore) => {
  const scores = custom_weightage_scores.sort(
    (a, b) =>
      a.human_score_weightage.priority - b.human_score_weightage.priority
  );
  scores.push({
    risk_score: defaultScore,
    human_score_weightage: {
      name: "Default",
      priority:
        (scores?.[scores.length - 1]?.human_score_weightage?.priority || 0) + 1,
    },
  });
  return scores;
};
export const updateOrCreateSQLHumansOfIntegration = async (items) => {
  let i = 0;
  const startTime = new Date();
  for await (const item of items) {
    const getQuery = () => {
      const query = [];
      if (item?.email) {
        query.push({ email: item.email });
      }
      // if (item.phone_number) {
      //   query.push({ phone_number: item.phone_number })
      // }
      return query;
    };
    let human = await humanSQLModel.findOne({
      include: [{ model: humanSourcesModel, required: false }],
      raw: true,
      nest: true,
      where: {
        company_id: item.company_id,
        // human_id: item.human_id,
        [Op.or]: getQuery(),
      },
    });

    const fyndUser = await userModel.findOne({
      where: {
        email: item.email,
        company_id: item?.company_id,
      },
      attributes: ["id", "email"],
      raw: true,
      nest: true,
    });
    if (fyndUser) {
      item.user_id = fyndUser?.id;
    }

    i++;
    const percentage = (i * 100) / items.length;

    if (human) {
      const fyndSource = await humanSourcesModel.findOne({
        where: {
          human_source_id: human.human_id,
          sources_type: item.human_sources[0].sources_type,
          integration_id: item.human_sources[0].integration_id,
        },
      });
      if (!fyndSource) {
        await humanSourcesModel.create({
          human_id: human.id,
          risk_level: humansRiskTypes.medium,
          ...item.human_sources[0],
        });
      }

      if (
        human.email === item.email ||
        // human.phone_number === item.phone_number ||
        human.human_sources.human_source_id ===
          item.human_sources[0].human_source_id
      ) {
        await humanSQLModel.update(item, {
          where: { id: human.id },
          include: [humanSourcesModel],
        });

        const updateHuman = await humanSQLModel.findOne({
          where: { id: human.id },
          include: [
            {
              model: humanSourcesModel,
              where: { human_id: item.human_sources[0].human_source_id },
              required: false,
            },
          ],
          raw: true,
          nest: true,
        });
        const eventLogs = await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "human updates",
            user_id: null,
            user_company_id: item.company_id,
          },
          humanUpdateActivity.status.humanUpdatedSuccessfully.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updateHuman)),
            JSON.parse(JSON.stringify(human)),
            humanSQLModel.tableName
          )
        );
      }
    } else {
      human = await humanSQLModel.create(
        { risk_level: humansRiskTypes.medium, ...item },
        {
          include: [humanSourcesModel],
        }
      );
      console.log("new");
      const eventLogs = await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: "human create",
          user_id: null,
          user_company_id: item.company_id,
        },
        humanCreateActivity.status.humanCreatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(human)),
          {},
          humanSQLModel.tableName
        )
      );
      //   console.log("Asset create to db", percentage, "%done...");
    }
  }
};

export const getHumanSourceValidation = async () => {
  const SourceValidation = {
    model: humanSourcesModel,
    where: {
      integration_id: { [Op.ne]: null },
    },
    required: true,
    include: [
      {
        model: IntegrationModel,
        attributes: [],
        required: true,
      },
    ],
    attributes: [],
  };
  return SourceValidation;
};

export const getHumanById = async (id) => {
  const humanDetail = await humanSQLModel.findOne({
    where: { id },
    include: [
      {
        model: humanRiskScoreModel,
        attributes: ["default_risk_score", "risk_score"],
      },
      {
        model: HumanCustomWeightageScoreModel,
        attributes: ["risk_score"],
        include: [
          {
            model: HumanScoreWeightageModel,
            attributes: ["name", "priority"],
          },
        ],
      },
      {
        model: humanRiskScoreHistoryModel,
        where: {
          createdAt: {
            [Op.gte]: moment().subtract(7, "days").toDate(),
          },
        },
        required: false,
        attributes: ["risk_score", "createdAt"],
      },
      {
        model: humanSourcesModel,
        include: [
          {
            model: IntegrationModel,
            attributes: ["integration_values"],
          },
        ],
        attributes: [],
      },
    ],
    attributes: [
      "id",
      "user_id",
      "first_name",
      "last_name",
      "email",
      "risk_level",
      "phone_number",
      "department",
      "status",
      "company_id",
      "current_risk_score",
      "region",
    ],
  });

  const detail = {};

  detail.id = humanDetail.id;
  detail.user_id = humanDetail.user_id;
  detail.first_name = humanDetail.first_name;
  detail.last_name = humanDetail.last_name;
  detail.email = humanDetail.email;
  detail.risk_level = humanDetail.risk_level;
  detail.phone_number = humanDetail.phone_number;
  detail.department = humanDetail.department;
  detail.status = humanDetail.status;

  detail.default_risk_score =
    humanDetail?.human_risk_score?.default_risk_score || 0;
  detail.risk_score = humanDetail?.human_risk_score?.risk_score || 0;
  detail.scores = sortHumanScores(
    humanDetail.human_custom_weightage_scores,
    detail.default_risk_score
  );
  detail.risk_score_history = humanDetail?.human_risk_scores_histories;
  detail.current_risk_score = humanDetail?.current_risk_score || 0;
  const integration =
    humanDetail?.human_sources?.integration?.integration_values?.region;
  if (humanDetail.region) {
    detail.region_can_update = false;
    detail.region = humanDetail.region;
  } else if (integration) {
    detail.region = integration;
    detail.region_can_update = false;
  } else {
    detail.region = "";
    detail.region_can_update = true;
  }

  detail.applications_count = await ApplicationHumansSQLModel.count({
    where: { human_id: id },
  });
  detail.asset_count = await humanAssetsSQLModel.count({
    where: { human_id: id },
  });
  return detail;
};
export const getHumanList = async (
  filterObj,
  page,
  size,
  sort = "DESC",
  sortColumn = "createdAt"
) => {
  try {
    const SourceValidation = await getHumanSourceValidation(
      filterObj.company_id,
      []
    );
    let paginationQuery = {};
    if (size !== "all") {
      paginationQuery = {
        offset: (page - 1) * size,
        limit: +size,
      };
    }
    const data = await humanSQLModel.findAll({
      where: filterObj,
      include: [
        {
          model: HumanCustomWeightageScoreModel,
          attributes: ["risk_score"],
          include: [
            {
              model: HumanScoreWeightageModel,
              attributes: ["name", "priority"],
            },
          ],
        },
        {
          model: humanRiskScoreModel,
          attributes: [
            "risk_score",
            "pishing",
            "asset",
            "mfa",
            "security_awareness",
            "default_risk_score",
          ],
        },

        // { ...SourceValidation },
        {
          model: humanSourcesModel,
          where: {
            integration_id: { [Op.ne]: null },
          },
          include: [
            {
              model: IntegrationModel,
              attributes: ["integration_values"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "department",
        "status",
        "risk_level",
        "phone_number",
        "region",
        "createdAt",
      ],
      ...paginationQuery,
      order: [[sortColumn, sort]],
    });

    const humans = [];
    for await (const item of data) {
      const humanData = JSON.parse(JSON.stringify(item));
      const { human_custom_weightage_scores } = humanData;

      const integration =
        humanData?.human_sources?.integration?.integration_values?.region;
      const object = {};
      object.id = humanData.id;
      object.first_name = humanData.first_name;
      object.last_name = humanData.last_name;
      object.email = humanData.email;

      const risk_score = humanData?.human_risk_score?.risk_score;
      object.default_risk_score =
        humanData?.human_risk_score?.default_risk_score;
      object.scores = sortHumanScores(
        human_custom_weightage_scores,
        object.default_risk_score
      );
      if (humanData.region) {
        object.region_can_update = false;
        object.region = humanData.region;
      } else if (integration) {
        object.region = integration;
        object.region_can_update = false;
      } else {
        object.region = "";
        object.region_can_update = true;
      }

      object.risk_score = Math.round(risk_score);
      object.pishing_score = humanData?.human_risk_score?.pishing;
      object.asset_score = humanData?.human_risk_score?.asset;
      object.mfa_score = humanData?.human_risk_score?.mfa;
      object.security_awareness_score =
        humanData?.human_risk_score?.security_awareness;

      object.risk_level = humanData.risk_level;
      object.department = humanData.department;
      humans.push(object);
    }
    return humans;
  } catch (err) {
    return err.message;
  }
};

export const getHumanApplicationRelations = async (
  id,
  page,
  size,
  company_id
) => {
  try {
    const data = await ApplicationHumansSQLModel.findAll({
      where: {
        human_id: id,
        company_id,
      },
      attributes: ["application_id"],
    }).then((res) => res.map((item) => item.application_id));
    // const applications = await getAllApplications(company_id, page, size, data)
    const applications = await ApplicationSQLModel.findAll({
      where: {
        company_id,
        id: { [Op.in]: data },
      },
      include: [
        {
          model: ApplicationAssetsSQLModel,
          attributes: ["id"],
        },
        {
          model: ApplicationHumansSQLModel,
          attributes: ["id"],
        },
      ],
      offset: (page - 1) * size,
      limit: +size,
    });

    const finalArray = await Promise.all(
      applications.map(async (app) => ({
        application_assets: app.application_assets,
        application_humans: app.application_humans,
        company_id: app.company_id,
        createdAt: app.createdAt,
        description: app.description,
        id: app.id,
        is_shared_service: app.is_shared_service,
        is_using_other_services: app.is_using_other_services,
        name: app.name,
        risk_score: app.risk_score,
        updatedAt: app.updatedAt,
        shared_services: await ApplicationServicesSQLModel.findAll({
          where: {
            application_id: app.id,
          },
          include: [{ model: ApplicationSQLModel, attributes: ["id"] }],
          attributes: ["id"],
        }),
      }))
    );
    return finalArray;
  } catch (err) {
    return err.message;
  }
};

export const countHumansOnRisk = async (filterObj, risk_level = null) => {
  try {
    if (risk_level) {
      filterObj.risk_level = risk_level;
    }
    const users = await humanSQLModel
      .findAll({
        where: filterObj,
        include: [
          {
            model: humanSourcesModel,
            where: {
              integration_id: { [Op.ne]: null },
            },
            attributes: [],
          },
        ],
      })
      .then((results) => results?.length);
    return users;
  } catch (err) {
    return err.message;
  }
};

export const createUserHumanRelation = async (user) => {
  try {
    await humanSQLModel.update(
      { user_id: user.id },
      {
        where: {
          email: user.email,
          company_id: user.company_id,
        },
      }
    );
  } catch (error) {
    return error.message;
  }
};
