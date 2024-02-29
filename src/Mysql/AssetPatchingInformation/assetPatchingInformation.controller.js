import { StatusCodes } from "http-status-codes";
import sequelize, { Op, Sequelize } from "sequelize";
import { integrationsNames } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import { applyPatchesByAssetId } from "../AssetPatches/assetPatch.service";
import assetSQLModel from "../Assets/assets.model";
// eslint-disable-next-line import/no-cycle
import { getSourceValidation } from "../Assets/assets.service";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import assetSoftwareSQLModel from "../AssetSoftwares/assetSoftware.model";
import { getCompanyAssetTagsByFilter } from "../AssetTags/assetTags.service";
import GroupAssetsSQLModel from "../GroupsAssets/GroupsAsset.model";
import { GetPatchingAssetsFilters } from "../Logs/ActivitiesType/AssetPatchingInformationActivityType";
import {
  getAssetDetail,
  getResilenceDashboard
} from "../Logs/ActivitiesType/userActivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";

import patchSQLModel from "../Patch/patch.model";
import patchingtGroupsSQLModel from "../PatchingGroups/patchingGroups.model";
import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import PolicyGroupsSQLModel from "../PolicyGroups/PolicyGroups.model";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";
import { findUserOAuthId } from "../Users/users.service";
import AssetPatchingInformationModel from "./assetPatchingInformation.model";
import {
  assetswithoutPatchService,
  totalPatchingAssetsCountService,
  updatedPatchingAssetsCountService
} from "./assetPatchingInformation.service";
import saveAssetPatchingIfoFromAutomox from "./AssetsPatchingIntegrationsServices/AutomoxPatching.service";
import saveAssetPatchingInfoFromMalwareBytes from "./AssetsPatchingIntegrationsServices/MalwareBytesPatching.service";
import saveAssetPatchingInfoFromAuvik from "./AssetsPatchingIntegrationsServices/AuvikPatching.service";
import assetSourcesModel from "../AssetSources/assetSources.model";
import IntegrationModel from "../Integration/integration.model";

