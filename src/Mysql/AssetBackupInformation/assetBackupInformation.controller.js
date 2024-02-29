import { Op, QueryTypes } from "sequelize";
import HttpStatus from "http-status-codes";
import moment from "moment";
import {
  integrationCategoryType,
  integrationsNames,
} from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import { getCompanyIntegrationIds } from "../Integration/integration.service";
import saveAssetBackupInfoFromDruva from "./AssetBackupIntegrationsServices/DruvaBackup.service";
import AssetBackupInformationModel from "./assetBackupInformation.model";
import sequelize from "../db";

export const createAssetBackupInfo = async (asset, source) => {
  switch (source.sources_type) {
    case integrationsNames.DRUVA:
      await saveAssetBackupInfoFromDruva(asset, source);
      break;
    default:
    // code block
  }
};

export const BackupAssetsOverview = async (req, res) => {
  const { user } = req;
  try {
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.backup
    );
    const filterObj = { company_id: user.company_id };
    const totalBackupEndpoints = await assetSQLModel.count({
      distinct: "id",
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
    const dailyBackupTime = moment().subtract(24, "hours");
    const BackedUpDailyEndpointsCount = await assetSQLModel.count({
      distinct: "id",
      where: filterObj,
      include: [
        {
          model: assetSourcesModel,
          where: {
            integration_id: { [Op.in]: integrationIds },
          },

          required: true,
        },
        {
          model: AssetBackupInformationModel,
          where: {
            backup_end_time: { [Op.gte]: dailyBackupTime.toISOString() },
          },

          required: true,
        },
      ],
    });
    const notBackedUpDailyEndpointsCount = await assetSQLModel.count({
      distinct: "id",
      where: filterObj,
      include: [
        {
          model: assetSourcesModel,
          where: {
            integration_id: { [Op.in]: integrationIds },
          },

          required: true,
        },
        {
          model: AssetBackupInformationModel,
          where: {
            backup_end_time: { [Op.lt]: dailyBackupTime.toISOString() },
          },

          required: true,
        },
      ],
    });
    const notBackedUpEndpointsCount = await assetSQLModel.count({
      distinct: "id",
      where: filterObj,
      include: [
        {
          model: assetSourcesModel,
          where: {
            integration_id: { [Op.in]: integrationIds },
          },

          required: true,
        },
        {
          model: AssetBackupInformationModel,
          where: {
            backup_status: { [Op.ne]: "Completed" },
          },

          required: true,
        },
      ],
    });
    const osFiltersOptions = await sequelize.query(
      `SELECT DISTINCT ${`os_name`},os_family FROM ${`asset_backup_informations`}  WHERE ${`company_id`} = '${
        user.company_id
      }'`,
      { type: QueryTypes.SELECT }
    );

    res.status(HttpStatus.OK).json({
      osFiltersOptions,
      totalBackupEndpoints,
      BackedUpDailyEndpointsCount,
      notBackedUpDailyEndpointsCount,
      notBackedUpEndpointsCount,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    errorHandler(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};

export const getBackupAssets = async (req, res) => {
  const { user } = req;
  try {
    const filterObj = { company_id: user.company_id };
    const integrationIds = await getCompanyIntegrationIds(
      user.company_id,
      integrationCategoryType.backup
    );

    const backupFilter = { integration_id: { [Op.in]: integrationIds } };
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query.filter || "{}");
    // name filter
    if (filter?.name) {
      filterObj.asset_name = { [Op.like]: `%${filter?.name}%` };
    }
    if (filter?.os?.length > 0) {
      backupFilter.os_name = { [Op.in]: filter?.os };
    }
    if (filter?.status?.length > 0) {
      const status = [];
      if (filter?.status?.includes("backed_up_daily")) {
        status.push({
          backup_end_time: {
            [Op.gte]: moment().subtract(24, "hours").toISOString(),
          },
        });
      }
      if (filter?.status?.includes("Backed_up_in_a_while")) {
        status.push({
          backup_end_time: {
            [Op.lt]: moment().subtract(24, "hours").toISOString(),
          },
        });
      }
      if (filter?.status?.includes("Not-Backed_Up")) {
        status.push({
          backup_status: {
            [Op.ne]: "Completed",
          },
        });
      }
      backupFilter[Op.or] = status;
    }
    const includes = [
      {
        model: AssetBackupInformationModel,
        where: backupFilter,
        order: [["priority", "ASC"]],
        required: true,
      },
    ];

    const order = [];
    const sequence = Object.keys(filter).filter((el) =>
      ["sortby", "backup_date"].includes(el)
    );
    if (filter.sortby) {
      if (filter.sortby === "desc") {
        order[sequence.indexOf("sortby")] = ["asset_name", "DESC"];
      }
      if (filter.sortby === "asc") {
        order[sequence.indexOf("sortby")] = ["asset_name", "ASC"];
      }
    }
    if (filter.backup_date) {
      if (filter.backup_date === "desc") {
        order[sequence.indexOf("backup_date")] = [
          AssetBackupInformationModel,
          "backup_end_time",
          "DESC",
        ];
      }

      if (filter.backup_date === "asc") {
        order[sequence.indexOf("backup_date")] = [
          AssetBackupInformationModel,
          "backup_end_time",
          "ASC",
        ];
      }
    }

    const { count: totalCount, rows: tableData } =
      await assetSQLModel.findAndCountAll({
        distinct: "id",
        where: filterObj,
        include: includes,
        offset: (page - 1) * size,
        limit: +size,
        order,
      });
    const assetIds = [];
    const assets = tableData.map((item) => {
      const backupInfo = item?.asset_backup_informations?.[0];
      item = JSON.parse(JSON.stringify(item));
      assetIds.push(item.id);
      return {
        id: item.id,
        asset_name: item.asset_name,
        ...backupInfo.dataValues,
      };
    });
    res.status(HttpStatus.OK).json({
      page,
      size,
      totalCount,
      assets,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    errorHandler(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
