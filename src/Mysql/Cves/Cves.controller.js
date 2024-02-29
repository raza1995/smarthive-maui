import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import postgresqlDb from "../../Postgresql/postgresDb";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import { getSourceValidation } from "../Assets/assets.service";
import sequelize from "../db";
import patchSQLModel from "../Patch/patch.model";
import softwareSQLModel from "../Softwares/softwares.model";
import VendorsModel from "../Vendors/Vendors.model";
import CVEsMysqlModel from "./Cves.model";
import { getCveAffectedAssets } from "./Cves.service";

export const getCVEs = async (req, res) => {
  try {
    const { search, size = 100, page = 1 } = req.query;
    const query = {};
    if (search) {
      query.cve = { [Op.like]: `${search}%` };
    }
    const cves = await CVEsMysqlModel.findAll({
      where: query,
      attributes: ["id", "cve"],
      offset: (page - 1) * size,
      limit: +size,
    });

    res.status(StatusCodes.OK).json({ cves });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
export const getCompanyCVEs = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const query = {};
    if (filter.search) {
      query.cve = { [Op.like]: `%${filter.search}%` };
    }
    if (filter?.severity?.length > 0) {
      query.severity = { [Op.in]: filter.severity };
    }
    let order = ["publishedDate", "DESC"];
    if (filter?.sort) {
      if (filter.sort === "severity") {
        order = [sequelize.literal("severityPriority"), "ASC"];
      }
      if (filter.sort === "older first") {
        order = ["publishedDate", "ASC"];
      }
    }
    const { user } = req;
    const SourceValidation = await getSourceValidation(user.company_id, []);
    const { rows: cves, count: totalCves } =
      await CVEsMysqlModel.findAndCountAll({
        where: query,
        distinct: "id",
        include: [
          {
            model: patchSQLModel,
            required: true,
            through: {
              attributes: [],
            },
            include: [
              {
                model: assetSQLModel,
                include: [SourceValidation],
                required: true,
                through: {
                  attributes: [],
                },
              },
            ],
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                '(SELECT IF(IFNULL(`severity`,0<1), 1000, POSITION(`severity` IN "CRITICAL,HIGH,MEDIUM,LOW")) )'
              ),
              "severityPriority",
            ],
          ],
        },
        order: [order],
        offset: (page - 1) * size,
        limit: +size,
      });
    res.status(StatusCodes.OK).json({ cves, totalCves });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