export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
export const patchingAssets = async (req, res) => {
  const { user } = req;
  try {
    const SourceValidation = await getSourceValidation(user.company_id, []);
    const companyNonNetworkDeviceQuery = {
      company_id: user.company_id,
      asset_type: "non-network"
    };
    const filterObj = {
      ...companyNonNetworkDeviceQuery
    };
    const patchingInfoFilter = {};
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query.filter);
    console.log("filter =========== ", filter)
    // Connected Column
    if (filter?.connected) {
      switch (filter?.connected) {
        case "connect":
          patchingInfoFilter.connected = true;
          break;
        case "disconnect":
          patchingInfoFilter.connected = false;
          break;
        default:
        // code block
      }
    }

    if (filter?.status) {
      switch (filter?.status) {
        case "up_to_date":
          patchingInfoFilter.all_patch_installed = true;
          break;
        case "compliant":
          patchingInfoFilter.policy_status = "compliant";
          break;
        default:
        // code block
      }
    }
    // Asset Name
    if (filter?.asset_name) {
      filterObj.asset_name = { [Op.like]: `%${filter?.asset_name}%` };
    }
    if (filter?.severityStatus?.length > 0) {
      patchingInfoFilter.patch_severity = { [Op.in]: filter?.severityStatus };
    }

    // Last Logged in User Column
    if (filter?.last_logged_in_user) {
      patchingInfoFilter.last_logged_in_user = {
        [Op.like]: `%${filter?.last_logged_in_user}%`
      };
    }

    // Tags
    // if (filter?.tags) {

    //   // filterObj["$asset_detail.tags$"] = { [Op.like]: [`%${filter?.tags}%`] };
    // }

    // IP address
    if (filter?.ipaddress) {
      filterObj.ipaddress = { [Op.like]: [`%${filter?.ipaddress}%`] };
    }

    // Serial Number Column
    if (filter?.serial_number) {
      patchingInfoFilter.serial_number = {
        [Op.like]: `%${filter?.serial_number}%`
      };
    }

    // OS
    if (filter?.os && filter?.os !== undefined && filter?.os !== null) {
      patchingInfoFilter[Op.or] = [
        { os_family: { [Op.like]: `%${filter?.os}%` } },
        { os_name: { [Op.like]: `%${filter?.os}%` } }
      ];
    }

    const groupAssetFilterObj = {};
    const policyGroupsFilterObj = {};
    let groupAssetFilterObjRequired = false;
    const policyGroupsFilterObjRequired = false;
    // Group
    if (
      filter?.groups &&
      filter?.groups !== undefined &&
      filter?.groups !== null
    ) {
      if (filter?.groups.length > 0 && filter?.groups[0] !== undefined) {
        groupAssetFilterObj.patching_group_id = { [Op.in]: filter?.groups };
        groupAssetFilterObjRequired = true;
      }
    }

    // Policy
    if (
      filter?.policies &&
      filter?.policies !== undefined &&
      filter?.policies !== null
    ) {
      if (filter?.policies.length > 0 && filter?.policies[0] !== undefined) {
        const policyGroups = await PolicyGroupsSQLModel.findAll({
          where: { patching_policy_id: { [Op.in]: [filter?.policies] } },
          attributes: ["patching_group_id"]
        });
        const policyGroupsArray = [];
        policyGroups.forEach((policyItem) => {
          policyGroupsArray.push(policyItem.patching_group_id);
        });
        const unique = policyGroupsArray.filter(onlyUnique);
        groupAssetFilterObj.patching_group_id = { [Op.in]: unique };
        groupAssetFilterObjRequired = true;
      }
    }

    if (filter?.groups_id?.length > 0) {
      groupAssetFilterObjRequired = true;
      groupAssetFilterObj.patching_group_id = filter.groups_id?.[0];
    }

    // Selected Asset Ids to Not come in array

    if (filter?.selected_asset_ids?.length > 0) {
      filterObj.id = { [Op.notIn]: filter?.selected_asset_ids };
    }

    const riskFilterObj = {};
    let riskFilterObjRequired = false;
    if (filter?.severity && filter?.severity.length > 0) {
      const sc = [];
      if (filter?.severity?.includes("high")) {
        sc.push({ [Op.lte]: 540 });
      }

      if (filter?.severity?.includes("medium")) {
        sc.push({ [Op.and]: [{ [Op.lte]: 700 }, { [Op.gte]: 540 }] });
      }
      if (filter?.severity?.includes("low")) {
        sc.push({ [Op.gte]: 700 });
      }
      // riskFilterObj.risk_score = { [Op.lte]: 280 };
      patchingInfoFilter.risk_score = { 
        [Op.or]: sc,
      };
      riskFilterObjRequired = true;
    }

    const assetsAtHighRisk = await assetSQLModel
      .findAndCountAll({
        where: {
          ...companyNonNetworkDeviceQuery,
          // "$asset_score.risk_score$": { [Op.lte]: 540 }
          "$asset_patching_informations.risk_score$": { [Op.lte]: 540 }
        },
        include: [
          AssetScoreSQLModel,
          AssetPatchingInformationModel,
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
      })
      .then((resp) => resp.rows.length);
    const assetsAtMediumRisk = await assetSQLModel
      .findAndCountAll({
        where: {
          ...companyNonNetworkDeviceQuery,
          // [Op.and]: [
          //   { "$asset_score.risk_score$": { [Op.gt]: 540 } },
          //   { "$asset_score.risk_score$": { [Op.lte]: 700 } }
          // ]
          [Op.and]: [
            { "$asset_patching_informations.risk_score$": { [Op.gt]: 540 } },
            { "$asset_patching_informations.risk_score$": { [Op.lte]: 700 } }
          ]
        },
        include: [
          AssetScoreSQLModel, 
          AssetPatchingInformationModel,
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
      })
      .then((resp) => resp.rows.length);
    const assetsAtLowRisk = await assetSQLModel
      .findAndCountAll({
        where: {
          ...companyNonNetworkDeviceQuery,
          // "$asset_score.risk_score$": { [Op.gt]: 700 }
          "$asset_patching_informations.risk_score$": { [Op.gt]: 700 }
        },
        include: [
          AssetScoreSQLModel, 
          AssetPatchingInformationModel,
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
      })
      .then((resp) => resp.rows.length);
    const totalCount = await assetSQLModel
      .findAndCountAll({
        where: filterObj,
        include: [
          {
            model: AssetPatchingInformationModel,
            where: patchingInfoFilter
          },
          {
            model: AssetDetailModel,
            required: filter?.tags
          },
          {
            model: GroupAssetsSQLModel,
            where: groupAssetFilterObj,
            required: groupAssetFilterObjRequired,
            attributes: ["id", "patching_group_id"],
            include: [
              {
                model: patchingtGroupsSQLModel,
                include: [
                  {
                    model: PolicyGroupsSQLModel
                  }
                ]
              }
            ]
          },
          {
            ...SourceValidation
          }
        ]
      })
      .then((resp) => resp.rows.length);
    const tableData = await assetSQLModel.findAll({
      where: filterObj,
      include: [
        {
          model: AssetPatchingInformationModel,
          where: patchingInfoFilter
        },
        // {
        //   model: AssetEndpointInformationModel,
        //   // where: patchingInfoFilter,
        // },
        {
          model: GroupAssetsSQLModel,
          where: groupAssetFilterObj,
          required: groupAssetFilterObjRequired,
          attributes: ["id", "patching_group_id"],
          include: [
            {
              model: patchingtGroupsSQLModel,
              include: [
                {
                  model: PolicyGroupsSQLModel
                }
              ]
            }
          ]
        },
        {
          model: AssetScoreSQLModel
        },
        {
          model: AssetDetailModel,
          required: filter?.tags
        },
        {
          ...SourceValidation
        }
      ],
      attributes: [
        "id",
        "asset_name",
        [
          sequelize.literal(
            `(SELECT  COUNT(*) FROM group_assets WHERE (group_assets.patching_group_id = "${filter.groups_id?.[0]}")  && group_assets.asset_id=asset.id)`
          ),
          "group_assigned"
        ]
      ],
      order: [
        // ["assetsCountss", "ASC"],
        [sequelize.literal("group_assigned"), "DESC"]
      ],
      offset: (page - 1) * size,
      limit: +size
    });

    const assetIds = await assetSQLModel
      .findAll({
        where: companyNonNetworkDeviceQuery,
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

    const totalPatchingAssetsCount = await totalPatchingAssetsCountService(
      {
        ...companyNonNetworkDeviceQuery,
        id: { [Op.in]: assetIds },
      },
      SourceValidation
    );

    const assetswithoutPatch = await assetswithoutPatchService(
      {
        ...companyNonNetworkDeviceQuery,
        id: { [Op.notIn]: assetIds },
      },
      SourceValidation
    );

    const updatedAssetsCount = await updatedPatchingAssetsCountService(
      {
        ...companyNonNetworkDeviceQuery
      },
      SourceValidation
    );

    const tableArray =
      tableData.length > 0
        ? await Promise.all(
            tableData.map(async (patchingAsset) => {
              const patchInfo = patchingAsset?.asset_patching_informations[0];
              // if (patchInfo === undefined) {
              //   patchInfo = patchingAsset?.asset_endpoint_informations[0];
              // }
              const tags = await getCompanyAssetTagsByFilter({
                asset_id: patchingAsset.id
              });
              return {
                id: patchingAsset.id,
                asset_name: patchingAsset.asset_name,
                group_assets: patchingAsset.group_assets,
                group_assigned: patchingAsset.group_assigned,
                agent_status: patchInfo?.agent_status || false,
                all_patch_installed: patchInfo?.all_patch_installed || false,
                compliant: patchInfo?.compliant || false,
                connected: patchInfo?.connected || false,
                cpu: patchInfo?.cpu || "",
                device_status: patchInfo?.device_status || patchInfo?.status,
                display_name: patchInfo?.display_name,
                exception: patchInfo?.exception || false,
                is_compatible: patchInfo?.is_compatible || false,
                is_uptoDate: patchInfo?.is_uptoDate || false,
                last_logged_in_user:
                  patchInfo?.last_logged_in_user || patchInfo?.last_user,
                os_name: patchInfo?.os_name,
                os_family: patchInfo?.os_family,
                os_version:
                  patchInfo?.os_version || patchInfo?.os_current_version,
                patch_severity: patchInfo?.patch_severity || "",
                policy_status: patchInfo?.policy_status || "",
                risk_score: patchInfo?.risk_score,
                volume: patchInfo?.volume || "",
                tags: tags || []
              };
            })
          )
        : [];

    const totalPage =
      tableData.length % size > 0
        ? Math.floor(tableData.length / size) + 1
        : Math.floor(tableData.length / size);

    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Resilence Patching Assets",
      company_id: user.company_id
    };
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getResilenceDashboard.status.resilenceDashboardGetSuccessfully.code,
      null
    );

    res.status(200).json({
      valid: true,
      message: "",
      page,
      size,
      totalCount: totalCount || 0,
      updatedAssetsCount: updatedAssetsCount || 0,
      AssetNeedAttention: 0,
      assetswithoutPatch: assetswithoutPatch || 0,
      totalPatchingAssetsCount: totalPatchingAssetsCount || 0,
      tableData: tableArray,
      assetsAtHighRisk: assetsAtHighRisk || 0,
      assetsAtMediumRisk: assetsAtMediumRisk || 0,
      assetsAtLowRisk: assetsAtLowRisk || 0,
      needingAttention: 0
    });
  } catch (err) {
    errorHandler(err);
    res.status(503).json({ message: err.message, error: err });
  }
};
export const getPatchingAssetsFilters = async (req, res) => {
  try {
    const { user } = req;
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Patching Assets Filters",
      company_id: user.company_id
    };

    const filterObj = { company_id: user.company_id };
    console.log("filterObj", filterObj);
    const policies = await patchingPoliciesSQLModel.findAll({
      where: { company_id: user.company_id },
      attributes: ["id", "name"]
    });
    const groups = await patchingtGroupsSQLModel.findAll({
      where: { company_id: user.company_id },
      attributes: ["id", "name"]
    });

    res.status(200).json({
      valid: true,
      message: "",
      policies,
      groups
    });
    await addEventLog(
      { ...clientDetails, user_id: null },
      GetPatchingAssetsFilters.status.getPatchingAssetsFiltersSuccess.code
    );
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, massage: err.message });
  }
};
export const createAssetPatchingInfo = async (asset, source) => {
  console.log(source.sources_type);
  switch (source.sources_type) {
    case integrationsNames.AUTOMOX:
      await saveAssetPatchingIfoFromAutomox(asset, source);
      break;
    case integrationsNames.MALWAREBYTES:
      await saveAssetPatchingInfoFromMalwareBytes(asset, source);
      break;
    // case integrationsNames.AUVIK:
    //   await saveAssetPatchingInfoFromAuvik(asset, source);
    // break;
    default:
    // code block
  }
};

