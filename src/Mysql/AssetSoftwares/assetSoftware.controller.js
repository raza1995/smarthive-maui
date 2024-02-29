import { StatusCodes } from "http-status-codes";
import { QueryTypes, Sequelize, Op } from "sequelize";
import moment from "moment";
import {
  integrationCategoryType,
  integrationsNames
} from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import assetPatchSQLModel from "../AssetPatches/assetPatch.model";
import assetSQLModel from "../Assets/assets.model";
import { getSourceValidation } from "../Assets/assets.service";
import sequelize from "../db";
import { getIntegrationsByType } from "../Integration/integration.service";
import { getSoftwares } from "../Logs/ActivitiesType/userActivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import patchSQLModel from "../Patch/patch.model";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";
import { findUserOAuthId } from "../Users/users.service";
import assetSoftwareSQLModel from "./assetSoftware.model";
import { getAndSaveAutomoxSoftwareForCompany } from "./SoftwareAPIsServices/automoxSoftwareApi.service";
import { getAndSaveMalwareByteSoftwareForCompany } from "./SoftwareAPIsServices/malwareByteSoftwareApi.service";
import { getAndSaveMicrosoftSoftwareForCompany } from "./SoftwareAPIsServices/microsoftSoftwareApi.service";

export const getAssetSoftwareForDevice = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    let filterObj = { company_id: user.company_id };
    if (id !== "all") {
      filterObj.asset_id = id;
    }
    const osFilterObj = { company_id: user.company_id };

    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query.filter);
    // search filter name
    if (filter?.search) {
      filterObj = {
        ...filterObj
        // [Op.or]: [{ 'softwares.name': { [Op.like]: `%${filter?.search}%` } }]
      };
    }
    // name filter
    if (filter?.name) {
      filterObj = {
        ...filterObj,
        [Op.or]: [
          { display_name: { [Op.like]: `%${filter?.name}%` } },
          { name: { [Op.like]: `%${filter?.name}%` } }
        ]
      };
    }
    // severity column
    if (filter?.severity?.length > 0) {
      filterObj.severity = { [Op.or]: filter?.severity };
    }

    // Os name filter
    if (filter?.osType?.length > 0) {
      filterObj.os_name = { [Op.or]: filter?.osType };
    }
    console.log(filter, filterObj);

    const softwareNestedFilter = {};
    const severityNestedFilter = {};
    let assetPatchRequired = false;
    // Software Name Filter
    if (filter?.searchFilter?.length > 0) {
      const softwareName = [];
      const severityFilter = [];
      filter?.searchFilter.forEach((element) => {
        console.log("element", element);
        if (element.attribute === "softwareName") {
          softwareName.push(element.value);
          // return element.value
        }
        if (
          element.attribute === "assetPatch" &&
          element.value !== null &&
          element.value === 1
        ) {
          assetPatchRequired = true;
        }
        if (element.attribute === "severity" && element.value !== null) {
          severityFilter.push(element.value);
        }
      });
      softwareNestedFilter.name = {
        [Op.or]: softwareName
      };
      severityNestedFilter.severity = {
        [Op.or]: severityFilter
      };
    }

    console.log("softwareNestedFilter", softwareNestedFilter);

    if (filter?.search) {
      softwareNestedFilter.name = { [Op.like]: `%${filter?.search}%` };
    }

    const osFilters = await sequelize.query(
      `SELECT DISTINCT ${`os_name`} FROM ${`software_packages`} `,
      { type: QueryTypes.SELECT }
    );
    const { count: totalCount, rows: tableData } =
      await assetSoftwareSQLModel.findAndCountAll({
        distinct: "id",
        where: filterObj,
        include: [
          {
            model: softwareSQLModel,
            where: softwareNestedFilter
          },
          {
            model: softwarePackagesQLModel,
            required: assetPatchRequired,
            include: [
              {
                model: patchSQLModel,
                where: severityNestedFilter,
                required: assetPatchRequired
              }
            ]
          },
          {
            model: assetSQLModel
          }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT COUNT(id) FROM patches WHERE  patches.package_id= asset_softwares.package_id AND patches.software_id= asset_softwares.software_id )`
              ),
              "patchAvailable"
            ]
          ]
        },
        order: [[sequelize.literal("patchAvailable"), "DESC"]],
        offset: (page - 1) * size,
        limit: +size
      });

    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Resilence Patching Asset Softwares",
      company_id: user.company_id
    };
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      getSoftwares.status.softwareGetSuccessfully.code,
      null
    );

    tableData.map((el) => {
      if (
        el.software_package?.version ===
        el?.software_package?.patch?.patch_version
      ) {
        el.software_package.patch.patch_available_timestamp =
          moment().format("YYYY-MM-DD");
      }
      return true;
    });

    res.status(StatusCodes.OK).json({
      osFilters,
      page,
      size,
      totalCount,
      tableData
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, massage: err.message });
  }
};

export const getAllSoftwareOfCompany = async (req, res) => {
  try {
    const { user } = req;
    const SourceValidation = await getSourceValidation(user.company_id, []);
    let filterObj = {};
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query.filter);
    let sort = "ASC";
    let assetCountSort = "ASC";
    let sortColumn = "name";
    // search filter name
    if (filter?.search) {
      filterObj = {
        ...filterObj
        // [Op.or]: [{ 'softwares.name': { [Op.like]: `%${filter?.search}%` } }]
      };
    }
    // name filter
    // if (filter?.name) {
    //     filterObj = { ...filterObj, [Op.or]: [{ "name": { [Op.like]: `%${filter?.name}%` } }] }
    // }
    // sort_asset_linked column
    // if (filter?.sort_asset_linked?.length > 0) {
    //     filterObj.sort_asset_linked = { [Op.or]: filter?.sort_asset_linked }
    // }
    let sortQuery = ["createdAt", "ASC"];
    if (filter?.sort) {
      sort = filter?.sort === "asc" ? "ASC" : "DESC";
      sortColumn = "name";
      sortQuery = [softwareSQLModel, sortColumn, sort];
    }
    if (filter?.sort_asset_linked) {
      assetCountSort = filter?.sort_asset_linked === "asc" ? "ASC" : "DESC";
      sortQuery = ["assetsCount", assetCountSort];
    }

    console.log("sortQuery", sortQuery);
    // Os name filter
    if (filter?.osType?.length > 0) {
      filterObj.os_name = { [Op.or]: filter?.osType };
    }
    console.log(filter, filterObj, filter?.osType?.length);
    const totalCount = await softwarePackagesQLModel.count({
      where: filterObj,
      include: [
        {
          model: assetSoftwareSQLModel,
          where: { company_id: user.company_id },
          attributes: ["company_id"],
          required: true,
          include: [
            {
              model: assetSQLModel,
              required: true,
              include: [
                {
                  ...SourceValidation
                }
              ]
            }
          ]
        },
        {
          model: softwareSQLModel,
          where: filter?.name
            ? { [Op.or]: [{ name: { [Op.like]: `%${filter?.name}%` } }] }
            : "",
          attributes: ["name", "vendor_name"]
        }
        // { model: assetPatchSQLModel, include: [{ model: patchSQLModel, }] }
      ]
    });
    const osFilters = await sequelize.query(
      `SELECT DISTINCT ${`os_name`} FROM ${`software_packages`} `,
      { type: QueryTypes.SELECT }
    );
    console.log("totalCount", totalCount);
    const tableData = await softwarePackagesQLModel.findAll({
      where: filterObj,
      raw: true,
      nest: true,
      subQuery: false,
      include: [
        {
          model: assetSoftwareSQLModel,
          where: { company_id: user.company_id },
          // attributes: ["company_id", "id"],
          required: true,
          include: [
            {
              model: assetSQLModel,
              required: true,
              include: [
                {
                  ...SourceValidation
                }
              ]
            }
          ]
        },
        {
          model: softwareSQLModel,
          where: filter?.name
            ? { [Op.or]: [{ name: { [Op.like]: `%${filter?.name}%` } }] }
            : ""
          // attributes: ["name", "vendor_name", "id"],
        },
        { model: assetPatchSQLModel, include: [{ model: patchSQLModel }] }
      ],
      attributes: [
        "os_name",
        "id",
        "os_version",
        "version",
        "createdAt",
        "software_id",
        [
          sequelize.literal(
            `(SELECT COUNT(software_id) FROM asset_softwares WHERE asset_softwares.company_id = '${user.company_id}' && asset_softwares.software_id = software_packages.software_id)`
          ),
          "assetsCount"
        ]
      ],
      order: [sortQuery],

      offset: (page - 1) * size,
      limit: +size
    });
    // const data = await Promise.all(
    //   tableData.map(async (item) => {
    //     const assetCount = await assetSoftwareSQLModel.count({
    //       where: {
    //         software_id: item?.software?.id,
    //         company_id: user.company_id,
    //       },
    //     })
    //     return { ...item, assetsCount: assetCount }
    //   })
    // )

    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Resilence Company Softwares",
      company_id: user.company_id
    };
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getSoftwares.status.softwareGetSuccessfully.code,
      null
    );
    res.status(StatusCodes.OK).json({
      osFilters,
      page,
      size,
      totalCount,
      tableData
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, massage: err.message });
  }
};

export const getAssetSoftwareSearchFilter = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const filterObj = { company_id: user.company_id, asset_id: id };
    const osFilterObj = { company_id: user.company_id };
    const softwareNames = await assetSoftwareSQLModel
      .findAll({
        where: filterObj,
        attributes: [],
        raw: true,
        nest: true,
        include: [{ model: softwareSQLModel, attributes: [["name", "name"]] }]
      })
      .then((items) =>
        items.map((item) => ({
          label: item.software.name,
          value: item.software.name,
          attribute: "softwareName"
        }))
      );
    const status = [
      {
        label: "Installed",
        value: 0,
        attribute: "assetPatch"
      },
      {
        label: "Update Available",
        value: 1,
        attribute: "assetPatch"
      }
    ];
    // WHERE asset_id = ${id}
    const severity = await sequelize
      .query(`SELECT DISTINCT ${`severity`} FROM ${`patches`} `, {
        type: QueryTypes.SELECT
      })
      .then((items) =>
        items.map((item) => {
          console.log(item);
          return {
            label: item.severity,
            value: item.severity,
            attribute: "severity"
          };
        })
      );

    res.status(StatusCodes.OK).json({
      searchFilter: [...softwareNames, ...severity, ...status]
    });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, massage: err.message });
  }
};

export const getAllSoftwareNames = async (req, res) => {
  const { user } = req;
  const filterObj = {};
  const { query } = req;
  const { page } = query;
  const { size } = query;

  const tableData = await softwarePackagesQLModel.findAll({
    include: [
      {
        model: assetSoftwareSQLModel,
        where: { company_id: user.company_id },
        attributes: ["company_id", "id"],
        required: true
      },
      {
        model: softwareSQLModel,
        attributes: ["name", "vendor_name"]
      }
    ],
    offset: (page - 1) * size,
    limit: +size,
    nest: true
  });

  const softwareNames = tableData.map((item) => ({
    id: item.asset_softwares[0]?.id,
    label: item.software.name,
    value: item.software.name,
    attribute: "softwareName"
  }));

  const totalCount = await softwarePackagesQLModel.count({
    where: filterObj,
    include: [
      {
        model: assetSoftwareSQLModel,
        where: { company_id: user.company_id },
        attributes: ["company_id"],
        required: true
      },
      {
        model: softwareSQLModel,
        attributes: ["name", "vendor_name"]
      }
    ]
  });

  res.status(StatusCodes.OK).json({
    page,
    size,
    totalCount,
    tableData: softwareNames
  });
};

export const saveSoftwaresToMySqlOfCompany = async (company) => {
  console.log("company", company);
  const patchingIntegrations = await getIntegrationsByType(
    company.id,
    integrationCategoryType.patching
  );
  if (company.integrations.integration_name === integrationsNames.MICROSOFT) {
    await getAndSaveMicrosoftSoftwareForCompany(company);
  } else if (patchingIntegrations.length > 0) {
    for (let i = 0; i < patchingIntegrations.length; i++) {
      const integration = patchingIntegrations[i];
      if (integration.integration_name === integrationsNames.MALWAREBYTES) {
        await getAndSaveMalwareByteSoftwareForCompany(company, integration);
      } else if (
        integration.integration_name === integrationsNames.AUTOMOX ||
        integration.integration_category_type ===
          integrationCategoryType.patching
      ) {
        await getAndSaveAutomoxSoftwareForCompany(company);
      }
    }
  }
};
