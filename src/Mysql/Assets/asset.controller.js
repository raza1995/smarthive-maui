/* eslint-disable no-nested-ternary */
import { Op } from "sequelize";
import {
  assetType,
  integrationCategoryType,
  integrationsNames,
  nonNetworkSubTypes,
} from "../../utils/constants";
import {
  getAssetsByCompanyId,
  getAssetsCompanyByFilterAndAttributes,
  getCompanyAssets,
  getCompanyAssetsBySource,
  getSourceValidation,
  totalAssetCountService,
  updateOrCreateSQLAsset,
  updateOrCreateSQLAssetOfIntegration,
} from "./assets.service";
import assetSQLModel from "./assets.model";
import { findUserByEmail, findUserOAuthId } from "../Users/users.service";
import deviceModel from "../../mongo/models/auvik/device";
import automoxDeviceModel from "../../mongo/models/Automox/automoxDevice.model";
import {
  getCompanyIntegrationIds,
  getUserIntegrationSupport,
} from "../Integration/integration.service";
import companyService, {
  getAllCompaniesHaveIntegration,
  getAllCompaniesWithAllIntegration,
  getCompanyWithIntegtation,
} from "../Companies/company.service";
import { logger } from "../../../logs/config";
import assetSourcesModel from "../AssetSources/assetSources.model";
// import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import automoxAPI from "../../api/automox";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";

import {
  assetDeleteActivity,
  restartDevice,
  scanDevice,
} from "../Logs/ActivitiesType/assetsactivities";
import IntegrationModel from "../Integration/integration.model";
import malwareBytesEndpointModel from "../../mongo/malwareBytes/Endpoints/endpoints.model";
import endpointDetectionsModel from "../EndpointsDetections/endpointsDetections.model";
import endpointSuspiciousActivityModel from "../EndpointsSuspiciousActivity/endpointSuspiciousActivity.model";
import sequelize from "../db";
import companyModel from "../Companies/company.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import { calculateAndUpdateCompanyScore } from "../Companies/company.controller";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import {
  assetswithoutPatchService,
  totalPatchingAssetsCountService,
  updatedPatchingAssetsCountService,
} from "../AssetPatchingInformation/assetPatchingInformation.service";
import { getResilenceDashboard } from "../Logs/ActivitiesType/userActivities";
import getCrowdStrikeAssetsOfCompany from "./AssetIntegrationsServices/CrowdStrikeAssets.service";
import getSentinelOneAssetsOfCompany from "./AssetIntegrationsServices/SentinelOneAssets.service";
import microsoftDevicesModel from "../../mongo/microsoft/devices/microsoftDevices.model";
import { errorHandler } from "../../utils/errorHandler";
import CompaniesAverageScoreHistoryModel from "../CompaniesAverageScoreHistory/CompaniesAverageScoreHistory.model";
import CompaniesPeerScoreHistoryModel from "../CompaniesPeerScoreHistory/CompaniesPeerScoreHistory.model";
import companyScoreHistoryModel from "../CompanyScoreHistory/companyScoreHistory.model";
import { assetsScoreWeightagesScoresUpdateTrigger } from "../AssetsScoreManagements/Triggers/TriggerFunctions";
import getDruvaAssetsOfCompany from "./AssetIntegrationsServices/DruvaAssets.service";

export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const getAuvikData = async (company_id, integration_id) => {
  const Device = await deviceModel.find({
    company_id,
  });
  const data = Device.map((item) => ({
    attributes: item.attributes,
    company_id: item?.company_id,
    integration_id,
    asset_name: item.attributes.deviceName,
    device_id: item?.id,
    asset_sources: [
      {
        device_id: item.id,
        sources_type: integrationsNames.AUVIK,
        integration_id,
      },
    ],
    asset_sub_type: item.attributes.deviceType,
    ipaddress: item.attributes?.ipAddresses[0],
    asset_type: nonNetworkSubTypes.includes(item.attributes.deviceType)
      ? "non-network"
      : ["unknown"].includes(item.attributes.deviceType)
      ? "unknown"
      : "network",
  }));
  return data;
};
const getMalwareByteData = async (company_id, integration_id) => {
  const integration = await IntegrationModel.findOne({
    where: { id: integration_id },
  });

  const malwareDevice = await malwareBytesEndpointModel.find({
    company_id,
    integration_category_type: integration.integration_category_type,
  });
  const data = malwareDevice.map((item) => ({
    company_id: item?.company_id,
    asset_name: item?.agent?.host_name,
    asset_sources: [
      {
        device_id: item.link,
        sources_type: integrationsNames.MALWAREBYTES,
        integration_id,
      },
    ],
    asset_sub_type: item?.agent?.os_info?.os_type,
    ipaddress: item?.agent?.machine_ip,
    asset_type: nonNetworkSubTypes.includes(item.agent.os_info.os_type)
      ? "non-network"
      : ["unknown"].includes(item.agent.os_info.os_type)
      ? "unknown"
      : "network",
  }));
  return data;
};
const getAutomoxData = async (company_id, integration_id) => {
  const automoxDevices = await automoxDeviceModel.find({
    company_id,
  });
  const data = automoxDevices.map((item) => ({
    company_id: item?.company_id,
    asset_name: item.display_name,
    asset_sources: [
      {
        device_id: item.id,
        sources_type: integrationsNames.AUTOMOX,
        integration_id,
      },
    ],
    asset_sub_type: "Workstation",
    asset_type: "non-network",
    ipaddress: item?.ip_addrs_private?.[0],
  }));
  return data;
};

