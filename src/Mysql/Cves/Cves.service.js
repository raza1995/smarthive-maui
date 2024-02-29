import { Op } from "sequelize";
import OpenCVEsModel from "../../Postgresql/Cves/Cves.model";
import { errorHandler } from "../../utils/errorHandler";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import assetSQLModel from "../Assets/assets.model";
import { getSourceValidation } from "../Assets/assets.service";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import assetsCustomWeightageScoreModel from "../AssetsScoreManagements/assetsCustomWeightageScore/assetsCustomWeightageScore.model";
import assetsScoreWeightageModel from "../AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.model";
import AssetTagModel from "../AssetTags/assetTags.model";
import sequelize from "../db";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import patchSQLModel from "../Patch/patch.model";
import softwareSQLModel from "../Softwares/softwares.model";
import VendorsModel from "../Vendors/Vendors.model";
import CVEsMysqlModel from "./Cves.model";

export const updateOrCreateCVE = async (cve, client) => {
  const tagInDB = await CVEsMysqlModel.findOne({
    where: { cve },
  });
  // eslint-disable-next-line no-return-await
  const opencveDetail = await OpenCVEsModel.findOne({
    where: {
      cve_id: cve,
    },
  });
  if (tagInDB?.id) {
    await CVEsMysqlModel.update(
      {
        baseScore: opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.baseScore,
        impactScore:
          opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.impactScore,
        exploitabilityScore:
          opencveDetail?.json?.impact?.baseMetricV3?.exploitabilityScore,
        severity:
          opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.baseSeverity,
      },
      {
        where: {
          cve,
        },
      }
    );
    return tagInDB;
  }

  return CVEsMysqlModel.create({
    cve,
    summary: opencveDetail.summary,
    baseScore: opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.baseScore,
    impactScore: opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.impactScore,
    exploitabilityScore:
      opencveDetail?.json?.impact?.baseMetricV3?.exploitabilityScore,
    severity: opencveDetail?.json?.impact?.baseMetricV3?.cvssV3?.baseSeverity,
    publishedDate: opencveDetail?.json?.publishedDate,
  }).then(
    (resp) =>
      // addEventLog(
      //   {
      //     id: client?.client_id,
      //     email: client?.client_email,
      //     ipAddress: client.ipAddress,
      //     process: `New tag created`,
      //     user_id: null,
      //     company_id: tag.company_id,
      //     isSystemLog: false,
      //   },
      //   TagCreated.status.TagCreatedSuccessfully.code,
      //   null
      // );
      resp
  );
};

export const getCveAffectedAssets = async (
  company_id,
  pagesize,
  page,
  filter
) => {
  try {
    const SourceValidation = await getSourceValidation(company_id, []);
    const integrationIds = await getCompanyIntegrationIds(company_id);
    let integrationIdsString = "";
    integrationIds.forEach((id, index) => {
      integrationIdsString += `"${id}"${
        index < integrationIds.length - 1 ? "," : ""
      }`;
    });

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

    const filterTagObj = {
      required: false,
      filter: {},
    };

    if (filter?.tags?.length > 0) {
      filterTagObj.filter.tag_id = { [Op.in]: filter?.tags };
      filterTagObj.required = true;
    }
    const cveQuery = {};
    if (filter?.cves?.length > 0) {
      cveQuery.id = { [Op.in]: filter?.cves?.map((el) => el.id) };
    }
    if (filter?.severities?.length > 0) {
      cveQuery.severity = { [Op.in]: filter?.severities };
    }
    let order = [[sequelize.literal("cvesCount"), "DESC"]];
    if (filter?.SortByCvesCounts === "asc") {
      order = [[sequelize.literal("cvesCount"), "ASC"]];
    }
    const { count: totalAssetsCount, rows } =
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
            include: [
              {
                model: assetsScoreWeightageModel,
                attributes: ["name", "priority"],
              },
            ],
          },
          {
            model: patchSQLModel,
            required: true,
            through: {
              attributes: [],
            },
            include: [
              {
                model: CVEsMysqlModel,
                attributes: ["cve", "severity"],
                through: {
                  attributes: [],
                },
                required: true,
                where: cveQuery,
              },
            ],
          },
          {
            model: AssetTagModel,
            where: filterTagObj.filter,
            required: filterTagObj.required,
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                `(${"SELECT count(DISTINCT(`cves`.`id`)) AS `count` FROM `cves` AS `cves` INNER JOIN ( `patch_cves` AS `patches->patch_cves` INNER JOIN `patches` AS `patches` ON `patches`.`id` = `patches->patch_cves`.`patch_id`) ON `cves`.`id` = `patches->patch_cves`.`cve_id` INNER JOIN ( `asset_patches` AS `patches->assets->asset_patches` INNER JOIN `assets` AS `patches->assets` ON `patches->assets`.`id` = `patches->assets->asset_patches`.`asset_id`) ON `patches`.`id` = `patches->assets->asset_patches`.`patch_id` AND `patches->assets`.`id` = `asset`.`id` INNER JOIN `asset_sources` AS `patches->assets->asset_sources` ON `patches->assets`.`id` = `patches->assets->asset_sources`.`asset_id` AND `patches->assets->asset_sources`.`integration_id`"} IN (${integrationIdsString}))`
              ),
              "cvesCount",
            ],
          ],
        },
        order,
        offset: (page - 1) * pagesize,
        limit: +pagesize,
      });
    const Assets = await Promise.all(
      rows.map(async (el) => {
        const item = JSON.parse(JSON.stringify(el));
        const { rows: Vendors, count: totalVendors } =
          await VendorsModel.findAndCountAll({
            distinct: "id",
            include: [
              {
                model: softwareSQLModel,
                attributes: ["id"],
                required: true,
                include: [
                  {
                    model: assetSQLModel,
                    where: {
                      id: item.id,
                    },
                    through: {
                      attributes: [],
                    },
                    required: true,
                    include: [
                      {
                        ...SourceValidation,
                      },
                    ],
                  },
                ],
              },
            ],
          });
        item.Vendors = JSON.parse(JSON.stringify(Vendors));
        item.totalVendors = totalVendors;
        const { count: totalSoftware, rows: software } =
          await softwareSQLModel.findAndCountAll({
            distinct: "id",
            include: [
              {
                model: assetSQLModel,
                where: {
                  id: item.id,
                },
                through: {
                  attributes: [],
                },
                // attributes: [],
                required: true,
                include: [
                  {
                    ...SourceValidation,
                  },
                ],
              },
            ],
          });
        item.software = JSON.parse(JSON.stringify(software));
        item.totalSoftware = totalSoftware;

        item.cvesSeverities = await Promise.all(
          ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(async (severity) => {
            const count = await CVEsMysqlModel.count({
              distinct: "id",
              where: {
                severity,
              },
              include: [
                {
                  model: patchSQLModel,
                  required: true,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                  include: [
                    {
                      model: assetSQLModel,
                      attributes: [],
                      where: {
                        id: item.id,
                      },
                      include: [SourceValidation],
                      required: true,
                      through: {
                        attributes: [],
                      },
                    },
                  ],
                },
              ],
            });
            return {
              count,
              severity,
            };
          })
        );

        return item;
      })
    );

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
