import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { logger } from "../../../logs/config";
import knowBe4UsersModel from "../../mongo/Knowbe4/users/knowBe4Users.model";
import microsoftUsersModel from "../../mongo/microsoft/users/microsoftUsers.model";
import { integrationsNames, humansRiskTypes } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import ApplicationHumansSQLModel from "../ApplicationHumans/applicationHumans.model";
import {
  getAllCompaniesHaveIntegration,
  getAllCompaniesWithAllIntegration,
} from "../Companies/company.service";
import { getHumanAssetRelations } from "../HumanAssets/humanAssets.service";
import HumanCustomWeightageScoreModel from "../HumanScoreManagements/HumanCustomWeightageScore/HumanCustomWeightageScore.model";
import humanSourcesModel from "../HumanSource/humanSources.model";
import HumanActivityCategory, {
  humanDeleteActivity,
} from "../Logs/ActivitiesType/humanActivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import { getEventLogsByCategory } from "../Logs/eventLogs/eventLogs.service";
import humanSQLModel from "./human.model";
import {
  getHumanById,
  updateOrCreateSQLHumansOfIntegration,
  getHumanList,
  getHumanApplicationRelations,
  countHumansOnRisk,
} from "./human.service";

const getKnowbe4Data = async (company_id, integration_id) => {
  const knowBe4Humans = await knowBe4UsersModel.find({
    company_id,
  });
  const data = knowBe4Humans.map((item) => ({
    company_id,
    first_name: item.first_name,
    last_name: item.last_name,
    email: item.email,
    phone_number: item.phone_number,
    current_risk_score: item.current_risk_score,
    status: item.status,
    groups: item.groups,
    human_id: item?.id?.toString(),
    human_sources: [
      {
        human_source_id: item.id,
        sources_type: integrationsNames.KNOWBE4,
        integration_id,
      },
    ],
  }));
  return data;
};

const getMicrosoftData = async (company_id, integration_id) => {
  const humansData = await microsoftUsersModel.find({
    company_id,
  });

  // eslint-disable-next-line array-callback-return
  const data = humansData.map((item) => ({
    company_id,
    first_name: item.givenName !== null ? item.givenName : item.displayName,
    last_name: item.surname,
    email: item.mail,
    phone_number: item.businessPhones[0] || "",
    human_id: item?.id?.toString(),
    human_sources: [
      {
        human_source_id: item.id,
        sources_type: integrationsNames.MICROSOFT,
        integration_id,
      },
    ],
  }));

  return data;
};

