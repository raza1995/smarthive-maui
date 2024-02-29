import { Op, QueryTypes } from "sequelize";
import HttpStatus from "http-status-codes";
import {
  integrationCategoryType,
  integrationsNames,
} from "../../utils/constants";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import assetSQLModel from "../Assets/assets.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import sequelize from "../db";
import endpointDetectionsModel from "../EndpointsDetections/endpointsDetections.model";
import endpointSuspiciousActivityModel from "../EndpointsSuspiciousActivity/endpointSuspiciousActivity.model";
import IntegrationModel from "../Integration/integration.model";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import { findUserOAuthId } from "../Users/users.service";
import AssetEndpointInformationModel from "./assetEndpointInformation.model";
import { getAssetEndpointInfoFormMalwareBytes } from "./AssetEndpointsIntegrationsServices/MalwareBytesEndpoint.service";
import endpointQuarantineModel from "../EndpointsQuaratines/endpointQuarantines.model";
import endpointEventModel from "../endpointEvent/endpointEvent.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import { getCompanyAssetTagsByFilter } from "../AssetTags/assetTags.service";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import {
  endPointOverview,
  GetEndpointAsset,
  getEndpointAssetList,
} from "../Logs/ActivitiesType/EndpointActivityType";
import { CrowdStrikeEndpointInfo } from "./AssetEndpointsIntegrationsServices/CrowdStrikeEndpoint.service";
import { SentinelOneEndpointInfo } from "./AssetEndpointsIntegrationsServices/SentinelOneEndpoint.service";
import { errorHandler } from "../../utils/errorHandler";
import { getAssetEndpointInfoFormMicrosoft } from "./AssetEndpointsIntegrationsServices/MicrosoftEndpoint.service";
import { getAssetEndpointInfoFromAuvik } from "./AssetEndpointsIntegrationsServices/AuvikEndpoint.service";

const createAssetEndpointsInfo = async (asset, source) => {
  switch (source.sources_type) {
    case integrationsNames.MALWAREBYTES:
      await getAssetEndpointInfoFormMalwareBytes(asset, source);
      break;
    case integrationsNames.MICROSOFT:
      await getAssetEndpointInfoFormMicrosoft(asset, source);
      break;
    case integrationsNames.CROWDSTRIKE:
      await CrowdStrikeEndpointInfo(asset, source);
      break;
    case integrationsNames.SENTINELONE:
      await SentinelOneEndpointInfo(asset, source);
      break;
    case integrationsNames.AUVIK:
      await getAssetEndpointInfoFromAuvik(asset, source);
      break;
    default:
    // code block
  }
};

