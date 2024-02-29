import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import assetRiskScoreImpactModel from "../AssetRiskScoreImpact/assetRiskScoreImpact.model";
// import AssetPropertySQLModel from "../AssetProperty/assetProperty.model";
import assetSQLModel from "../Assets/assets.model";
import {
  convertInPercentage,
  getAssetsByType,
  getSourceValidation,
  setAssetScoreName,
} from "../Assets/assets.service";
import AssetScoreLogsModel from "../AssetScoreLogs/assetScoreLogs.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import assetsCustomWeightageScoreModel from "../AssetsScoreManagements/assetsCustomWeightageScore/assetsCustomWeightageScore.model";
import assetsScoreWeightageModel from "../AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.model";
import { getCompanyAssetTagsByFilter } from "../AssetTags/assetTags.service";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";
import { getResilenceDashboard } from "../Logs/ActivitiesType/userActivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { sortAssetScores } from "../PrivilegeAccessScoreManagements/privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.controller";

import userService, { findUserOAuthId } from "../Users/users.service";
import { findRiskCostFactorByPriority } from "../RiskCostFactor/riskCostFactor.service";
import AssetLifecycleInformationModel from "../AssetLifecycleInformation/assetLifecycleInformation.model";
import AssetBackupInformationModel from "../AssetBackupInformation/assetBackupInformation.model";

export const getAssetByType = async (req, res) => {
  try {
    const { user } = req;
    // eslint-disable-next-line prefer-const
    let { page, size, sort } = req.query;
    // If the page is not applied in query
    if (!page) {
      // Make the Default value one
      page = 1;
    }
    let { company_id } = user;
    const { id } = req.params; // company id if gets
    if (id) {
      company_id = id;
    }
    if (!size) {
      size = 5;
    }
    //  We have to make it integer because
    // the query parameter passed is string
    const limit = parseInt(size, 10);

    const filterObj = {};
    filterObj.company_id = company_id;
    const asset = await getAssetsByType(filterObj);
    // const SourceValidation = await getSourceValidation(company_id, []);
    // const assetTypes = await assetSQLModel.findAll({
    //   include: [
    //     {
    //       model: AssetScoreSQLModel,
    //       attributes: [],
    //     },
    //     { ...SourceValidation },
    //   ],
    //   where: { company_id },
    //   attributes: [
    //     "asset_sub_type",
    //     [
    //       sequelize.fn("SUM", sequelize.col("asset_score.risk_score")),
    //       "totalScore",
    //     ],
    //     [
    //       sequelize.fn("COUNT", sequelize.col("asset_score.risk_score")),
    //       "totalAsset",
    //     ],
    //   ],
    //   group: "asset_sub_type",
    //   raw: true,
    // });

    // const asset = await Promise.all(
    //   assetTypes.map(async (item) => {
    //     const count = await assetSQLModel
    //       .findAndCountAll({
    //         where: {
    //           company_id,
    //           asset_sub_type: item.asset_sub_type,
    //         },
    //         include: [{ ...SourceValidation }],
    //       })
    //       .then((resp) => resp.rows.length);

    //     const deviceAtRisk = await assetSQLModel
    //       .findAndCountAll({
    //         where: {
    //           company_id,
    //           asset_sub_type: item.asset_sub_type,
    //           "$asset_score.risk_score$": { [Op.lt]: 700 },
    //         },
    //         include: [
    //           {
    //             model: AssetScoreSQLModel,
    //             as: "asset_score",
    //             required: true,
    //           },
    //           { ...SourceValidation },
    //         ],
    //       })
    //       .then((resp) => resp.rows.length);

    //     return {
    //       _id: item.asset_sub_type,
    //       deviceType: item.asset_sub_type,
    //       count,
    //       avgScore: Math.round(item.totalScore / item.totalAsset),
    //       deviceAtRisk: deviceAtRisk || 0,
    //     };
    //   })
    // );
    
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Resilence Dashboard",
      company_id: user.company_id,
    };
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getResilenceDashboard.status.resilenceDashboardGetSuccessfully.code,
      null
    );

    const totalPage =
      asset.length % size > 0
        ? Math.floor(asset.length / size) + 1
        : Math.floor(asset.length / size);
    if (page <= totalPage) {
      const data = asset.slice((page - 1) * size, (page - 1) * size + limit);
      // console.log('dataaaa', data)
      res.status(200).json({
        valid: true,
        message: "",
        page,
        size,
        totalPage,

        totalDevices: asset.length,
        data,
      });
    } else {
      res.status(200).json({
        valid: false,
        message: "no more data available ",
        page,
        totalPage,
        size,
      });
    }
  } catch (err) {
    errorHandler(err);
    res.status(503).json({ err, message: err.message });
  }
};

