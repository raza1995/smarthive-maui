import { Op } from "sequelize";
import sequelize from "../db";
import {
  assetType,
  integrationCategoryType,
  integrationsNames,
  nonNetworkSubTypes,
} from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import createAssetEndpointsInfo from "../AssetEndpointInformation/assetEndpointInformation.controller";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
// eslint-disable-next-line import/no-cycle
import { createAssetPatchingInfo } from "../AssetPatchingInformation/assetPatchingInformation.controller";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import { updateOrCreateAssetSources } from "../AssetSources/assetSources.service";
import AssetTagModel from "../AssetTags/assetTags.model";
import { getCompanyAssetTagsByFilter } from "../AssetTags/assetTags.service";
import GroupAssetsSQLModel from "../GroupsAssets/GroupsAsset.model";
import { createHumanAssetRelation } from "../HumanAssets/humanAssets.service";
import IntegrationModel from "../Integration/integration.model";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import {
  assetCreateActivity,
  assetUpdateActivity,
} from "../Logs/ActivitiesType/assetsactivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
// import { createAssetInfo } from "./asset.controller";
import assetSQLModel from "./assets.model";
import assetsCustomWeightageScoreModel from "../AssetsScoreManagements/assetsCustomWeightageScore/assetsCustomWeightageScore.model";
import patchSQLModel from "../Patch/patch.model";
import PatchCVEsModel from "../PatchCVEs/PatchCVEs.model";
import assetsScoreWeightageModel from "../AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.model";
import { sortAssetScores } from "../PrivilegeAccessScoreManagements/privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.controller";
import TagsModel from "../Tags/tags.model";
import CVEsModel from "../Cves/Cves.model";
import softwareSQLModel from "../Softwares/softwares.model";
import { createAssetLifecycleInfo } from "../AssetLifecycleInformation/assetLifecycleInformation.controller";
import AssetLifecycleInformationModel from "../AssetLifecycleInformation/assetLifecycleInformation.model";
import { createAssetBackupInfo } from "../AssetBackupInformation/assetBackupInformation.controller";
import AssetBackupInformationModel from "../AssetBackupInformation/assetBackupInformation.model";

let highscore = 0;
let mediumscore = 0;
let lowscore = 0;
export const getAssetType = (assetSubType) => {
  if (nonNetworkSubTypes.includes(assetSubType)) {
    return "non-network";
  }
  if (["unknown"].includes(assetSubType)) {
    return "unknown";
  }
  return "network";
};
export const setAssetScoreName = (score) => {
  let data = "";
  if (score >= 700) {
    data = "Low";
  } else if (score < 700 && score >= 540) {
    data = "Medium";
  } else if (score < 540 && score >= 0) {
    data = "High";
  } else {
    data = "N/A";
  }
  return data;
};
export const createAssetInfo = async (asset, source, integration) => {
  switch (integration.integration_category_type) {
    case integrationCategoryType.endpoint:
      await createAssetEndpointsInfo(asset, source);
      break;
    case integrationCategoryType.patching:
      await createAssetPatchingInfo(asset, source);
      break;
    case integrationCategoryType.discovery:
      await createAssetEndpointsInfo(asset, source);
      await createAssetPatchingInfo(asset, source);
      await createAssetLifecycleInfo(asset, source);
      break;
    case integrationCategoryType.backup:
      await createAssetBackupInfo(asset, source);
      break;
    default:

    // code block
  }
  if (source.sources_type === integrationsNames.MICROSOFT) {
    console.log("source", source, "integration", integration);
    await createAssetEndpointsInfo(asset, source);
  }
};
export const getSourceValidation = async (company_id, attributes) => {
  const integrationIds = await getCompanyIntegrationIds(company_id);
  const SourceValidation = {
    model: assetSourcesModel,
    where: {
      integration_id: { [Op.in]: integrationIds },
    },

    required: true,
  };
  if (attributes) {
    SourceValidation.attributes = attributes;
  }
  return SourceValidation;
};
export const convertInPercentage = (num) => {
  const data = { percent: 0, value: 0, riskScore: "" };
  if (num >= 720) {
    data.percent = Math.ceil((num / 850) * 100);
    data.value = num;
    data.riskScore = "Low";
  } else if (num < 720 && num > 540) {
    data.percent = Math.ceil((num / 850) * 100);
    data.value = num;
    data.riskScore = "Medium";
  } else if (num < 540 && num >= 0) {
    data.percent = Math.ceil((num / 850) * 100);
    data.value = num;
    data.riskScore = "High";
  }

  return data;
};