const HumanDataFunctions = {
  knowbe4: getKnowbe4Data,
  microsoft: getMicrosoftData,
};
const calculationAvailableFor = [
  integrationsNames.KNOWBE4,
  integrationsNames.MICROSOFT,
];
export const saveHumansOfCompany = async (company) => {
  try {
    const companyIntegrations = company.integrations?.id
      ? [company.integrations]
      : company.integrations;

    for await (const integration of companyIntegrations) {
      console.log(
        "********************Saving humans for company_id",
        company.id,
        "of",
        integration.integration_name,
        "Integration ***********************"
      );
      const oldHumans = await humanSQLModel.findAll({
        where: { company_id: company.id },
        include: [
          {
            model: humanSourcesModel,
            where: { sources_type: integration.integration_name },
            required: true,
          },
        ],
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      const lastUpdatedAtDate = oldHumans?.[0]?.updatedAt;
      const integrationAssets = calculationAvailableFor.includes(
        integration.integration_name
      )
        ? await HumanDataFunctions[integration.integration_name](
            company.id,
            integration.id
          )
        : [];
      if (lastUpdatedAtDate) {
        const humansForDelete = await humanSQLModel.findAll({
          where: {
            company_id: company.id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
          include: [
            {
              model: humanSourcesModel,
              where: { sources_type: integration.integration_name },
              required: true,
            },
          ],
        });
        for await (const humanToDelete of humansForDelete) {
          await humanSourcesModel
            .destroy({
              where: {
                id: humanToDelete?.human_sources?.[0]?.id,
              },
            })
            .then(async () => {
              logger.info(
                `${JSON.stringify(humanToDelete)} delete humans of company ${
                  company.id
                } updateAt less then`
              );
              await addEventLog(
                {
                  client_id: null,
                  client_email: "system",
                  process: "human delete by cron",
                  user_id: null,
                  user_company_id: humanToDelete.company_id,
                },
                humanDeleteActivity.status.humanDeletedSuccessfully.code,
                createEventPayload(
                  {},
                  JSON.parse(JSON.stringify(humanToDelete)),
                  humanSQLModel.tableName
                )
              );
            })
            .catch(async (err) => {
              await addEventLog(
                {
                  client_id: null,
                  client_email: "system",
                  process: "human delete by cron",
                  user_id: null,
                  user_company_id: humanToDelete.company_id,
                },
                humanDeleteActivity.status.humanDeletionFailed.code,
                null,
                err.message
              );
            });
        }
        logger.info(
          `${humansForDelete.length}  humans delete of company ${company.id} of integration ${integration.id} updateAt less then ${lastUpdatedAtDate} `
        );
        console.log("delete humans", humansForDelete.length);
      }

      if (integrationAssets.length > 0) {
        console.log("integrationAssets.length", integrationAssets.length);
        await updateOrCreateSQLHumansOfIntegration(integrationAssets);
      }
    }
  } catch (err) {
    logger.error(`${err} in save Humans controller`);
    errorHandler(err);
  }
};
// export const saveHumans = async (integrationName) => {
export const saveHumans = async () => {
  try {
    console.log("save humans function running");
    const integrationName = "knowbe4";
    const Companies = integrationName
      ? await getAllCompaniesHaveIntegration(integrationName)
      : await getAllCompaniesWithAllIntegration();
    if (Companies.length > 0) {
      for await (const company of Companies) {
        await saveHumansOfCompany(company);
      }
    }
  } catch (err) {
    logger.error(`${err} in save Humans controller`);
    errorHandler(err);
  }
};

export const getHumansData = async (req, res) => {
  try {
    const { user } = req;
    const filterObj = { company_id: user.company_id };
    const { query } = req;
    const { page } = query;
    const { size } = query;
    let sort = "DESC";
    let sortColumn = "createdAt";
    const filter = JSON.parse(query?.filter);
    if (filter?.sort) {
      sort = filter?.sort === "asc" ? "ASC" : "DESC";
      sortColumn = "first_name";
    }
    if (filter?.search) {
      filterObj.first_name = { [Op.like]: `%${filter.search}%` };
    }

    if (filter?.not_included_ids) {
      filterObj.id = { [Op.notIn]: filter?.not_included_ids };
    }
    if (filter?.included_ids) {
      filterObj.id = { [Op.in]: filter?.included_ids };
    }
    if (filter?.risk) {
      filterObj.risk_level = { [Op.in]: [filter?.risk] };
    }

    const tableData = await getHumanList(
      filterObj,
      page,
      size,
      sort,
      sortColumn
    );
    const totalCount = await humanSQLModel
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
    const applicationsCountWithCustomScoreQuery = {};
    if (filter?.applicationsCustomScoreFilter?.notIncludedWeightageIds) {
      applicationsCountWithCustomScoreQuery.weightage_id = {
        [Op.notIn]:
          filter?.applicationsCustomScoreFilter?.notIncludedWeightageIds || [],
      };
    }

    let applicationsCountWithCustomScore = 0;
    if (filter?.applicationsCustomScoreFilter) {
      applicationsCountWithCustomScore = await humanSQLModel
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
            {
              model: HumanCustomWeightageScoreModel,
              where: applicationsCountWithCustomScoreQuery,
              required: true,
            },
          ],
        })
        .then((results) => results?.length);
    }

    const totalUsers = await countHumansOnRisk(
      { company_id: user.company_id },
      null
    );
    const highRiskUsers = await countHumansOnRisk(
      { company_id: user.company_id },
      humansRiskTypes.high
    );
    const mediumRiskUsers = await countHumansOnRisk(
      { company_id: user.company_id },
      humansRiskTypes.medium
    );
    const lowRiskUsers = await countHumansOnRisk(
      { company_id: user.company_id },
      humansRiskTypes.low
    );

    res.status(200).json({
      valid: true,
      message: "Humans fetch successfully",
      page,
      size,
      totalCount,
      tableData,
      highRiskUsers,
      mediumRiskUsers,
      lowRiskUsers,
      totalUsers,
      applicationsCountWithCustomScore,
    });
  } catch (err) {
    // const eventLogs = await addEventLog({ ...clientDetails, user_id: null }, createGroupLog.status.createGroupFailed.code, null)
    errorHandler(err);
    res.status(400).json({ err, message: err.message });
  }
};

export const updateHuman = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { body } = req;
    const { risk_level } = body;
    const { region } = body;
    await humanSQLModel.update(
      { risk_level, region },
      {
        where: { id },
      }
    );
    res.status(200).json({
      valid: true,
      message: "Risk level update successfully",
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const humanDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const human = await getHumanById(id);
    res.status(200).json({
      valid: true,
      message: "Human details fetch successfully",
      data: human,
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const humanAssetsLinked = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getHumanAssetRelations(id);
    res.status(200).json({
      valid: true,
      message: "Human assets linked fetch successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const humanApplicationLinked = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const data = await getHumanApplicationRelations(
      id,
      page,
      size,
      user.company_id
    );
    const totalCount = await ApplicationHumansSQLModel.count({
      where: { human_id: id },
    });
    res.status(200).json({
      valid: true,
      message: "Human applications linked fetch successfully",
      data,
      totalCount,
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const humanActivityLogs = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { size, page } = req.query;
    const offset = size * (page - 1);
    const limit = +size;
    const logsData = await getEventLogsByCategory(
      { target_id: id },
      offset,
      limit,
      HumanActivityCategory.code
    );
    return res.json(logsData);
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