export const assertByRisk = async (req, res) => {
  try {
    // console.log(req)
    const { user } = req;
    // eslint-disable-next-line prefer-const
    let { page, size, sort } = req.body;
    let { device } = req.params;
    let skip = 0;
    // If the page is not applied in query
    if (!page) {
      // Make the Default value one
      page = 1;
    }

    if (!size) {
      size = 5;
    }

    let { company_id } = user;
    const { id } = req.params; // company id if gets
    if (id) {
      company_id = id;
    }

    // if (!total) {
    //   total = 5;
    // }

    if (!device) {
      device = "All";
    }

    const SourceValidation = await getSourceValidation(company_id, []);
    //  We have to make it integer because
    // the query parameter passed is string
    const limit = parseInt(size, 10);

    skip = page > 1 ? Math.ceil((page - 1) * size) : 0;
    const query =
      device === "All"
        ? {
            company_id,
            "$asset_score.risk_score$": { [Op.lt]: 700 },
          }
        : {
            company_id,
            "$asset_score.risk_score$": { [Op.lt]: 700 },
            asset_sub_type: device,
          };
    const totalAssets = await assetSQLModel
      .findAndCountAll({
        where: query,
        include: [AssetScoreSQLModel, SourceValidation],
      })
      .then((resp) => resp.rows.length);
    const totalPage =
      totalAssets % size > 0 || totalAssets === 0
        ? Math.floor(totalAssets / size) + 1
        : Math.floor(totalAssets / size);
    assetSQLModel
      .findAll({
        where: query,
        // attributes: ['company_id', "asset_sub_type", 'asset_name'],
        include: [
          SourceValidation,
          {
            model: AssetDetailModel,
          },
          {
            model: AssetScoreSQLModel,
            required: true,
          },
        ],
        offset: (page - 1) * size,
        limit,
      })
      .then((resp) =>
        Promise.all(
          resp.map(async (item) => {
            const riskItems = await assetRiskScoreImpactModel.findAll({
              where: {
                asset_id: item.id,
                source_risk_score: { [Op.lte]: 700 },
              },
              attributes: [
                "impact_by_source",
                "source_risk_score",
                "total_risk_score",
                "impact_score",
                "is_score_pure",
                "updatedAt",
              ],
              order: [
                ["is_score_pure", "DESC"],
                ["source_risk_score", "ASC"],
              ],
            });
            return {
              ...riskItems?.[0]?.dataValues,
              id: item.id,
              total_risk_score: item.asset_score.risk_score,
              asset_name: item.asset_name,
              asset_custom_name: item?.asset_detail?.custom_name,
              asset_sub_type: item.asset_sub_type,
              company_id: item.company_id,
            };
          })
        )
      )
      .then((products) => {
        if (page <= totalPage) {
          res.status(200).json({
            valid: true,
            message: "",
            page,
            size,
            totalPage,
            totalAssets,
            data: products,
          });
        } else {
          res.status(400).json({
            valid: false,
            message: "no more data available ",
            page,
            totalPage,
            size,
          });
        }
      })
      .catch((err) => {
        errorHandler(err);

        res.status(400).json({ valid: false, message: err.message });
      });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ valid: false, message: err.message });
  }
};

export const getAssetTableFilter = async (req, res) => {
  try {
    const deviceTypes = await assetSQLModel.findAll({
      attributes: [["asset_sub_type", "type"]],
      group: ["asset_sub_type"],
    });
    const locations = await AssetDetailModel.findAll({
      where: { custom_location: { [Op.not]: null } },
      attributes: [["custom_location", "value"]],
      group: ["custom_location"],
    })
      .then((resp) => resp)
      .catch((err) => {
        errorHandler(err);
      });
    const endpointsLocations = await AssetEndpointInformationModel.findAll({
      where: { location: { [Op.not]: null } },
      attributes: [["location", "value"]],
      group: ["location"],
    })
      .then((resp) => resp)
      .catch((err) => {
        errorHandler(err);
      });
    res.status(200).json({
      status: true,
      message: "Success",
      deviceTypes,
      locations: [...endpointsLocations, ...locations],
    });
  } catch (error) {
    res.status(503).json(error);
  }
};