const countRiskScore = (score) => {
  if (score >= 720) {
    lowscore += 1;
  } else if (score < 720 && score > 540) {
    mediumscore += 1;
  } else if (score < 540 && score > 0) {
    highscore += 1;
  }
};
export const updateOrCreateSQLAsset = async (items) => {
  try {
    let i = 0;

    for await (const item of items) {
      // console.log('No of asset sources',item.asset_sources.length,item.device_id)
      const asset = await assetSQLModel.findOne({
        where: { device_id: item.device_id, company_id: item.company_id },
      });
      i++;
      if (asset) {
        await assetSQLModel.update(item, {
          where: {
            device_id: item.device_id,
            company_id: item.company_id,
          },
        });

        const oldAssets = await assetSourcesModel.findAll({
          where: { asset_id: asset.id },
          order: [["updatedAt", "DESC"]],
        });
        console.log(item.asset_sources);
        const sourcesLastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
        await updateOrCreateAssetSources(asset.id, item.asset_sources);
        if (oldAssets.length > 0) {
          const deleteAssets = await assetSourcesModel.destroy({
            where: {
              asset_id: asset.id,
              updatedAt: { [Op.lte]: sourcesLastUpdatedAtDate },
            },
          });
          console.log("No of delete assets Source", deleteAssets);
        }
      } else {
        await assetSQLModel.create(item, { include: [assetSourcesModel] });
      }
      const percentage = (i * 100) / items.length;
      console.log("Asset save to db", percentage, "%done...");
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getAssetsCompanyByFilterAndAttributes = async (
  company_id,
  pagesize = 10,
  page = 1,
  filter,
  attributes = []
) => {
  try {
    const SourceValidation = await getSourceValidation(company_id, []);
    const buildFilter = (filterVal) => {
      const filterObj = {};
      if (filterVal?.search) {
        filterObj[Op.or] = [
          { asset_name: { [Op.like]: `%${filterVal?.search}%` } },
          {
            "$asset_detail.custom_name$": {
              [Op.like]: `%${filterVal?.search}%`,
            },
          },
        ];
      }
      if (filterVal?.assetsType) {
        filterObj.asset_type = { [Op.or]: filter.assetsType };
      }
      if (filterVal?.deviceType?.length > 0) {
        filterObj.asset_sub_type = { [Op.in]: filter.deviceType };
      }
      if (filterVal?.asset_sub_types?.length > 0) {
        filterObj.asset_sub_type = { [Op.in]: filter.asset_sub_types };
      }
      if (filterVal?.locations) {
        // filterObj[Op.or] = [
        //   { "$asset_detail.custom_location$": { [Op.in]: filter.locations } },
        //   { endpoint_information_location: { [Op.in]: filter.locations } },
        //   // [ sequelize.literal("endpoint_information_location"), { [Op.in]: filter.locations } ],
        // ];
      }
      return filterObj;
    };
    const riskFilterObj = {};
    let riskFilterObjRequired = false;
    if (filter?.riskScore && filter?.riskScore.length > 0) {
      const sc = [];
      if (filter?.riskScore?.includes("high")) {
        sc.push({ [Op.lte]: 540 });
      }

      if (filter?.riskScore?.includes("medium")) {
        sc.push({ [Op.and]: [{ [Op.lte]: 700 }, { [Op.gte]: 540 }] });
      }
      if (filter?.riskScore?.includes("low")) {
        sc.push({ [Op.gte]: 700 });
      }
      // riskFilterObj.risk_score = { [Op.lte]: 280 };
      riskFilterObj.risk_score = {
        [Op.or]: sc,
      };
      riskFilterObjRequired = true;
    }
    const query = { company_id, ...buildFilter(filter) };

    const filterTagObj = {
      required: false,
      filter: {},
    };

    if (filter?.tags?.length > 0) {
      filterTagObj.filter.tag_id = {
        [Op.in]: filter?.tags?.map((tag) =>
          typeof tag === "string" ? tag : tag?.id
        ),
      };
      filterTagObj.required = true;
    }
    const includesAttributes = [];

    // if (filter?.locations || true) {
    includesAttributes.push([
      sequelize.literal(
        `(SELECT asset_endpoint_informations.location FROM asset_endpoint_informations WHERE asset_endpoint_informations.asset_id =asset.id ORDER BY asset_endpoint_informations.updatedAt DESC LIMIT 1 )`
      ),
      "endpoint_information_location",
    ]);
    // }
    let endpointLocationFilter = {};
    if (filter?.locations?.length > 0) {
      endpointLocationFilter = {
        location: { [Op.in]: filter.locations },
      };
    }
    const result = {};
    /* ***************************** get count of assets having custom weightage score ******************************************* */
    if (attributes.includes("assetsCountWithCustomScore")) {
      const { customScoreAssetsFilter } = filter;
      const customScoreAssetsQuery = {};
      if (customScoreAssetsFilter?.notIncludedWeightageIds) {
        customScoreAssetsQuery.weightage_id = {
          [Op.notIn]: customScoreAssetsFilter.notIncludedWeightageIds,
        };
      }
      result.assetsCountWithCustomScore = await assetSQLModel
        .findAndCountAll({
          where: query,
          col: "id",
          include: [
            SourceValidation,
            {
              model: AssetScoreSQLModel,
              where: riskFilterObj,
              required: riskFilterObjRequired,
            },
            {
              model: AssetDetailModel,
              attributes: ["custom_name", "custom_location"],
              required: true,
            },
            {
              model: AssetTagModel,
              where: filterTagObj.filter,
              required: filterTagObj.required,
            },
            {
              model: assetsCustomWeightageScoreModel,
              where: customScoreAssetsQuery,
              required: true,
            },
            {
              model: AssetEndpointInformationModel,
              required: filter?.locations?.length > 0,
              where: {
                ...endpointLocationFilter,
              },
            },
          ],
          attributes: {
            include: [...includesAttributes],
          },
        })
        .then((resp) => resp.rows.length);
    }

    /* *********************** assets subTypes count ************************************** */
    if (attributes.includes("assetsSubTypesCounts")) {
      result.assetsSubTypesCounts = [];
      if (filter?.asset_sub_types?.length > 0) {
        result.assetsSubTypesCounts = await Promise.all(
          await filter?.asset_sub_types?.map(async (type) => ({
            type,
            count: await assetSQLModel
              .findAndCountAll({
                where: { ...query, asset_sub_type: type },

                include: [
                  SourceValidation,
                  {
                    model: AssetScoreSQLModel,
                    where: riskFilterObj,
                    required: riskFilterObjRequired,
                  },
                  {
                    model: AssetDetailModel,
                    attributes: ["custom_name", "custom_location"],
                    required: true,
                  },
                  {
                    model: AssetTagModel,
                    where: filterTagObj.filter,
                    required: filterTagObj.required,
                  },
                  {
                    model: AssetEndpointInformationModel,
                    required: filter?.locations?.length > 0,
                    where: {
                      ...endpointLocationFilter,
                    },
                  },
                ],
                attributes: {
                  include: [...includesAttributes],
                },
              })
              .then((resp) => resp.rows.length),
          }))
        );
      } else {
        const subTypes = await assetSQLModel.findAll({
          where: {
            company_id,
          },
          attributes: ["asset_sub_type"],
          group: "asset_sub_type",
        });
        result.assetsSubTypesCounts = [];
        await Promise.all(
          await subTypes?.map(async (type) => {
            const count = await assetSQLModel
              .findAndCountAll({
                where: { ...query, asset_sub_type: type.asset_sub_type },

                include: [
                  SourceValidation,
                  {
                    model: AssetScoreSQLModel,
                    where: riskFilterObj,
                    required: riskFilterObjRequired,
                  },
                  {
                    model: AssetDetailModel,
                    attributes: ["custom_name", "custom_location"],
                    required: true,
                  },
                  {
                    model: AssetTagModel,
                    where: filterTagObj.filter,
                    required: filterTagObj.required,
                  },
                  {
                    model: AssetEndpointInformationModel,
                    required: filter?.locations?.length > 0,
                    where: {
                      ...endpointLocationFilter,
                    },
                  },
                ],
                attributes: {
                  include: [...includesAttributes],
                },
              })
              .then((resp) => resp.rows.length);
            if (count > 0) {
              result.assetsSubTypesCounts.push({
                type: type.asset_sub_type,
                count,
              });
            }
          })
        );
      }
    }
    if (attributes.includes("totalAssetsCount")) {
      result.totalAssetsCount = await assetSQLModel
        .findAndCountAll({
          where: query,
          col: "id",
          include: [
            SourceValidation,
            {
              model: AssetScoreSQLModel,
              where: riskFilterObj,
              required: riskFilterObjRequired,
            },
            {
              model: AssetDetailModel,
              attributes: ["custom_name", "custom_location"],
              required: true,
            },
            {
              model: AssetTagModel,
              where: filterTagObj.filter,
              required: filterTagObj.required,
            },
            {
              model: AssetEndpointInformationModel,
              required: filter?.locations?.length > 0,
              where: {
                ...endpointLocationFilter,
              },
            },
          ],
          attributes: {
            include: [...includesAttributes],
          },
        })
        .then((resp) => resp.rows.length);
    }
    let pagination = {};
    if (pagesize !== "all") {
      pagination = { offset: (page - 1) * pagesize, limit: +pagesize };
    }
    const data = await assetSQLModel.findAll({
      where: query,
      include: [
        SourceValidation,
        {
          model: AssetScoreSQLModel,
          where: riskFilterObj,
          required: riskFilterObjRequired,
        },
        {
          model: AssetDetailModel,
          attributes: ["custom_name", "custom_location"],
          required: true,
        },
        {
          model: AssetTagModel,
          where: filterTagObj.filter,
          required: filterTagObj.required,
        },
        {
          model: AssetEndpointInformationModel,
          required: filter?.locations?.length > 0,
          where: {
            ...endpointLocationFilter,
          },
        },
        {
          model: AssetPatchingInformationModel,
          attributes: ["risk_score", "os_version"],
        },
        {
          model: AssetLifecycleInformationModel,
          attributes: ["risk_score", "software_version"],
        },
      ],
      attributes: {
        include: [...includesAttributes],
      },
      ...pagination,
    });

    const asset = {
      Assets: data,
      ...result,
    };

    return asset;
  } catch (error) {
    errorHandler(error);
    throw Error(error);
  }
};

export const getAssetsAndAssetsCountOfCompanyByFilter = async (
  company_id,
  pagesize,
  page,
  filter
) => {
  try {
    const SourceValidation = await getSourceValidation(company_id, []);
    const buildFilter = (filterVal) => {
      const filterObj = {};
      if (filterVal?.search) {
        filterObj[Op.or] = [
          { asset_name: { [Op.like]: `%${filterVal?.search}%` } },
          {
            "$asset_detail.custom_name$": {
              [Op.like]: `%${filterVal?.search}%`,
            },
          },
        ];
      }
      if (filterVal?.assetsType) {
        filterObj.asset_type = { [Op.or]: filter.assetsType };
      }
      if (filter?.not_included_ids) {
        filterObj.id = { [Op.notIn]: filter?.not_included_ids };
      }
      if (filter?.included_ids) {
        filterObj.id = { [Op.in]: filter?.included_ids };
      }
      if (filterVal?.deviceType) {
        filterObj.asset_sub_type = filter.deviceType;
      }
      return filterObj;
    };
    const endpointFilter = {};
    if (filter?.location) {
      endpointFilter.location = filter.location;
    }
    const riskFilterObj = {};
    let riskFilterObjRequired = false;
    if (filter?.riskScore && filter?.riskScore.length > 0) {
      const sc = [];
      if (filter?.riskScore?.includes("high")) {
        sc.push({ [Op.lte]: 540 });
      }

      if (filter?.riskScore?.includes("medium")) {
        sc.push({ [Op.and]: [{ [Op.lte]: 700 }, { [Op.gte]: 540 }] });
      }
      if (filter?.riskScore?.includes("low")) {
        sc.push({ [Op.gte]: 700 });
      }
      // riskFilterObj.risk_score = { [Op.lte]: 280 };
      riskFilterObj.risk_score = {
        [Op.or]: sc,
      };
      riskFilterObjRequired = true;
    }
    const query = { company_id, ...buildFilter(filter) };
    const softwareNestedFilter = {};
    let softwareRequired = false;

    if (filter?.software_id && filter?.software_id !== undefined) {
      softwareNestedFilter.id = filter?.software_id;
      softwareRequired = true;
    }
    let softwareIncludes = [];
    if (filter?.cves?.length > 0 || filter?.requiredCve) {
      softwareRequired = true;
      softwareIncludes = [
        {
          model: patchSQLModel,
          required: true,
          through: {
            attributes: [],
          },
          include: [
            {
              model: CVEsModel,
              attributes: ["cve"],
              through: {
                attributes: [],
              },
              required: filter?.cves?.length >= 0,
              where:
                filter?.cves?.length > 0
                  ? {
                      id: { [Op.in]: filter?.cves?.map((el) => el.id) },
                    }
                  : {},
            },
          ],
        },
      ];
    }

    const filterTagObj = {
      required: false,
      filter: {},
    };
    const groupAssetsObj = {
      required: false,
      filter: {},
    };

    if (filter?.tags?.length > 0) {
      filterTagObj.filter.tag_id = { [Op.in]: filter?.tags };
      filterTagObj.required = true;
    }

    if (filter?.groups?.length > 0) {
      groupAssetsObj.filter.patching_group_id = { [Op.in]: filter?.groups };
      groupAssetsObj.required = true;
    }
    const { count: totalAssetsCount, rows: data } =
      await assetSQLModel.findAndCountAll({
        where: query,
        distinct: "id",
        include: [
          SourceValidation,
          {
            model: AssetScoreSQLModel,
            where: riskFilterObj,
            required: riskFilterObjRequired,
          },
          {
            model: AssetDetailModel,

            attributes: ["custom_name", "custom_location"],
            required: true,
          },
          {
            model: assetsCustomWeightageScoreModel,
            attributes: ["risk_score", "pure_risk_score"],
            order: [
              "assets_custom_weightage_scores.assets_score_weightage.priority",
              "ASC",
            ],
            include: [
              {
                model: assetsScoreWeightageModel,
                attributes: ["name", "priority"],
              },
            ],
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
          // {
          //   model: assetSoftwareSQLModel,
          //   where: softwareNestedFilter,
          //   required: softwareRequired,
          //   // include: [...softwareIncludes],
          // },
          {
            model: softwareSQLModel,
            where: softwareNestedFilter,
            required: softwareRequired,
            through: {
              attributes: [],
            },
            // include: [...softwareIncludes],
          },
          ...softwareIncludes,
          {
            model: AssetTagModel,
            where: filterTagObj.filter,
            required: filterTagObj.required,
          },
          {
            model: GroupAssetsSQLModel,
            where: groupAssetsObj.filter,
            required: groupAssetsObj.required,
          },
          {
            model: AssetEndpointInformationModel,
            where: endpointFilter,
            attributes: [
              "risk_score",
              "os_install_version",
              "os_current_version",
              "location",
            ],
            required: !!filter?.location,
          },

          {
            model: AssetBackupInformationModel,
            attributes: ["risk_score"],
          },

          {
            model: AssetPatchingInformationModel,
            attributes: ["risk_score", "os_version"],
          },
        ],
        // attributes:{
        //   include:[
        //     [
        //       sequelize.literal(
        //         `(SELECT COUNT (*) FROM patch_cves as pc WHERE pc.patch_id = asset_patches.id)`
        //         // `(SELECT COUNT (*) FROM asset_patches as pc WHERE pc.patch_id = patch_cves.patch_id)`
        //       ),
        //       "b_count",
        //     ]
        //   ]
        // },
        offset: (page - 1) * pagesize,
        limit: +pagesize,
      });

    const Assets = [];

    for await (const item of data) {
      const assetData = JSON.parse(JSON.stringify(item));
      assetData.asset_scores = sortAssetScores(
        assetData.assets_custom_weightage_scores,
        assetData?.asset_score
      );
      delete assetData.assets_custom_weightage_scores;
      // console.log("itemitem--------------", item.asset_patches)
      const tags = await getCompanyAssetTagsByFilter({
        asset_id: item.id,
      });
      assetData.tags = tags || [];
      const asset_score = {
        backup_score: "N/A",
        lifecycle_score: "N/A",
        patching_score: "N/A",
        endpoint_score: "N/A",
        risk_score: 0,
      };
      if (item.asset_type === "non-network") {
        if (
          item?.asset_backup_informations?.[0] ||
          item?.asset_backup_informations?.risk_score
        ) {
          asset_score.backup_score = setAssetScoreName(
            item.asset_score?.backup_score
          );
        }
        if (
          item?.asset_patching_informations?.[0] ||
          item?.asset_patching_informations?.risk_score
        ) {
          asset_score.patching_score = setAssetScoreName(
            item.asset_score?.patching_score
          );
        }
        if (
          item?.asset_endpoint_informations?.[0] ||
          item?.asset_endpoint_informations?.risk_score
        ) {
          asset_score.endpoint_score = setAssetScoreName(
            item.asset_score?.endpoint_score
          );
        }
        asset_score.lifecycle_score = setAssetScoreName(item.asset_score?.lifecycle_score);
        asset_score.risk_score = convertInPercentage(
          item.asset_score?.risk_score
        );
      } else if (item.asset_type === "network") {
        asset_score.backup_score = "NotApplied";
        asset_score.endpoint_score = "NotApplied";
        if (
          item?.asset_patching_informations?.[0] ||
          item?.asset_patching_informations?.risk_score
        ) {
          asset_score.patching_score = setAssetScoreName(
            item.asset_score?.patching_score
          );
        }
        asset_score.lifecycle_score = setAssetScoreName(
          item.asset_score?.lifecycle_score
        );
        asset_score.risk_score = convertInPercentage(
          item.asset_score?.risk_score
        );
      } else if (item.asset_type === "unknown") {
        asset_score.backup_score = "N/A";
        asset_score.endpoint_score = "N/A";
        asset_score.patching_score = "N/A";
        asset_score.lifecycle_score = "N/A";
        asset_score.risk_score = 0;
      }
      Assets.push({ ...assetData, asset_score });
    }

    const asset = {
      Assets,
      totalAssetsCount,
    };

    return asset;
  } catch (error) {
    errorHandler(error);
    throw Error(error);
  }
};
export const getAssetsByCompanyId = async (
  company_id,
  pagesize,
  page,
  filter
) => {
  try {
    const SourceValidation = await getSourceValidation(company_id, []);
    const totalCount = await assetSQLModel
      .findAndCountAll({
        where: { company_id },
        include: [SourceValidation],
      })
      .then((resp) => resp.rows.length);
    const assetsAtHighRisk = await assetSQLModel
      .findAndCountAll({
        where: { "$asset_score.risk_score$": { [Op.lte]: 540 } },
        include: [AssetScoreSQLModel, SourceValidation],
      })
      .then((resp) => resp.rows.length);
    const assetsAtMediumRisk = await assetSQLModel
      .findAndCountAll({
        where: {
          [Op.and]: [
            { "$asset_score.risk_score$": { [Op.gt]: 540 } },
            { "$asset_score.risk_score$": { [Op.lte]: 700 } },
          ],
        },
        include: [AssetScoreSQLModel, SourceValidation],
      })
      .then((resp) => resp.rows.length);
    const assetsAtLowRisk = await assetSQLModel
      .findAndCountAll({
        where: { "$asset_score.risk_score$": { [Op.gt]: 700 } },
        include: [AssetScoreSQLModel, SourceValidation],
      })
      .then((resp) => resp.rows.length);
    const result = await getAssetsAndAssetsCountOfCompanyByFilter(
      company_id,
      pagesize,
      page,
      filter
    );
    const asset = {
      data: result?.Assets,
      totalCount,
      assetsAtHighRisk,
      assetsAtMediumRisk,
      assetsAtLowRisk,
      filterCount: result?.totalAssetsCount || 0,
    };

    return asset;
  } catch (error) {
    errorHandler(error);
  }
};
export const getAssetsOfCompanyIdAffectedByCVEs = async (
  company_id,
  pagesize,
  page,
  filter
) => {
  try {
    const result = await getAssetsAndAssetsCountOfCompanyByFilter(
      company_id,
      pagesize,
      page,
      filter
    );
    const asset = {
      data: result?.Assets,
      filterCount: result?.totalAssetsCount || 0,
    };

    return asset;
  } catch (error) {
    errorHandler(error);
  }
};

export const getCompanyAssets = async (company_id) => {
  try {
    const query = { company_id };
    const data = await assetSQLModel.findAll({
      where: query,
      include: [
        {
          model: assetSourcesModel,
          required: true,
          include: [
            {
              model: IntegrationModel,
              // required: true,
              attributes: [],
            },
          ],
        },
      ],
    });
    return data;
  } catch (error) {
    errorHandler(error);
  }
};
export const getCompanyAssetsBySource = async (
  company_id,
  sourceType,
  deviceId
) => {
  try {
    const query = { company_id };
    const data = await assetSQLModel.findOne({
      where: query,
      include: [
        {
          model: assetSourcesModel,
          where: { sources_type: sourceType, device_id: deviceId },
          required: true,
          include: [
            {
              model: IntegrationModel,
              // required: true,
              attributes: [],
            },
          ],
        },
      ],
    });
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    errorHandler(error);
  }
};
export const getCompanyAssetsForParticularSource = async (
  company_id,
  sourceType
) => {
  try {
    const query = { company_id };
    const data = await assetSQLModel.findAll({
      where: query,
      row: true,
      nest: true,
      include: [
        {
          model: assetSourcesModel,
          where: { sources_type: sourceType },
          required: true,
          include: {
            model: IntegrationModel,
            // required: true,
            attributes: [],
          },
        },
      ],
    });
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    errorHandler(error);
  }
};
export const updateOrCreateSQLAssetOfIntegration = async (
  items,
  integration
) => {
  let i = 0;
  const startTime = new Date();
  for await (const item of items) {
    const getQuery = () => {
      const query = [];
      if (item.asset_name) {
        query.push({ asset_name: item.asset_name });
      }
      if (item.asset_type === assetType.unknown && item.ipaddress) {
        query.push({ ipaddress: item.ipaddress });
      }
      return query;
    };
    const asset = await assetSQLModel.findOne({
      include: [
        {
          model: assetSourcesModel,
          where: {
            device_id: item.asset_sources[0].device_id,
            integration_id: item.asset_sources[0].integration_id,
          },
          required: false,
        },
      ],
      raw: true,
      nest: true,
      where: {
        company_id: item.company_id,
        [Op.or]: getQuery(),
      },
    });
    // CliProgressBar("Asset saved to db", i, items.length, startTime);
    i++;
    const percentage = (i * 100) / items.length;
    if (asset) {
      if (
        asset.asset_sources.device_id !== item.asset_sources[0].device_id ||
        asset.asset_sources.integration_id !==
          item.asset_sources[0].integration_id
      ) {
        await assetSourcesModel.create({
          asset_id: asset.id,
          ...item.asset_sources[0],
        });
      } else {
        await assetSourcesModel.update(
          {
            asset_id: asset.id,
            ...item.asset_sources[0],
          },
          {
            where: {
              device_id: item.asset_sources[0].device_id,
              integration_id: item.asset_sources[0].integration_id,
            },
          }
        );
      }
      const lastSourceUpdatedAt = asset?.asset_sources?.updatedAt;
      if (lastSourceUpdatedAt) {
        const deleteAssetSources = await assetSourcesModel.destroy({
          where: {
            asset_id: asset.id,
            updatedAt: {
              [Op.lte]: lastSourceUpdatedAt,
            },
            integration_id: item.asset_sources[0].integration_id,
          },
        });
        console.log("delete assets sources", deleteAssetSources);
      }
      if (
        asset.ipaddress === item.ipaddress ||
        asset.asset_sources.device_id === item.asset_sources[0].device_id ||
        asset.asset_name !== item.asset_name
      ) {
        if (
          asset.asset_type === assetType.unknown &&
          item.asset_type !== assetType.unknown
        ) {
          await assetSQLModel.update(item, {
            where: { id: asset.id },
          });
        } else {
          await assetSQLModel.update(
            { ipaddress: item.ipaddress || "N/A" },
            {
              where: { id: asset.id },
            }
          );
          console.log("Asset update to db", percentage, "%done...");
        }
        delete asset?.asset_sources?.updatedAt;
        delete asset?.asset_sources?.createdAt;
        const updateAsset = await assetSQLModel.findOne({
          where: { id: asset.id },
          include: [
            {
              model: assetSourcesModel,
              where: {
                device_id: item.asset_sources[0].device_id,
                integration_id: item.asset_sources[0].integration_id,
              },
              attributes: {
                exclude: ["updatedAt", "createdAt"],
              },
              required: false,
            },
          ],
          raw: true,
          nest: true,
        });
        await createAssetInfo(asset, item.asset_sources[0], integration);
        const eventLogs = await addEventLog(
          {
            client_id: null,
            client_email: "system",
            process: "asset updated",
            user_id: null,
            company_id: item.company_id,
            asset_id: asset.id,
            isSystemLog: true,
          },
          assetUpdateActivity.status.assetUpdatedSuccessfully.code,
          createEventPayload(
            JSON.parse(JSON.stringify(updateAsset)),
            JSON.parse(JSON.stringify(asset)),
            assetSQLModel.tableName
          )
        );

        // Add Human Asset Relation
        if (integration?.integration_name === integrationsNames.MICROSOFT) {
          await createHumanAssetRelation(updateAsset, item);
        }
      }
    } else {
      const newAsset = await assetSQLModel.create(
        { ...item, asset_detail: { company_id: item.company_id } },
        {
          include: [assetSourcesModel, AssetDetailModel],
        }
      );
      await createAssetInfo(newAsset, item.asset_sources[0], integration);
      const eventLogs = await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: "new asset added",
          user_id: null,
          company_id: item.company_id,
          asset_id: newAsset.id,
          isSystemLog: true,
        },
        assetCreateActivity.status.assetCreatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newAsset)),
          {},
          assetSQLModel.tableName
        )
      );
      // Add Human Asset Relation
      if (integration?.integration_name === integrationsNames.MICROSOFT) {
        await createHumanAssetRelation(newAsset, item);
      }
      console.log("Asset create to db", percentage, "%done...");
    }
  }

  return true;
};

