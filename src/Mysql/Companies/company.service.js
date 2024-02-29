import moment from "moment";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize";
import sequelize from "../db";
import { errorHandler } from "../../utils/errorHandler";
import IntegrationModel from "../Integration/integration.model";
import companyModel from "./company.model";
import userModel from "../Users/users.model";
import assetSQLModel from "../Assets/assets.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import { getSourceValidation } from "../Assets/assets.service";
import companyScoreHistoryModel from "../CompanyScoreHistory/companyScoreHistory.model";
import partnerCompanySQLModel from "../PartnerCompanies/partnerCompanies.model";
import IntegrationBaseUrlsModel from "../IntegrationBaseUrls/IntegrationBaseUrls.model";

export const updateOrCreateCompany = async (data) => {
  try {
    const i = 0;

    const company = data?.id
      ? await companyModel.findOne({
          where: { id: data.id },
        })
      : false;

    if (company) {
      await companyModel.update(data, {
        where: {
          id: company.id,
        },
      });
    } else {
      const newCompany = await companyModel.create(data);
      return newCompany;
    }
  } catch (err) {
    errorHandler(err);
    return null;
  }
};

export const createCompany = async (data) => {
  try {
    const company = await companyModel.create(data);

    return company;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getCompany = async (companyDomain) => {
  try {
    console.log("getcompany", companyDomain);
    const company = await companyModel
      .findOne({ where: { company_domain: companyDomain } })
      .then((res) => res)
      .catch((err) => {
        errorHandler(err);
      });
    console.log("company");
    return Promise.resolve(company);
  } catch (err) {
    return Promise.reject({ error: "Error while querying mongo" });
  }
};
export const getCompanyHaveIntegration = async (
  companyId,
  integrationsNames,
  integrationCategoryType
) => {
  try {
    const companies = await companyModel.findOne({
      attributes: ["id", "company_name"],
      where: { id: companyId },
      raw: true,
      nest: true,
      include: {
        model: IntegrationModel,
        attributes: [
          "integration_values",
          "integration_name",
          "integration_category_type",
          "id",
        ],
        include: [
          {
            model: IntegrationBaseUrlsModel,
          },
        ],
        where: {
          integration_name: integrationsNames,
          integration_category_type: integrationCategoryType,
        },
        required: true,
      },
    });
    const results = JSON.stringify(companies, null, 2);
    // return Promise.resolve(JSON.parse(results))
    return Promise.resolve(companies);
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};
export const getAllCompaniesHaveIntegration = async (integrationsNames) => {
  try {
    const companies = await companyModel.findAll({
      where: { type: "company" },
      attributes: ["id", "company_name"],
      raw: true,
      nest: true,
      include: {
        model: IntegrationModel,
        attributes: [
          "integration_values",
          "integration_category_type",
          "integration_name",
          "id",
        ],
        include: [
          {
            model: IntegrationBaseUrlsModel,
          },
        ],
        where: {
          integration_name: integrationsNames,
        },
      },
    });
    const results = JSON.stringify(companies, null, 2);
    // return Promise.resolve(JSON.parse(results))
    return Promise.resolve(companies);
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};
export const getCompanyWithIntegtation = async (
  companyId,
  integrationsNames
) => {
  try {
    const companies = await companyModel.findOne({
      where: { id: companyId },
      attributes: ["id", "company_name"],
      raw: true,
      nest: true,
      include: {
        model: IntegrationModel,
        attributes: ["integration_values", "integration_name", "id"],
        include: [
          {
            model: IntegrationBaseUrlsModel,
          },
        ],
        where: {
          integration_name: integrationsNames,
        },
      },
    });
    const results = JSON.stringify(companies, null, 2);
    // return Promise.resolve(JSON.parse(results))
    return Promise.resolve(companies);
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};
export const getAllCompaniesWithAllIntegration = async () => {
  try {
    const companies = await companyModel.findAll({
      where: { type: "company" },
      attributes: ["id", "company_name"],
      include: {
        model: IntegrationModel,
        attributes: [
          "integration_values",
          "integration_category_type",
          "integration_name",
          "id",
        ],
      },
    });

    // row:true is not working fine thats by i have user JSON method to convert data to json

    return Promise.resolve(JSON.parse(JSON.stringify(companies)));
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};
export const getCompanies = async (filter) => {
  try {
    if (!filter) {
      filter = {};
    }
    filter.type = "company";
    const companies = await companyModel.findAll({ where: filter });

    return Promise.resolve(companies);
  } catch (err) {
    return Promise.reject({ error: err });
  }
};

export const getCompaniesWithSize = async (filter, page = 1, size = 10) => {
  try {
    if (!filter) {
      filter = {};
    } else {
      filter = JSON.parse(filter);
    }
    filter.company_domain = { [Op.ne]: "admin.com" };
    let sort = "ASC";
    let sortColumn = "company_score";
    if (filter?.sort) {
      sort = filter?.sort === "asc" ? "ASC" : "DESC";
      sortColumn = "company_score";
    }
    if (filter?.search) {
      filter.company_name = { [Op.like]: `%${filter.search}%` };
    }
    // filter.type = "company";
    filter.type = { [Op.in]: ["company", "partner"] };
    delete filter.sort;
    delete filter.search;
    console.log("filter", filter);
    const companies = await companyModel.findAll({
      where: filter,
      include: [
        {
          model: userModel,
          attributes: [],
        },
        {
          model: partnerCompanySQLModel,
          include: [
            {
              model: userModel,
              // where: {
              //   company_id: {
              //     [Op.ne]: superAdminId
              //   }
              // }
            },
          ],
        },
        {
          model: companyScoreHistoryModel,
          where: {
            createdAt: {
              [Op.gte]: moment().subtract(7, "days").toDate(),
            },
          },
          required: false,
          attributes: ["risk_score", "createdAt"],
        },
      ],
      attributes: [
        "id",
        "company_name",
        "company_domain",
        "industry_type",
        "address",
        "type",
        "company_score",
        [
          sequelize.literal(
            `(SELECT COUNT(id) FROM users WHERE users.company_id = companies.id)`
          ),
          "user_count",
        ],
      ],
      offset: (page - 1) * size,
      limit: +size,
      order: [[sortColumn, sort]],
    });
    const totalCompanies = await companyModel.count({
      where: filter,
    });

    const finalData = await Promise.all(
      companies.map(async (company) => {
        const data = JSON.parse(JSON.stringify(company));
        const SourceValidation = await getSourceValidation(company.id, []);
        const query = { company_id: company.id };
        data.total_assets = await assetSQLModel
          .findAll({
            where: query,
            include: [SourceValidation],
          })
          .then((result) => result?.length || 0);
        data.total_risk_assets = await assetSQLModel
          .findAll({
            where: query,
            include: [
              SourceValidation,
              {
                model: AssetScoreSQLModel,
                where: {
                  risk_score: { [Op.lte]: 540 },
                },
              },
            ],
          })
          .then((result) => result?.length || 0);
        return data;
      })
    );

    return Promise.resolve({ data: finalData, totalCount: totalCompanies });
  } catch (err) {
    return Promise.reject({ error: err });
  }
};

export const getCompanyByFilter = async (filter) => {
  try {
    // filter.type = "company";
    const company = await companyModel.findOne({ where: filter });
    return Promise.resolve(company);
  } catch (err) {
    return Promise.reject(err);
  }
};
export const saveCompany = async (company) => {
  try {
    let response = null;
    if (company.id) {
      response = await companyModel.update(company, {
        where: { id: company.id },
      });
    } else {
      response = await companyModel.create(company);
    }
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};
export const updateCompany = async (id, data) => {
  try {
    const response = await companyModel.update(data, { where: { id } });
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getTotalCompanies = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.company_domain = { [Op.ne]: "admin.com" };
  // filter.type = "company";
  filter.type = { [Op.in]: ["company", "partner"] };
  const totalCompaniesCount = await companyModel.count({
    where: filter,
  });
  return totalCompaniesCount;
};

export const getTotalLowRiskCompanies = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.type = "company";
  filter.company_domain = { [Op.ne]: "admin.com" };
  filter.company_score = { [Op.gte]: 720 };
  const totalLowRiskCompaniesCount = await companyModel.count({
    where: filter,
  });
  return totalLowRiskCompaniesCount;
};

export const getTotalHighRiskCompanies = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.type = "company";
  filter.company_domain = { [Op.ne]: "admin.com" };
  filter.company_score = { [Op.lte]: 520 };
  console.log("filter", filter);
  const totalHighRiskCompaniesCount = await companyModel.count({
    where: filter,
  });
  return totalHighRiskCompaniesCount;
};

export const getTotalMediumRiskCompanies = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.type = "company";
  filter.company_domain = { [Op.ne]: "admin.com" };
  filter.company_score = { $between: [520, 720] };
  const totalMediumRiskCompaniesCount = await companyModel.count({
    where: filter,
  });
  return totalMediumRiskCompaniesCount;
};

export const getTopScorerCompany = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.type = "company";
  filter.company_domain = { [Op.ne]: "admin.com" };
  const topScorerCompanyCount = await companyModel.findOne({
    where: filter,
    attributes: [
      [sequelize.fn("max", sequelize.col("company_score")), "score"],
    ],
    raw: true,
  });
  // return getCompanyByFilter

  // const getCompanyByFilter = await getCompanyByFilter({company_score:topScorerCompanyCount.score});
  const company = await companyModel.findOne({
    where: { company_score: topScorerCompanyCount.score },
    attributes: ["company_name", "company_score"],
  });
  return Promise.resolve(company);
};

export const getLeastScorerCompany = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.type = "company";
  filter.company_domain = { [Op.ne]: "admin.com" };
  const leastScorerCompanyCount = await companyModel.findOne({
    where: filter,
    attributes: [
      [sequelize.fn("min", sequelize.col("company_score")), "score"],
    ],
    raw: true,
  });
  // return leastScorerCompanyCount
  const company = await companyModel.findOne({
    where: { company_score: leastScorerCompanyCount.score },
    attributes: ["company_name", "company_score"],
  });
  return Promise.resolve(company);
};

export const getAverageScorerCompany = async (filter) => {
  if (!filter) {
    filter = {};
  } else {
    filter = JSON.parse(filter);
  }
  filter.company_domain = { [Op.ne]: "admin.com" };
  filter.type = "company";
  const averageScorerCompanyCount = await companyModel.findOne({
    where: filter,
    attributes: [
      [
        Sequelize.cast(
          sequelize.fn("avg", sequelize.col("company_score")),
          "integer"
        ),
        "score",
      ],
    ],
    raw: true,
  });
  return averageScorerCompanyCount;
};

export const findCompanyById = async (company_id) => {
  try {
    const fyndCompany = await companyModel.findOne({
      where: {
        id: company_id,
      },
    });
    return fyndCompany;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};

export const companyLoginToken = async (userRole, company_id, user) => {
  try {
    const userInfo = {
      id: user.id,
      // role: await getUserRole(user.id),
      role: userRole,
      company_id,
      sub: user.auth0_id,
      given_name: user.full_name,
      nickname: user.full_name,
      name: user.full_name,
      picture: user.profile_image,
      updated_at: user.updatedAt,
      email: user.email,
      email_verified: true,
      from: userRole,
    };
    const expiresIn = 120 * 60;
    const token = jwt.sign(
      userInfo,
      process.env.AUTH0_CLIENT_SECRET,
      { expiresIn },
      { algorithm: "RS256" }
    );
    const response = {
      expiresIn,
      token,
    };
    return response;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};

export const deleteCompanyById = async (company, user) => {
  try {
    await companyModel.destroy({
      where: {
        id: company.id,
      },
    });
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};

const companyService = {
  updateOrCreateCompany,
  getCompanyWithIntegtation,
  createCompany,
  getCompany,
  getCompanies,
  getCompanyByFilter,
  saveCompany,
  updateCompany,
  getTotalCompanies,
  getTotalLowRiskCompanies,
  getTotalHighRiskCompanies,
  getTotalMediumRiskCompanies,
  getTopScorerCompany,
  getLeastScorerCompany,
  getAverageScorerCompany,
  findCompanyById,
  companyLoginToken,
  deleteCompanyById,
};
export default companyService;