/* ******************************************* Endpoint overview api controller ****************************** */
export const endpointAssetsOverview = async (req, res) => {
  const { user } = req;
  const clientDetails = {
    id: user.id,
    email: user.email,
    ipAddress: req.socket.remoteAddress,
    process: "Get Endpoint Overview Data",
    company_id: user.company_id,
  };
  try {
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.endpoint
    );
    const filterObj = { company_id: user.company_id };
    const totalEndpoints = await assetSQLModel.findAndCountAll({
      where: filterObj,
      include: [
        {
          model: assetSourcesModel,
          where: {
            integration_id: { [Op.in]: integrationIds },
          },

          required: true,
        },
      ],
    });
    const totalDetections = await assetSQLModel
      .findAndCountAll({
        where: { company_id: user.company_id },
        include: [
          {
            model: assetSourcesModel,

            include: [
              {
                model: IntegrationModel,
                where: {
                  integration_category_type: integrationCategoryType.endpoint,
                },
                required: true,
              },
            ],
          },
          {
            model: endpointDetectionsModel,
            attributes: ["id"],
            required: true,
          },
        ],
      })
      .then((resp) => resp.rows.length);
    const totalSuspiciousActivity = await assetSQLModel
      .findAndCountAll({
        where: { company_id: user.company_id },
        include: [
          {
            model: assetSourcesModel,
            where: {
              integration_id: { [Op.in]: integrationIds },
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
      .then((resp) => resp.rows.length);
    const osFiltersOptions = await sequelize.query(
      `SELECT DISTINCT ${`os_name`},os_family FROM ${`asset_endpoint_informations`}  WHERE ${`company_id`} = '${
        user.company_id
      }'`,
      { type: QueryTypes.SELECT }
    );

    res.status(HttpStatus.OK).json({
      osFiltersOptions,
      totalEndpoints: totalEndpoints.rows?.length,
      totalDetections,
      totalSuspiciousActivity,
    });
    await addEventLog(
      { ...clientDetails, user_id: null },
      endPointOverview.status.getEndpointOverviewSuccess.code
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    errorHandler(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
    await addEventLog(
      { ...clientDetails, user_id: null },
      endPointOverview.status.getEndpointOverviewFailed.code,
      {},
      err.message
    );
  }
};

/* ******************************************* Endpoint Listing api controller ****************************** */

export const endpointAssetList = async (req, res) => {
  const { user } = req;
  const clientDetails = {
    id: user.id,
    email: user.email,
    ipAddress: req.socket.remoteAddress,
    process: "Get Endpoint Asset List",
    company_id: user.company_id,
  };
  try {
    const filterObj = { company_id: user.company_id };
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.endpoint
    );

    const endpointFilter = { integration_id: { [Op.in]: integrationIds } };
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query.filter || "{}");
    // name filter
    if (filter?.name) {
      filterObj.asset_name = { [Op.like]: `%${filter?.name}%` };
    }
    if (filter?.os?.length > 0) {
      endpointFilter.os_name = { [Op.in]: filter?.os };
    }
    if (filter?.status) {
      endpointFilter.status = {
        [Op.like]: `%${filter?.status}%`,
      };
    }
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
      {
        model: endpointDetectionsModel,
        attributes: [],
        required:
          filter?.activities?.length > 0
            ? filter?.activities.includes("detections")
            : false,
      },
      {
        model: endpointQuarantineModel,
        attributes: [],
        required:
          filter?.activities?.length > 0
            ? filter?.activities.includes("quarantine")
            : false,
      },
      {
        model: endpointSuspiciousActivityModel,
        attributes: [],
        required:
          filter?.activities?.length > 0
            ? filter?.activities.includes("suspicious_activity")
            : false,
      },
      {
        model: endpointEventModel,
        attributes: [],
        required:
          filter?.activities?.length > 0
            ? filter?.activities.includes("events")
            : false,
      },
    ];

    const totalCount = await assetSQLModel.findAndCountAll({
      where: filterObj,
      include: includes,
    });
    const tableData = await assetSQLModel.findAll({
      where: filterObj,
      include: includes,
      offset: (page - 1) * size,
      limit: +size,
    });
    const assetIds = [];
    const tableDataArray = tableData.map((item) => {
      const endpointInfo = item?.asset_endpoint_informations?.[0];
      item = JSON.parse(JSON.stringify(item));
      assetIds.push(item.id);
      return {
        id: item.id,
        asset_name: item.asset_name,
        last_seen: endpointInfo?.last_seen_at,
        ...endpointInfo.dataValues,
      };
    });
    const totalDetections = await endpointDetectionsModel.count({
      where: { asset_id: { [Op.in]: assetIds } },
    });
    const totalSuspiciousActivity = await endpointSuspiciousActivityModel.count(
      {
        where: { asset_id: { [Op.in]: assetIds } },
      }
    );
    res.status(HttpStatus.OK).json({
      valid: true,
      message: "",
      page,
      size,
      totalCount: totalCount.rows?.length,
      tableData: tableDataArray,
      totalDetections,
      totalSuspiciousActivity,
    });
    await addEventLog(
      { ...clientDetails, user_id: null },
      getEndpointAssetList.status.getEndpointAssetListSuccess.code
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    errorHandler(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
    await addEventLog(
      { ...clientDetails, user_id: null },
      getEndpointAssetList.status.getEndpointAssetListFailed.code,
      {},
      err.message
    );
  }
};
export const getEndpointAsset = async (req, res) => {
  const { user } = req;
  const clientDetails = {
    id: user.id,
    email: user.email,
    ipAddress: req.socket.remoteAddress,
    process: "Get Endpoint Asset",
    company_id: user.company_id,
  };
  try {
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.endpoint
    );
    const endpointFilter = { integration_id: { [Op.in]: integrationIds } };
    const { id } = req.params;
    const filterObj = { company_id: user.company_id, id };

    const data = await assetSQLModel.findOne({
      where: filterObj,
      include: [
        {
          model: AssetEndpointInformationModel,
          where: endpointFilter,
          include: [
            {
              model: IntegrationModel,
              attributes: ["integration_name"],
            },
          ],
          attributes: [
            "os_family",
            "os_name",
            "os_install_version",
            "last_seen_at",
            "last_user",
            "status",
          ],
          required: true,
        },
        {
          model: AssetScoreSQLModel,
        },
        {
          model: AssetDetailModel,
        },
      ],
      attributes: [
        "asset_name",
        "id",
        "company_id",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM endpoints_detections WHERE endpoints_detections.company_id = '${user.company_id}' && endpoints_detections.asset_id=asset.id )`
          ),
          "detections",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM endpoints_quarantines WHERE endpoints_quarantines.company_id = '${user.company_id}' && endpoints_quarantines.asset_id=asset.id )`
          ),
          "quarantines",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM endpoints_suspicious_activities WHERE endpoints_suspicious_activities.company_id = '${user.company_id}' && endpoints_suspicious_activities.asset_id=asset.id )`
          ),
          "suspicious_activities",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM endpoint_events WHERE endpoint_events.company_id = '${user.company_id}' && endpoint_events.asset_id=asset.id )`
          ),
          "event",
        ],
      ],
    });
    const item = JSON.parse(JSON.stringify(data));
    const endpointInfo = item?.asset_endpoint_informations?.[0];
    const tags = await getCompanyAssetTagsByFilter({
      asset_id: id,
    });
    const dataObj = {
      asset_name: item.asset_name,
      last_user: endpointInfo.last_user,
      os_family: endpointInfo.os_family,
      status: endpointInfo.status,
      last_seen: endpointInfo.last_seen_at,
      integration: endpointInfo.integration.integration_name,
      scores: item.asset_score,
      riskScore: item.asset_score.endpoint_score,
      tags,
      detections: item.detections,
      quarantines: item.quarantines,
      event: item.event,
      suspicious_activities: item.suspicious_activities,
      endpoint_protection_status: endpointInfo.status || "",
    };

    res.status(HttpStatus.OK).json({
      ...dataObj,
    });
    await addEventLog(
      { ...clientDetails, user_id: null },
      GetEndpointAsset.status.getEndpointAssetSuccess.code
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    errorHandler(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });

    await addEventLog(
      { ...clientDetails, user_id: null },
      GetEndpointAsset.status.getEndpointAssetFailed.code,
      {},
      err.message
    );
  }
};
export default createAssetEndpointsInfo;