export const getPatchingAssetById = async (req, res) => {
  try {
    const { user } = req;
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get patching asset",
      company_id: user.company_id
    };

    const { id } = req.params;
    const asset = await assetSQLModel.findOne({
      where: { id },
      include: [
        {
          model: AssetPatchingInformationModel,
          attributes: [
            "integration_id",
            "display_name",
            "group",
            "server_group_id",
            "serial_number",
            "os_family",
            "os_name",
            "os_version",
            "risk_score",
            "status",
            "device_status",
            "agent_status",
            "policy_status",
            "connected",
            "compliant",
            "exception",
            "is_compatible",
            "cpu",
            "ram",
            "volume",
            "last_logged_in_user",
            "model",
            "last_seen",
            "last_scan_time",
            "device_require_reboot",
            "next_patch_window",
            "is_uptoDate",
            "number_of_patch_available",
            "patch_severity",
            "patching_available_from",
            "all_patch_installed"
          ]
        },
        {
          model: AssetEndpointInformationModel
        },
        {
          model: AssetDetailModel,
          attributes: ["custom_name", "custom_location"]
        }
      ]
    });

    const tags = await getCompanyAssetTagsByFilter({
      asset_id: id
    });
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getAssetDetail.status.assetGetSuccessfully.code,
      null
    );
    const info = asset?.asset_patching_informations[0]?.dataValues || {};
    const detail = asset?.asset_detail?.dataValues || {};
    res.status(200).json({
      id: asset.id,
      company_id: asset.company_id,
      asset_name: asset.asset_name,
      ipaddress: asset.ipaddress,
      asset_type: asset.asset_type,
      asset_sub_type: asset.asset_sub_type,
      tags,
      ...info,
      ...detail
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, massage: err.message });
  }
};

export const patchSoftwareOfAsset = async (req, res) => {
  try {
    const { user } = req;
    const data = req.body;
    const assetPatches = await assetSoftwareSQLModel.findAll({
      where: {
        id: { [Op.in]: data.patches_ids }
      },
      include: [
        {
          model: softwareSQLModel
        },
        {
          model: softwarePackagesQLModel,
          include: [
            {
              model: patchSQLModel,
              required: true
            }
          ]
        }
      ],
      nest: true,
      raw: true
    });
    applyPatchesByAssetId(data.asset_id, assetPatches, {
      client_id: user?.id,
      client_email: user?.email,
      ipAddress: req.socket.remoteAddress,
      company_id: user.company_id,
      isSystemLog: true
    });
    res.status(StatusCodes.OK).json({ message: "Job assigned" });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, massage: err.message });
  }
};