const getMicrosoftAssetsOfCompany = async (company_id, integration_id) => {
  const microsoftDevices = await microsoftDevicesModel.find({
    company_id,
  });
  const data = microsoftDevices.map((item) => ({
    company_id: item?.company_id,
    asset_name: item.deviceName,
    asset_sources: [
      {
        device_id: item.id,
        sources_type: integrationsNames.MICROSOFT,
        integration_id,
      },
    ],
    asset_sub_type: "Workstation",
    asset_type: "non-network",
    ipaddress: null,
    user_id: item?.userId,
  }));
  return data;
};

const addAssert = async (company_id, assetData) => {
  const oldAssets = await assetSQLModel.findAll({
    where: { company_id },
    order: [["updatedAt", "DESC"]],
  });

  const lastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
  await updateOrCreateSQLAsset(assetData);
  if (oldAssets.length > 0) {
    const deleteAssets = await assetSQLModel.destroy({
      where: {
        company_id,
        updatedAt: { [Op.lte]: lastUpdatedAtDate },
      },
    });
    console.log(assetData?.length, "delete assets", deleteAssets);
  }
};
const AssetDataFunctions = {
  [integrationsNames.AUVIK]: getAuvikData,
  [integrationsNames.MALWAREBYTES]: getMalwareByteData,
  [integrationsNames.AUTOMOX]: getAutomoxData,
  [integrationsNames.CROWDSTRIKE]: getCrowdStrikeAssetsOfCompany,
  [integrationsNames.SENTINELONE]: getSentinelOneAssetsOfCompany,
  [integrationsNames.MICROSOFT]: getMicrosoftAssetsOfCompany,
  [integrationsNames.DRUVA]: getDruvaAssetsOfCompany,
  
};
const calculationAvailableFor = [
  integrationsNames.MALWAREBYTES,
  integrationsNames.AUTOMOX,
  integrationsNames.AUVIK,
  integrationsNames.CROWDSTRIKE,
  integrationsNames.SENTINELONE,
  integrationsNames.MICROSOFT,
  integrationsNames.DRUVA
];
export const saveAssetsOfCompany = async (company) => {
  try {
    const companyIntegrations = company.integrations?.id
      ? [company.integrations]
      : company.integrations;
    for await (const integration of companyIntegrations) {
      // eslint-disable-next-line no-console
      console.log(
        "********************Saving assets for company_id",
        company.id,
        "of",
        integration.integration_name,
        "Integration ***********************"
      );
      const oldAssets = await assetSQLModel.findAll({
        where: { company_id: company.id },
        include: [
          {
            model: assetSourcesModel,
            where: { sources_type: integration.integration_name },
          },
        ],
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      const lastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
      console.log(
        "lastUpdatedAtDate",
        lastUpdatedAtDate,
        integration.integration_name
      );
      const integrationAssets = calculationAvailableFor.includes(
        integration.integration_name
      )
        ? await AssetDataFunctions[integration.integration_name](
            company.id,
            integration.id
          )
        : [];
      if (integrationAssets.length > 0) {
        await updateOrCreateSQLAssetOfIntegration(
          integrationAssets,
          integration
        );
      }
      console.log("lastUpdatedAtDate", lastUpdatedAtDate);
      if (lastUpdatedAtDate) {
        const assetsForDelete = await assetSQLModel.findAll({
          where: {
            company_id: company.id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
          include: [
            {
              model: assetSourcesModel,
              where: { sources_type: integration.integration_name },
              include: [
                {
                  model: IntegrationModel,
                  where: {
                    integration_category_type:
                      integration.integration_category_type,
                  },
                },
              ],
            },
          ],
          raw: true,
          nest: true,
        });
        for await (const assetToDelete of assetsForDelete) {
          const deleteAssets = await assetSQLModel
            .destroy({
              where: {
                id: assetToDelete.id,
              },
            })
            .then(async () => {
              logger.info(
                `${JSON.stringify(assetToDelete)} delete assets of company ${
                  company.id
                } updateAt less then`
              );
              await addEventLog(
                {
                  client_id: null,
                  client_email: "system",
                  process: `removed asset ${assetToDelete.asset_name}`,
                  user_id: null,
                  company_id: assetToDelete.company_id,
                },
                assetDeleteActivity.status.assetDeletedSuccessfully.code,
                createEventPayload(
                  {},
                  JSON.parse(JSON.stringify(assetToDelete)),
                  assetSQLModel.tableName
                )
              );
            })
            .catch(async (err) => {
              await addEventLog(
                {
                  client_id: null,
                  client_email: "system",
                  process: "asset delete by cron",
                  user_id: null,
                  company_id: assetToDelete.company_id,
                },
                assetDeleteActivity.status.assetDeletingFailed.code,
                null,
                err.message
              );
            });
        }
        logger.info(
          `${assetsForDelete.length}  assets delete of company ${company.id} of integration ${integration.id} updateAt less then ${lastUpdatedAtDate} `
        );
        console.log(
          `${assetsForDelete.length}  assets delete of company ${company.id} of integration ${integration.id} updateAt less then ${lastUpdatedAtDate} `
        );
      }
    }
    await calculateAndUpdateCompanyScore(company.id);
    // await getAssetProperties(company.id);
    // await getAssetInfo(company.id);
   await assetsScoreWeightagesScoresUpdateTrigger(company.id);
  } catch (err) {
    logger.error(`${err} in saveAssets controlled`);
    errorHandler(err);
  }
};

export const saveAssets = async (integrationName) => {
  try {
    console.log("save assets function running");
    const Companies = integrationName
      ? await getAllCompaniesHaveIntegration(integrationName)
      : await getAllCompaniesWithAllIntegration();
    if (Companies.length > 0) {
      for await (const company of Companies) {
        await saveAssetsOfCompany(company);
      }
    }
  } catch (err) {
    logger.error(`${err} in saveAssets controlled`);
    errorHandler(err);
  }
};

export const getAsset = async (req, res) => {
  try {
    if (res) {
      res.send("Assets data start successfully");
    }
    const Companies = await getAllCompaniesWithAllIntegration();
    if (Companies.length > 0) {
      for await (const company of Companies) {
        const storedAssets = await getCompanyAssets(company.id);
        let assetData = [];
        console.log(
          "********************Asset calculation start for company_id",
          company.id,
          "***********************"
        );
        for await (const integration of company.integrations) {
          const integrationAssets = calculationAvailableFor.includes(
            integration.integration_name
          )
            ? await AssetDataFunctions[integration.integration_name](
                company.id,
                integration.id
              )
            : [];
          console.log(
            integration.integration_name,
            "total device",
            integrationAssets.length
          );
          if (integrationAssets.length > 0) {
            if (assetData.length > 0) {
              for await (const item of assetData) {
                for await (const device of integrationAssets) {
                  const assertTypes = [item.asset_type, device.asset_type];
                  if (assertTypes.includes(assetType.unknown)) {
                    const getStoreAssetIp = async () => {
                      const SourceAsserts = await getCompanyAssetsBySource(
                        company.id,
                        integration.integration_name,
                        device.device_id
                      );
                      return SourceAsserts?.ipaddress;
                    };
                    if (
                      item.ipaddress === device.ipaddress ||
                      item.ipaddress === (await getStoreAssetIp())
                    ) {
                      const assetIndex = assetData.indexOf(item);
                      const knownAssetIndex =
                        assertTypes.indexOf(assetType.unknown) === 0 ? 1 : 0;
                      const knownAssetData = [item, device][knownAssetIndex];
                      assetData[assetIndex] = {
                        ...item,
                        asset_name: knownAssetData.asset_name,
                        asset_sources: [
                          ...item.asset_sources,
                          {
                            device_id: device.device_id,
                            sources_type: integration.integration_name,
                          },
                        ],
                        asset_sub_type: knownAssetData.asset_sub_type,
                        asset_type: knownAssetData.asset_type,
                        ipaddress: device.ipaddress,
                      };
                      integrationAssets.splice(
                        integrationAssets.indexOf(device),
                        1
                      );
                    }
                  } else if (item.asset_name === device.asset_name) {
                    assetData[assetData.indexOf(item)].asset_sources.push({
                      device_id: device.device_id,
                      sources_type: integration.integration_name,
                    });
                    integrationAssets.splice(
                      integrationAssets.indexOf(device),
                      1
                    );
                  }
                }
              }
              assetData = [...assetData, ...integrationAssets];
            } else {
              assetData = [...integrationAssets];
            }
          }
        }

        await addAssert(company.id, assetData);
      }
    }
  } catch (error) {
    errorHandler(error);
  }
};
export const getAssetList = async (req, res) => {
  try {
    const { user } = req;

    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Resilence All Assets",
      company_id: user.company_id,
    };
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getResilenceDashboard.status.resilenceDashboardGetSuccessfully.code,
      null
    );

    const result = await getAssetsByCompanyId(
      user.company_id,
      req.query.size,
      req.query.page,
      JSON.parse(req.query.filter)
    );
    res.status(200).json({
      status: true,
      message: "Success",
      data: result?.data,
      totalCount: result?.totalCount || 0,
      assetsAtHighRisk: result?.assetsAtHighRisk || 0,
      assetsAtMediumRisk: result?.assetsAtMediumRisk || 0,
      assetsAtLowRisk: result?.assetsAtLowRisk || 0,
      filterCount: result?.filterCount || 0,
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};
export const getAssetSelectionList = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const result = await getAssetsCompanyByFilterAndAttributes(
      // user.company_id,
      loggedInUser.company_id,
      req.query.size,
      req.query.page,
      filter,
      ["totalAssetsCount"]
    );
    res.status(200).json({
      status: true,
      message: "Success",
      assets: result?.Assets,
      totalCount: result?.totalAssetsCount || 0,
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};
export const saveAssetsController = async (req, res) => {
  try {
    if (res) res.send("Assets data start successfully");
    await saveAssets();
  } catch (err) {
    errorHandler(err);
  }
};

export const assetsOverview = async (req, res) => {
  try {
    const { user } = req;
    const company_id = req.query.company_id
      ? req.query.company_id
      : user.company_id;
    const integration = await getUserIntegrationSupport(company_id);
    const SourceValidation = await getSourceValidation(company_id, []);
    const integrationSupported = integration.map(
      (item) =>
        // integrationIds.push(item.id);
        item.integration_category_type
    );
    const companyAssets = await assetSQLModel.findAll({
      where: { company_id },
      attributes: ["id"],
      include: [
        {
          model: assetSourcesModel,
          required: true,
          attributes: ["id", "asset_id"],
          include: [
            {
              model: IntegrationModel,
              attributes: ["id", "integration_category_type"],
              required: true,
            },
          ],
        },
      ],
    });
    const userCompany = await companyService.getCompanyByFilter({
      id: company_id,
    });
    const companyAssetsIds = companyAssets.map(
      (asset) =>
        // console.log(asset.asset_sources);
        asset.id
      // integrationSupported.push(asset.)
    );
    // const endpointCount = await assetSQLModel
    //   .findAndCountAll({
    //     where: {
    //       company_id,
    //       asset_type: assetType.nonNetwork,
    //     },
    //     include: [{ ...SourceValidation }],
    //   })
    //   .then((resp) => resp.rows.length);

    const filterObj = { company_id: user.company_id };
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.endpoint
    );
    const endpointFilter = { integration_id: { [Op.in]: integrationIds } };
    
    const includes = [
      {
        model: AssetEndpointInformationModel,
        where: endpointFilter,
        attributes: [
          "os_family",
          "os_name",
          "os_install_version",
          "remediation_required_status",
          "remediation_required_infection_count",
          "reboot_required_status",
          "reboot_required_reasons_count",
          "suspicious_activity_status",
          "suspicious_activity_count",
          "isolation_status",
          "isolation_process_status",
          "isolation_network_status",
          "isolation_desktop_status",
          "scan_needed_status",
          "scan_needed_job_status",
          "scan_needed_last_seen_at",
          "last_seen_at",
          "last_user",
          "risk_score",
        ],
        required: true,
      },
    ];

    const endpointCount = await assetSQLModel.findAndCountAll({
        where: filterObj,
        include: includes,
      }).then((resp) => resp.rows.length);

    const CompaniesPeerScores = await CompaniesPeerScoreHistoryModel.findAll({
      where: {
        industry_type: userCompany.industry_type,
      },
      limit: 7,
      order: [["createdAt", "DESC"]],
    });
    const CompanyScores = await companyScoreHistoryModel.findAll({
      where: {
        company_id,
      },
      limit: 7,
      order: [["createdAt", "DESC"]],
    });
    const assetsAtRisk = await assetSQLModel
      .findAndCountAll({
        where: {
          company_id,
          "$asset_score.risk_score$": { [Op.lte]: 700 },
        },
        include: [
          { ...SourceValidation },
          {
            model: AssetScoreSQLModel,
            as: "asset_score",
          },
        ],
      })
      .then((resp) => resp.rows.length);

    const CompaniesAverageScores =
      await CompaniesAverageScoreHistoryModel.findAll({
        limit: 7,
        order: [["createdAt", "DESC"]],
      });
    const unknownAssets = await assetSQLModel
      .findAndCountAll({
        where: { company_id, asset_sub_type: "unknown" },
        include: [{ ...SourceValidation }],
      })
      .then((resp) => resp.rows.length);
    const totalAssetsCount = await assetSQLModel
      .findAndCountAll({
        where: {
          company_id,
        },
        include: [{ ...SourceValidation }],
      })
      .then((resp) => resp.rows.length);
    const responseData = {
      endpointCount,
      CompaniesPeerScores,
      unknownAssets,
      assetsAtRisk,
      CompanyScores,
      CompaniesAverageScores,
      companyAvgScore: userCompany.company_score,
      totalAssetsCount,
      patching: {
        patchingAvailable: false,
        updatedAssetsCount: 0,
        AssetNeedAttention: 0,
        assetswithoutPatch: 0,
        totalPatchingAssetsCount: 0,
        needingAttention: 0,
      },
      endpoint: {
        endpointAvailable: false,
        totalDetections: 0,
        totalSuspiciousActivity: 0,
        restartRequiredAssetsCount: 0,
        remediationRequiredAssetsCount: 0,
        scanNeededAssetsCount: 0,
        endpointIsolatedAssetsCount: 0,
      },
    };

    /* ******** patching data ******* */
    if (integrationSupported.includes(integrationCategoryType.patching)) {
      responseData.patching.patchingAvailable = true;

      const assetIds = await assetSQLModel
        .findAll({
          where: {
            company_id,
            asset_type: "non-network",
          },
          col: "id",
          include: [
            {
              model: assetSourcesModel,
              required: true,
              include: [
                {
                  model: IntegrationModel,
                  where: {
                    integration_category_type: { [Op.in]: ["Patching"] }
                  },
                  required: true
                }
              ]
            },
            { ...SourceValidation }
          ]
        }).then((assetsData) => assetsData.map((asset) => asset.id));

      responseData.patching.totalPatchingAssetsCount =
        await totalPatchingAssetsCountService(
          {
            company_id,
            asset_type: "non-network",
            id: { [Op.in]: assetIds },
          },
          SourceValidation
        );

      responseData.patching.assetswithoutPatch =
        await assetswithoutPatchService(
          {
            company_id,
            asset_type: "non-network",
            id: { [Op.notIn]: assetIds },
          },
          SourceValidation
        );

      responseData.patching.updatedAssetsCount =
        await updatedPatchingAssetsCountService(
          {
            company_id,
            asset_type: "non-network",
          },
          SourceValidation
        );
    }
    if (integrationSupported.includes(integrationCategoryType.endpoint)) {
      const endpointIntegrationIds = await getCompanyIntegrationIds(
        company_id,
        integrationCategoryType.endpoint
      );
      responseData.endpoint.endpointAvailable = true;
      responseData.endpoint.totalDetections = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: assetSourcesModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
              },
              required: true,
            },
            {
              model: endpointDetectionsModel,
              attributes: ["id"],
              required: true,
            },
          ],
        })
        .then((resp) => ({ count: resp.count, assetsCount: resp.rows.length }));
      responseData.endpoint.totalSuspiciousActivity = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: assetSourcesModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
              },
              required: true,
            },
            {
              model: endpointSuspiciousActivityModel,
              attributes: [],
              required: true,
            },
          ],
        })
        .then((resp) => ({ count: resp.count, assetsCount: resp.rows.length }));
      responseData.endpoint.restartRequiredAssetsCount = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: AssetEndpointInformationModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
                reboot_required_status: true,
              },
              required: true,
            },
          ],
        })
        .then((resp) => resp.rows.length);
      responseData.endpoint.remediationRequiredAssetsCount = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: AssetEndpointInformationModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
                remediation_required_status: true,
              },
              required: true,
            },
          ],
        })
        .then((resp) => resp.rows.length);
      responseData.endpoint.scanNeededAssetsCount = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: AssetEndpointInformationModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
                scan_needed_status: true,
              },
              required: true,
            },
          ],
        })
        .then((resp) => resp.rows.length);
      responseData.endpoint.endpointIsolatedAssetsCount = await assetSQLModel
        .findAndCountAll({
          where: { company_id },
          include: [
            {
              model: AssetEndpointInformationModel,
              where: {
                integration_id: { [Op.in]: endpointIntegrationIds },
                isolation_status: true,
              },
              required: true,
            },
          ],
        })
        .then((resp) => resp.rows.length);
    }
    res.status(200).json({ ...responseData });
  } catch (err) {
    errorHandler(err);
    res.status(503).json(err.message);
  }
};
export const patchingAssetsOverview = async (req, res) => {
  try {
    const { user } = req;
    const totalCount = await totalAssetCountService({
      company_id: user.company_id,
      asset_type: "non-network",
    });

    const totalPachingAssetsCount = await totalPatchingAssetsCountService({
      company_id: user.company_id,
      asset_type: "non-network",
    });
    const assetswithoutPatch = await assetswithoutPatchService({
      company_id: user.company_id,
      asset_type: "non-network",
    });

    const updatedAssetsCount = await updatedPatchingAssetsCountService({
      company_id: user.company_id,
      asset_type: "non-network",
    });

    res.status(200).json({
      updatedAssetsCount,
      AssetNeedAttention: 0,
      assetswithoutPatch,
      totalPachingAssetsCount,
      needingAttention: 0,
    });
  } catch (err) {
    errorHandler(err);
    res.status(503).json(err.message);
  }
};