export const totalAssetCountService = async (filterObj) =>
  await assetSQLModel.count({
    where: filterObj,
  });

export const findIntegration = async (user) => {
  const automoxIntegration = await IntegrationModel.count({
    where: {
      company_id: user.company_id,
      integration_name: integrationsNames.AUTOMOX,
    },
  });
  const malwareByteIntegration = await IntegrationModel.count({
    where: {
      company_id: user.company_id,
      integration_name: integrationsNames.MALWAREBYTES,
    },
  });
  if (automoxIntegration > 0) {
    return integrationsNames.AUTOMOX;
  }
  if (malwareByteIntegration > 0) {
    return integrationsNames.MALWAREBYTES;
  }
};

export const getGroupAssetTypesWithCount = async (filterObj) => {
  try {
    const assetData = await assetSQLModel.findAll({
      where: filterObj,
      attributes: [
        "asset_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "assetCount"],
      ],
      group: "asset_type",
      raw: true,
    });
    return Promise.resolve(assetData);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getAssetsByType = async (filterObj) => {
  try {
    const SourceValidation = await getSourceValidation(
      filterObj?.company_id,
      []
    );
    const assetTypes = await assetSQLModel.findAll({
      include: [
        {
          model: AssetScoreSQLModel,
          attributes: [],
        },
        { ...SourceValidation },
      ],
      where: filterObj,
      attributes: [
        "asset_sub_type",
        [
          sequelize.fn("SUM", sequelize.col("asset_score.risk_score")),
          "totalScore",
        ],
        [
          sequelize.fn("COUNT", sequelize.col("asset_score.risk_score")),
          "totalAsset",
        ],
      ],
      group: "asset_sub_type",
      raw: true,
    });

    const asset = await Promise.all(
      assetTypes.map(async (item) => {
        const count = await assetSQLModel
          .findAndCountAll({
            where: {
              // company_id: filterObj?.company_id,
              // asset_type: filterObj?.asset_type,
              ...filterObj,
              asset_sub_type: item.asset_sub_type,
            },
            include: [{ ...SourceValidation }],
          })
          .then((resp) => resp.rows.length);

        const deviceAtRisk = await assetSQLModel
          .findAndCountAll({
            where: {
              // company_id: filterObj?.company_id,
              // asset_type: filterObj?.asset_type,
              ...filterObj,
              asset_sub_type: item.asset_sub_type,
              "$asset_score.risk_score$": { [Op.lt]: 700 },
            },
            include: [
              {
                model: AssetScoreSQLModel,
                as: "asset_score",
                required: true,
              },
              { ...SourceValidation },
            ],
          })
          .then((resp) => resp.rows.length);

        return {
          _id: item.asset_sub_type,
          deviceType: item.asset_sub_type,
          count,
          avgScore: Math.round(item.totalScore / item.totalAsset),
          deviceAtRisk: deviceAtRisk || 0,
        };
      })
    );
    return Promise.resolve(asset);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getGroupAssetSubTypesWithCount = async (filterObj) => {
  try {
    const asset = getAssetsByType(filterObj);
    // const SourceValidation = await getSourceValidation(filterObj?.company_id, []);
    // const assetTypes = await assetSQLModel.findAll({
    //   include: [
    //     {
    //       model: AssetScoreSQLModel,
    //       attributes: [],
    //     },
    //     { ...SourceValidation },
    //   ],
    //   where: filterObj,
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
    //           company_id: filterObj?.company_id,
    //           asset_type: filterObj?.asset_type,
    //           asset_sub_type: item.asset_sub_type,
    //         },
    //         include: [{ ...SourceValidation }],
    //       })
    //       .then((resp) => resp.rows.length);

    //     const deviceAtRisk = await assetSQLModel
    //       .findAndCountAll({
    //         where: {
    //           company_id: filterObj?.company_id,
    //           asset_type: filterObj?.asset_type,
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

    return Promise.resolve(asset);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getAssetsAndTotalCount = async (
  tag_ids,
  user,
  page = 1,
  size = 10,
  asset_type = null
) => {
  try {
    const AssetTags = await AssetTagModel.findAll({
      where: {
        tag_id: {
          [Op.in]: tag_ids,
        },
      },
      attributes: ["asset_id"],
      group: ["asset_id"],
    });

    const assetTagIds = [];
    if (AssetTags.length) {
      for (const AssetTag of AssetTags) {
        const tagIds = [];
        for (const tagId of tag_ids) {
          const assetTagData = await AssetTagModel.findOne({
            where: {
              tag_id: tagId,
              asset_id: AssetTag.dataValues.asset_id,
            },
          });
          if (assetTagData) {
            tagIds.push(tagId);
          }
        }
        if (tagIds.length === tag_ids.length) {
          assetTagIds.push(AssetTag.dataValues.asset_id);
        }
      }
    }

    const filterObj = {};
    const includeFilterObj = {};
    const sort = "DESC";
    const sortColumn = "createdAt";
    if (user.company_id) {
      filterObj.company_id = user.company_id;
    }
    if (asset_type) {
      filterObj.asset_type = asset_type;
    }
    if (assetTagIds.length) {
      filterObj.id = { [Op.in]: assetTagIds };
    } else {
      return Promise.resolve({ assets: [], totalCount: 0 });
    }

    const SourceValidation = await getSourceValidation(
      filterObj?.company_id,
      []
    );

    const response = await assetSQLModel.findAll({
      where: filterObj,
      include: [
        {
          model: AssetTagModel,
          include: [
            {
              model: TagsModel,
            },
          ],
        },
        { ...SourceValidation },
      ],
      order: [[sortColumn, sort]],
      // offset: (page - 1) * size,
      // limit: +size,
    });
    const totalCount = await assetSQLModel
      .findAll({
        where: filterObj,
        include: [
          {
            model: AssetTagModel,
            where: includeFilterObj,
            required: true,
          },
          { ...SourceValidation },
        ],
      })
      .then((resul) => resul.length ?? 0);
    return Promise.resolve({ assets: response, totalCount });
  } catch (err) {
    return Promise.reject(err);
  }
};