export const getCVEsOverviewDetails = async (req, res) => {
  try {
    const { user } = req;
    const SourceValidation = await getSourceValidation(user.company_id, []);
    const totalAssets = await assetSQLModel.count({
      distinct: "id",
      include: [SourceValidation],
    });

    const totalAssetsAffected = await assetSQLModel.count({
      distinct: "id",
      include: [
        SourceValidation,
        {
          model: patchSQLModel,
          required: true,
          through: {
            attributes: [],
          },
          include: [
            {
              model: CVEsMysqlModel,
              attributes: ["cve"],
              required: true,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });

    const cves = await CVEsMysqlModel.count({
      distinct: "id",
      include: [
        {
          model: patchSQLModel,
          required: true,
          through: {
            attributes: [],
          },
          include: [
            {
              model: assetSQLModel,
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
    const totalCompanySoftware = await softwareSQLModel.count({
      distinct: "id",
      include: [
        {
          model: assetSQLModel,
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
    const totalCompanySoftwareVendors = await VendorsModel.count({
      distinct: "id",
      include: [
        {
          model: softwareSQLModel,
          required: true,
          include: [
            {
              model: assetSQLModel,
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
        },
      ],
    });
    const assetsCountBySeverity = await Promise.all(
      ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(async (severity) => {
        const count = await assetSQLModel.count({
          distinct: "id",

          include: [
            SourceValidation,
            {
              model: patchSQLModel,
              required: true,
              through: {
                attributes: [],
              },
              include: [
                {
                  model: CVEsMysqlModel,
                  where: { severity },
                  attributes: ["cve"],
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
    const rows = await VendorsModel.findAll({
      include: [
        {
          model: softwareSQLModel,
          required: true,
          include: [
            {
              model: assetSQLModel,
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
            {
              model: patchSQLModel,
              required: true,
              include: [
                {
                  model: CVEsMysqlModel,
                  where: {
                    severity: { [Op.in]: ["HIGH", "CRITICAL", "MEDIUM"] },
                  },
                  required: true,
                  through: {
                    attributes: [],
                  },
                },
              ],
            },
          ],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT count(DISTINCT(`cves`.`id`)) AS `count` FROM `cves` AS `cves` INNER JOIN ( `patch_cves` AS `patches->patch_cves` INNER JOIN `patches` AS `patches` ON `patches`.`id` = `patches->patch_cves`.`patch_id`) ON `cves`.`id` = `patches->patch_cves`.`cve_id` INNER JOIN `softwares` AS `patches->software` ON `patches`.`software_id` = `patches->software`.`id` INNER JOIN `vendors` AS `patches->software->vendor` ON `patches->software`.`vendor_id` = `patches->software->vendor`.`id` AND `patches->software->vendor`.`id` = `vendors`.`id`)"
            ),
            "totalCves",
          ],
        ],
      },
      offset: 0,
      order: [[sequelize.literal("totalCves"), "DESC"]],
      limit: 8,
    });
    const vendors = await Promise.all(
      rows.map(async (row) => {
        const vendor = JSON.parse(JSON.stringify(row));
        const vendorTotalAssetsAffected = await assetSQLModel.count({
          distinct: "id",
          include: [
            {
              ...SourceValidation,
            },
            {
              model: softwareSQLModel,
              required: true,
              through: {
                attributes: [],
              },
              include: [
                {
                  model: VendorsModel,
                  required: true,
                  where: {
                    id: vendor.id,
                  },
                },
              ],
            },
          ],
        });
        const vendorCvesSeverities = await Promise.all(
          ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(async (severity) => {
            const count = await CVEsMysqlModel.count({
              where: {
                severity,
              },
              distinct: "id",
              include: [
                {
                  model: patchSQLModel,
                  required: true,
                  through: {
                    attributes: [],
                  },
                  include: [
                    {
                      model: softwareSQLModel,
                      required: true,
                      include: [
                        {
                          model: VendorsModel,
                          required: true,
                          where: {
                            id: vendor.id,
                          },
                        },
                      ],
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
        return {
          id: vendor.id,
          name: vendor?.name,
          totalCves: vendor.totalCves,
          cvesSeverities: vendorCvesSeverities,
          totalAssetsAffected: vendorTotalAssetsAffected,
          totalSoftware: vendor?.softwares?.length,
          softwares: vendor?.softwares,
        };
      })
    );
    res.status(StatusCodes.OK).json({
      cves,
      totalAssetsAffected,
      totalAssets,
      assetsCountBySeverity,
      totalCompanySoftware,
      totalCompanySoftwareVendors,
      vendors,
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};

export const getCompanyProducts = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const { user } = req;
    const query = {};
    if (filter.search) {
      query.name = { [Op.like]: `${filter.search}%` };
    }
    const SourceValidation = await getSourceValidation(user.company_id, []);
    const { count: totalProducts, rows: products } =
      await softwareSQLModel.findAndCountAll({
        where: query,
        distinct: "id",
        include: [
          {
            model: assetSQLModel,
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
        offset: (page - 1) * size,
        limit: +size,
      });
    res.status(StatusCodes.OK).json({
      products: products || [],
      totalProducts: totalProducts || 0,
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};

export const getCompanyVendors = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const { user } = req;
    const query = {};
    if (filter.search) {
      query[Op.or] = [{ name: { [Op.like]: `%${filter.search}%` } }];
    }
    const SourceValidation = await getSourceValidation(user.company_id, []);
    const { rows, count: totalVendors } = await VendorsModel.findAndCountAll({
      where: query,
      distinct: "id",
      include: [
        {
          model: softwareSQLModel,
          required: true,
          include: [
            {
              model: assetSQLModel,
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
      offset: (page - 1) * size,
      order: ["name"],
      limit: +size,
    });
    const vendors = await Promise.all(
      rows.map(async (vendor) => {
        const softwares = await Promise.all(
          vendor?.softwares?.map(async (item) => {
            const soft = JSON.parse(JSON.stringify(item));
            const totalCves = await CVEsMysqlModel.count({
              distinct: "id",
              include: [
                {
                  model: patchSQLModel,
                  required: true,
                  where: {
                    software_id: soft.id,
                  },
                  through: {
                    attributes: [],
                  },
                },
              ],
            });
            const totalAssets = await assetSQLModel.count({
              distinct: "id",
              include: [
                {
                  ...SourceValidation,
                },
                {
                  model: softwareSQLModel,
                  required: true,
                  where: {
                    id: soft.id,
                  },
                  through: {
                    attributes: [],
                  },
                },
              ],
            });
            return {
              ...soft,
              totalCves,
              totalAssets,
            };
          })
        );
        const totalAssetsAffected = await assetSQLModel.count({
          distinct: "id",
          include: [
            {
              ...SourceValidation,
            },
            {
              model: softwareSQLModel,
              required: true,
              through: {
                attributes: [],
              },
              include: [
                {
                  model: VendorsModel,
                  required: true,
                  where: {
                    id: vendor.id,
                  },
                },
              ],
            },
          ],
        });
        const totalCves = await CVEsMysqlModel.count({
          distinct: "id",
          include: [
            {
              model: patchSQLModel,
              required: true,
              through: {
                attributes: [],
              },
              include: [
                {
                  model: softwareSQLModel,
                  required: true,
                  include: [
                    {
                      model: VendorsModel,
                      required: true,
                      where: {
                        id: vendor.id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
        const cvesSeverities = await Promise.all(
          ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(async (severity) => {
            const count = await CVEsMysqlModel.count({
              where: {
                severity,
              },
              distinct: "id",
              include: [
                {
                  model: patchSQLModel,
                  required: true,
                  through: {
                    attributes: [],
                  },
                  include: [
                    {
                      model: softwareSQLModel,
                      required: true,
                      include: [
                        {
                          model: VendorsModel,
                          required: true,
                          where: {
                            id: vendor.id,
                          },
                        },
                      ],
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
        return {
          id: vendor.id,
          name: vendor?.name,
          totalCves,
          cvesSeverities,
          totalAssetsAffected,
          totalSoftware: vendor?.softwares?.length,
          softwares,
        };
      })
    );
    res.status(StatusCodes.OK).json({
      vendors: vendors || [],
      totalVendors: totalVendors || 0,
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
export const getAssetsAffectedByCVEs = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const { user } = req;
    const cves = await CVEsMysqlModel.findAll({
      where: {
        cve: { [Op.in]: filter?.cves || [] },
      },
      attributes: ["id", "cve"],
    });
    const result = await getCveAffectedAssets(user.company_id, size, page, {
      search: filter?.search || "",
      severities: filter?.severities || "",
      cves: cves || [],
      requiredCve: true,
      SortByCvesCounts: filter?.SortByCvesCounts || "desc",
    });
    res.status(200).json({
      status: true,
      message: "Success",
      Assets: result?.Assets || [],
      totalAssets: result?.totalAssetsCount || 0,
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};
export const getCompanySoftwareCVEs = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const query = {};
    if (filter.search) {
      query.cve = { [Op.like]: `%${filter.search}%` };
    }
    const { software_id } = req.params;

    const { rows: cves, count: totalCves } =
      await CVEsMysqlModel.findAndCountAll({
        distinct: "id",
        include: [
          {
            model: patchSQLModel,
            required: true,
            where: {
              software_id,
            },
            through: {
              attributes: [],
            },
          },
        ],

        offset: (page - 1) * size,
        limit: +size,
      });
    res
      .status(StatusCodes.OK)
      .json({ cves: cves || [], totalCves: totalCves || 0 });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