export const scanAutomoxAsset = async (req, res) => {
  try {
    const { user } = req;
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Scan Device",
      company_id: user.company_id,
    };
    const { id } = req.params;
    const assetInfo = await assetSourcesModel.findOne({
      where: { asset_id: id, sources_type: integrationsNames.AUTOMOX },
    });
    if (assetInfo) {
      const company = await getCompanyWithIntegtation(
        user.company_id,
        "automox"
      );
      const url = `servers/${assetInfo.device_id}/queues?o=${company.integrations?.integration_values?.organization_id}&command_type_name=GetOS`;
      await automoxAPI
        .post(url)
        .then(async (response) => {
          // await automoxDeviceInformationSQLModel.update({last_scan_time:new Date()}, {
          //     where: {
          //     id: assetInfo.id
          //     },
          // });

          // Event Logs Handler
          const eventLogs = await addEventLog(
            { ...clientDetails, user_id: null },
            scanDevice.status.scanDeviceSuccessfully.code,
            null
          );

          res.status(200).json({ message: "success" });
        })
        .catch(async (error) => {
          console.log("error", error);
          // Event Logs Handler
          const eventLogs = await addEventLog(
            { ...clientDetails, user_id: null },
            scanDevice.status.scanDeviceFailed.code,
            null
          );
          res.status(400).json({ error, massage: error.message });
        });
    }
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, massage: err.message });
  }
};

export const restartAutomoxAsset = async (req, res) => {
  try {
    const { user } = req;
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Restart Device",
      company_id: user.company_id,
    };
    const { id } = req.params;
    const assetInfo = await assetSourcesModel.findOne({
      where: { asset_id: id, sources_type: integrationsNames.AUTOMOX },
    });
    const company = await getCompanyWithIntegtation(user.company_id, "automox");
    const url = `servers/${assetInfo.device_id}/queues?o=${company.integrations?.integration_values?.organization_id}&command_type_name=Reboot`;
    await automoxAPI
      .post(url)
      .then(async (response) => {
        // Event Logs Handler
        const eventLogs = await addEventLog(
          { ...clientDetails, user_id: null },
          restartDevice.status.restartDeviceSuccessfully.code,
          null
        );
        res.status(200).json({ message: "success" });
      })
      .catch(async (error) => {
        console.log("error", error);
        // Event Logs Handler
        const eventLogs = await addEventLog(
          { ...clientDetails, user_id: null },
          restartDevice.status.restartDeviceFailed.code,
          null
        );
        res.status(400).json({ error, message: error.message });
      });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: err.message });
  }
};