export const assetById = async (req, res) => {
  try {
    const filter = { assetsType: ["network", "non-network"], riskScore: [] };
    const { id } = req.params;
    const loggedInUser = req.user;
    const user = await userService.findUserByEmail(loggedInUser.email);
    // console.log("user: ", user.company_id);
    assetSQLModel
      .findOne({
        where: { id },

        include: [
          {
            model: AssetScoreSQLModel,
            // attributes: ["risk_score", "updatedAt"],
          },
          {
            model: AssetDetailModel,
          },
          {
            model: AssetEndpointInformationModel,
            // attributes: ["risk_score", "updatedAt"],
          },
          {
            model: AssetPatchingInformationModel,
            // attributes: ["risk_score", "updatedAt"],
          },
          {
            model: AssetLifecycleInformationModel,
            // attributes: ["risk_score", "updatedAt"],
          },
          {
            model: AssetBackupInformationModel,
            attributes: ["risk_score"],
          },
          {
            model: assetsCustomWeightageScoreModel,
            attributes: ["risk_score", "pure_risk_score"],
            include: [
              {
                model: assetsScoreWeightageModel,
                attributes: ["name", "priority"],
              },
            ],
          },
          {
            model: AssetScoreLogsModel,
            attributes: ["id", "risk_score", "createdAt"],
            order: [["createdAt", "DESC"]],
            limit: 5,
          },
          {
            model: assetSourcesModel,
            // required: true,
            include: [
              {
                model: IntegrationModel,
                // required: true,
              },
            ],
          },
        ],
      })
      .then(async (product) => {
        const data = { ...product?.dataValues, attributes: {} };
        const assets_custom_weightage_scores = JSON.parse(
          JSON.stringify(product.assets_custom_weightage_scores)
        );
        const asset_scores = sortAssetScores(assets_custom_weightage_scores,data?.asset_score)

        data.asset_scores_logs = data?.asset_scores_logs?.reverse();
        delete data.asset_sources;
        const sources_type = [];
        const riskImpact = [];
        const riskImpacts = await assetRiskScoreImpactModel.findAll({
          where: {
            asset_id: product.id,
          },
          attributes: [
            "impact_by_source",
            "source_risk_score",
            "total_risk_score",
            "impact_score",
            "is_score_pure",
            "updatedAt",
          ],
          order: [
            ["is_score_pure", "DESC"],
            ["source_risk_score", "ASC"],
          ],
        });

        for (const source of riskImpacts) {
          if (source?.source_risk_score <= 700) {
            riskImpact.push(source);
          }
          if (
            source?.impact_by_source === "patching_score" &&
            source?.is_score_pure === true
          ) {
            sources_type.push("Patching");
          } else if (
            source?.impact_by_source === "endpoint_score" &&
            source?.is_score_pure === true
          ) {
            sources_type.push("Endpoint");
          } else if (
            source?.impact_by_source === "lifecycle_score" &&
            source?.is_score_pure === true
          ) {
            sources_type.push("Lifecycle");
          } else if (
            source?.impact_by_source === "backup_score" &&
            source?.is_score_pure === true
          ) {
            sources_type.push("Backup");
          }
        }
        console.log("sources_type", sources_type);
        const patchingInfo = data?.asset_patching_informations?.[0];
        const endpointInfo = data?.asset_endpoint_informations?.[0];
        const lifecycleInfo = data?.asset_lifecycle_informations?.[0];
        // console.log("data ================ ", patchingInfo)
        const assetDetail = data?.asset_detail;
        data.sources_type = sources_type;
        const tags = await getCompanyAssetTagsByFilter({
          asset_id: id,
        });

        const filterObj = {};
        filterObj.asset_id = data.id;
        const riskCostFactorSelectedAssetData = await findRiskCostFactorByPriority(loggedInUser.company_id, filterObj);

        const asset_score = {
          backup_score: "N/A",
          lifecycle_score: "N/A",
          patching_score: "N/A",
          endpoint_score: "N/A",
          risk_score: 0,
        };
        if (data.asset_type === "non-network") {
          if (
            data?.asset_backup_informations?.[0] ||
            data?.asset_backup_informations?.risk_score
          ) {
            asset_score.backup_score = setAssetScoreName(
              data.asset_score?.backup_score
            );
          }
          if (
            data?.asset_patching_informations?.[0] ||
            data?.asset_patching_informations?.risk_score
          ) {
            asset_score.patching_score = setAssetScoreName(
              data.asset_score?.patching_score
            );
          }
          if (
            data?.asset_endpoint_informations?.[0] ||
            data?.asset_endpoint_informations?.risk_score
          ) {
            asset_score.endpoint_score = setAssetScoreName(
              data.asset_score?.endpoint_score
            );
          }
          asset_score.lifecycle_score = setAssetScoreName(
            data.asset_score?.lifecycle_score
          );
          asset_score.risk_score = convertInPercentage(
            data.asset_score?.risk_score
          );
        } else if (data.asset_type === "network") {
          asset_score.backup_score = "NotApplied";
          asset_score.endpoint_score = "NotApplied";
          if (
            data?.asset_patching_informations?.[0] ||
            data?.asset_patching_informations?.risk_score
          ) {
            asset_score.patching_score = setAssetScoreName(
              data.asset_score?.patching_score
            );
          }
          asset_score.lifecycle_score = setAssetScoreName(
            data.asset_score?.lifecycle_score
          );
          asset_score.risk_score = convertInPercentage(
            data.asset_score?.risk_score
          );
        } else if (data.asset_type === "unknown") {
          asset_score.backup_score = "N/A";
          asset_score.endpoint_score = "N/A";
          asset_score.patching_score = "N/A";
          asset_score.lifecycle_score = "N/A";
          asset_score.risk_score = 0;
        }
        // console.log("asset_score ---------- ", asset_score)
        const filteredData = {
          asset_id: data.id,
          asset_name: data.asset_name,
          location: assetDetail?.custom_location,
          asset_scores,
          vendor_name: patchingInfo?.vendor || lifecycleInfo?.vendor,
          os_current_version:
            endpointInfo?.os_install_version || patchingInfo?.os_version,
          compliant: patchingInfo?.compliant,
          connected: patchingInfo?.connected,
          cpu: patchingInfo?.cpu,
          createdAt: data.createdAt,
          custom_name: assetDetail?.custom_name,
          endpoint_protection_status: endpointInfo?.status,
          exception: patchingInfo?.exception,
          group: patchingInfo?.group || endpointInfo?.group,
          is_compatible: patchingInfo?.is_compatible,
          is_uptoDate: patchingInfo?.is_uptoDate,
          os_family: endpointInfo?.os_family || patchingInfo?.os_family,
          os_name: endpointInfo?.os_name || patchingInfo?.os_name,
          ram: patchingInfo?.ram || "",
          serial_number: patchingInfo?.serial_number || endpointInfo?.serial_number,
          server_group_id:
            patchingInfo?.server_group_id || endpointInfo?.server_group_id,
          status: patchingInfo?.status,
          patching_policy_statuses: patchingInfo?.policy_statuses,
          patching_agent_status: patchingInfo?.agent_status,
          patching_device_status: patchingInfo?.device_status,
          volume: patchingInfo?.volume || "",
          tags: tags || [],
          endpoint_status: endpointInfo?.status || "",
          asset_scores_logs: data.asset_scores_logs,
          asset_sub_type: data.asset_sub_type,
          asset_type: data.asset_type,
          id: data.id,
          ipaddress: data.ipaddress,
          sources_type,
          updatedAt: data.updatedAt,
          asset_score: data?.asset_score,
          asset_risk_score_impacts: riskImpact,
          last_seen: patchingInfo?.last_seen || endpointInfo?.last_seen_at,
          last_user:
            patchingInfo?.last_logged_in_user || endpointInfo?.last_user,
          model: patchingInfo?.model || lifecycleInfo?.model, 
          downtime_cost: riskCostFactorSelectedAssetData?.dataValues?.risk_cost_factor_selected_assets?.[0]?.dataValues || null,
          description: patchingInfo?.description || lifecycleInfo?.description,
          software_version: patchingInfo?.software_version || lifecycleInfo?.software_version,
          warranty_coverage_status: patchingInfo?.warranty_coverage_status || lifecycleInfo?.warranty_coverage_status,
          warranty_expiration_date: patchingInfo?.warranty_expiration_date || lifecycleInfo?.warranty_expiration_date,
          asset_data: asset_score,
        };
        
        res.status(200).json(filteredData);
      })
      .catch((err) => {
        errorHandler(err);
        res.status(400).json({ valid: false, message: err.message });
      });
  } catch (err) {
    res.status(400).json({ valid: false, message: err.message });
  }
};
