import { CliProgressBar } from "../../../utils/cliProgressBar";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { getAuvikDeviceActivity } from "../../../Mysql/Logs/ActivitiesType/auvikActivities";
import { errorHandler } from "../../../utils/errorHandler";

require("dotenv").config();
const {
  default: companyService,
  getAllCompaniesHaveIntegration,
} = require("../../../Mysql/Companies/company.service");
const { default: Auvik, AuvikGet } = require("../../../api/auvik");
const deviceModel = require("../../models/auvik/device");
const { findQuery } = require("../../../utils/commonPipelines");
const { inventory, integrationsNames } = require("../../../utils/constants");
const { default: userService } = require("../../../Mysql/Users/users.service");

// ./controllers/product
const updateOrCreate = async (items, company_id, tenant_id) => {
  try {
    if (items?.length > 0) {
      let i = 0;
      const startTime = new Date();
      console.group("Auvike device fetched");
      if (tenant_id === "875629375448683261") {
        for await (const item of items) {
          await deviceModel.updateOne(
            { "attributes.deviceName": item.attributes.deviceName, company_id },
            { company_id, ...item },
            { upsert: true }
          );
          CliProgressBar(
            `Auvike device fetched company ID ${company_id}`,
            i,
            items.length,
            startTime
          );
          i++;
        }
      } else {
        for await (const item of items) {
          await deviceModel.updateOne(
            { id: item.id, company_id },
            { company_id, ...item },
            { upsert: true }
          );
          CliProgressBar(
            `Auvike device fetched company ID ${company_id}`,
            i,
            items.length,
            startTime,
            items.length + 10
          );
          i++;
        }
      }
      console.groupEnd();
    }

    console.log("done...");
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
const fetchAll = (page_id = null, auvikIntegration, company_id, baseUrl) => {
  let url = `${baseUrl}/${inventory.DEVICE}info?page[first]=1000&tenants=${auvikIntegration.tenant_id}`;
  if (page_id) {
    url = page_id;
  }
  console.log(url);
  return new Promise(async (resolve, reject) => {
    await AuvikGet(url, auvikIntegration)
      .then(async (response) => {
        console.log("Total device", response?.data?.data?.length || 0);
        if (
          await updateOrCreate(
            response?.data?.data,
            company_id,
            auvikIntegration.tenant_id
          )
        ) {
          resolve(response?.data.links);
        } else {
          resolve("Error occured");
        }
      })
      .catch((error) => {
        console.log("error.message", error?.message);
        resolve(error.message);
      });
  });
};

const deviceController = {
  async getAll(req, res) {
    let idParam = req.params?.id;

    if (idParam === "first") {
      const deviceData = await deviceModel
        .findOne({ "attributes.deviceType": "stack" })
        .exec();
      console.log(deviceData);
      if (deviceData) {
        idParam = deviceData.id;
      }
    }
    console.log("findQuery(idParam)", findQuery(idParam));
    deviceModel
      .aggregate([
        {
          $match: findQuery(idParam),
        },
        {
          $lookup: {
            from: "interfaces",
            localField: "id",
            foreignField: "relationships.parentDevice.data.id",
            as: "relationships.interfaces",
          },
        },
        {
          $lookup: {
            from: "device_warranties",
            localField: "id",
            foreignField: "id",
            as: "device_warranty",
          },
        },
        {
          $project: {
            name: "$attributes.deviceName",
            id: "$id",
            attributes: 1,
            interfaces_data: "$relationships.interfaces",
            device_warranty: "$device_warranty.attributes",
          },
        },
        {
          $unwind: {
            path: "$interfaces_data",
            includeArrayIndex: "version",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "interfaces",
            localField: "interfaces_data.id",
            foreignField: "id",
            as: "interface_details",
          },
        },
        {
          $lookup: {
            from: "interfaces",
            localField: "interface_details.relationships.connectedTo.data.id",
            foreignField: "id",
            as: "connected_interface_details",
          },
        },
        {
          $project: {
            id: 1,
            attributes: 1,
            name: 1,
            networks: 1,
            device_warranty: 1,
            interface_details: {
              $first: "$interface_details.attributes",
            },
            interface_connected_to: {
              $cond: [
                {
                  $gte: [
                    {
                      $size: {
                        $first:
                          "$interface_details.relationships.connectedTo.data",
                      },
                    },
                    1,
                  ],
                },
                "$interface_details.relationships.connectedTo.data",
                null,
              ],
            },
            interface_connected_interface: {
              $first:
                "$connected_interface_details.relationships.parentDevice.data",
            },
          },
        },
        {
          $lookup: {
            from: "devices",
            localField: "interface_connected_interface.id",
            foreignField: "id",
            as: "connected_interface_device",
          },
        },
        {
          $unwind: {
            path: "$interface_connected_to",
            includeArrayIndex: "interface_connect",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "interfaces",
            localField: "interface_connected_to.id",
            foreignField: "id",
            as: "connected_devices",
          },
        },
        {
          $lookup: {
            from: "devices",
            localField:
              "connected_interface_details.relationships.parentDevice.data.id",
            foreignField: "id",
            as: "connected_devices_details",
          },
        },
        {
          $group: {
            _id: "$id",
            name: {
              $first: "$name",
            },
            device_details: {
              $first: "$attributes",
            },
            interface_details: {
              $push: "$interface_details",
            },
            device_warranty: {
              $first: "$device_warranty",
            },
            interface_connection_details: {
              $addToSet: {
                $cond: [
                  {
                    $gte: [
                      {
                        $size: "$connected_devices",
                      },
                      1,
                    ],
                  },
                  {
                    $first: "$connected_devices",
                  },
                  null,
                ],
              },
            },
            interface_connected_devices: {
              $addToSet: {
                $cond: [
                  {
                    $gte: [
                      {
                        $size: "$connected_interface_device",
                      },
                      1,
                    ],
                  },
                  {
                    $first: "$connected_interface_device",
                  },
                  null,
                ],
              },
            },
          },
        },
        {
          $addFields: {
            interface_connection_details: {
              $filter: {
                input: "$interface_connection_details",
                as: "d",
                cond: {
                  $and: [
                    {
                      $ne: ["$$d", null],
                    },
                    {
                      $ne: ["$$d.attributes.interfaceType", "inferredWired"],
                    },
                    {
                      $ne: ["$$d.attributes.interfaceName", "br0"],
                    },
                  ],
                },
              },
            },
            connected_devices_details: {
              $filter: {
                input: "$interface_connected_devices",
                as: "d",
                cond: {
                  $and: [
                    {
                      $ne: ["$$d", null],
                    },
                  ],
                },
              },
            },
            interface_connected_unknown_devices: {
              $filter: {
                input: "$interface_connection_details",
                as: "d1",
                cond: {
                  $and: [
                    {
                      $eq: ["$$d1.attributes.interfaceType", "inferredWired"],
                    },
                  ],
                },
              },
            },
            interface_connected_br0: {
              $filter: {
                input: "$interface_connection_details",
                as: "d2",
                cond: {
                  $and: [
                    {
                      $eq: ["$$d2.attributes.interfaceName", "br0"],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            device_name: "$name",
            device_attributes: "$device_details",
            interfaces: "$interface_details",
            device_warranty: { $first: "$device_warranty" },
            interface_connected_to: "$interface_connection_details.attributes",
            interface_connected_unknown_devices: {
              id: { $first: "$interface_connected_unknown_devices.id" },
              data: {
                $first: "$interface_connected_unknown_devices.attributes",
              },
            },
            interface_connected_br0: {
              id: { $first: "$interface_connected_br0.id" },
              data: { $first: "$interface_connected_br0.attributes" },
            },
            // interface_parent_device: '$interface_connection_details.relationships.parentDevice.data',
            connected_devices_details_id: "$connected_devices_details.id",
            connected_devices_details: "$connected_devices_details.attributes",

            total_interface: {
              $size: "$interface_details",
            },
            total_interface_connected_with: {
              $size: "$interface_connection_details",
            },
            total_interface_connected_with_devices: {
              $size: "$connected_devices_details",
            },
          },
        },
        {
          $sort: {
            connected_devices_details_id: 1,
          },
        },
      ])
      .exec((err, products) =>
        res.json([...products, { totalRecords: products.length }])
      );
  },

  async allCount(req, res) {
    // Total, assets_at_risk, unknown assets
    deviceModel
      .aggregate([
        {
          $match: {
            "relationships.tenant.data.id": "774159416985035517",
          },
        },
        {
          $lookup: {
            from: "device_lifecycles",
            localField: "id",
            foreignField: "id",
            as: "lifecycles",
          },
        },
        {
          $project: {
            id: 1,
            type: 1,
            attributes: 1,
            lifecycles: { $first: "$lifecycles.attributes" },
          },
        },
        {
          $lookup: {
            from: "device_warranties",
            localField: "id",
            foreignField: "id",
            as: "warrenties",
          },
        },
        {
          $project: {
            id: 1,
            attributes: 1,
            type: 1,
            lifecycles: 1,
            warrenties: { $first: "$warrenties.attributes" },
            warrenty_version: {
              $convert: {
                input: {
                  $substr: ["$attributes.softwareVersion", 0, 2],
                },
                to: "int",
                onError: 0,
                onNull: 0,
              },
            },
            recommended_version: {
              $convert: {
                input: {
                  $substr: [
                    {
                      $first:
                        "$warrenties.attributes.recommendedSoftwareVersion",
                    },
                    0,
                    2,
                  ],
                },
                to: "int",
                onError: 0,
                onNull: 0,
              },
            },
            isLifecyles: {
              $cond: [
                {
                  $eq: ["$lifecycles.softwareMaintenanceStatus", "Expired"],
                },
                1,
                0,
              ],
            },
            isWarrenty: {
              $cond: [
                {
                  $eq: [
                    { $first: "$warrenties.attributes.warrantyCoverageStatus" },
                    "Expired",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
        {
          $project: {
            id: 1,
            attributes: 1,
            isRisk: {
              $or: [
                { $lt: ["$warrenty_version", "$recommended_version"] },
                { $ne: ["$warrenty_version", 0] },
                { $ne: ["$recommended_version", 0] },
              ],
            },
            total: {
              $cond: [
                {
                  $eq: ["$type", "device"],
                },
                1,
                0,
              ],
            },
            lifecycles: 1,
            warrenties: 1,
            unknown: {
              $cond: [
                {
                  $eq: ["$attributes.deviceType", "unknown"],
                },
                1,
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: "1",
            isRisk: {
              $sum: { $cond: ["$isRisk", 1, 0] },
            },
            total: {
              $sum: "$total",
            },
            unknown: {
              $sum: "$unknown",
            },
          },
        },
      ])
      .exec((err, products) => {
        if (err) {
          res.status(400).json({ valid: false, message: err.message });
        } else {
          res.status(200).json({ valid: true, message: "", data: products[0] });
        }
      });
  },

  all(req, res) {
    // Returns all products
    const que = req.query;
    const data = Object.keys(que).map((value, index) => {
      const newKey = `attributes.${value}`;
      return {
        [newKey]: {
          $regex: new RegExp(que[value]),
          $options: "i",
        },
      };
    });
    deviceModel
      .aggregate([
        {
          $match: data[0],
        },
        {
          $lookup: {
            from: "device_details",
            localField: "id",
            foreignField: "id",
            as: "device_details",
          },
        },
        {
          $lookup: {
            from: "device_lifecycles",
            localField: "id",
            foreignField: "id",
            as: "device_lifecycles",
          },
        },
      ])
      .sort("attributes.ipAddresses")
      .exec((err, products) => res.json([...products]));
  },

  byId(req, res) {
    const idParam = req.params.id;
    deviceModel
      .aggregate([
        {
          $match: findQuery(idParam),
        },
        {
          $lookup: {
            from: "device_details",
            localField: "id",
            foreignField: "id",
            as: "device_details",
          },
        },
        {
          $lookup: {
            from: "device_lifecycles",
            localField: "id",
            foreignField: "id",
            as: "device_lifecycles",
          },
        },
      ])
      .exec((err, products) =>
        res.json([...products, { totalRecords: products.length }])
      );
  },

  async import(req, res) {
    try {
      const Companies = await getAllCompaniesHaveIntegration(
        integrationsNames.AUVIK
      );
      if (Companies) {
        if (res) {
          res.send("Device fetch started successfully");
        }
        for await (const company of Companies) {
          console.log(company);
          let pageUrl = null;
          const integration = company.integrations.integration_values;
          const baseUrl = company.integrations.integrations_base_url.base_url;
          const oldData = await deviceModel
            .find({
              company_id: company.id,
            })
            .sort({ updatedAt: -1 });
          const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
          if (integration.tenant_id) {
            do {
              const info = await fetchAll(
                pageUrl,
                integration,
                company.id,
                baseUrl
              );
              console.log(info);
              if (info?.next) {
                pageUrl = info.next;
              } else {
                pageUrl = null;
              }
            } while (pageUrl != null);
          }
          if (oldData?.length > 0) {
            const deleteAssets = await deviceModel.deleteMany({
              company_id: company.id,
              updatedAt: { $lte: lastUpdatedAtDate },
            });
            console.log("delete assets", deleteAssets.deletedCount);
          }
          await addEventLog(
            {
              client_id: null,
              client_email: null,
              process: "get auvik devices",
              user_id: null,
              company_id: company.id,
              isSystemLog: true,
            },
            getAuvikDeviceActivity.status.getAuvikDeviceSuccessfully.code
          );
        }
        return true;
      }
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get auvik devices",
          user_id: null,
          isSystemLog: true,
        },
        getAuvikDeviceActivity.status.getAuvikDeviceFailed.code,
        null,
        "No company with auvik integration is available"
      );
      if (res) {
        res.send("No company with auvik integration is available");
      }
    } catch (error) {
      errorHandler(error);
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get auvik devices",
          user_id: null,
          isSystemLog: true,
        },
        getAuvikDeviceActivity.status.getAuvikDeviceFailed.code,
        null,
        error.message
      );
      if (res) {
        res.status(503).json(error);
      }
    }

    const countRecords = await deviceModel.countDocuments({});
    console.log(`Total Records Saved ${countRecords}`);
  },

  async deviceCategories(req, res) {
    const user = await userService.findUserOAuthId(req.user.sub);
    if (user) {
      const company = await companyService.getCompanyByFilter({
        id: user.company_id,
      });
      // Returns all products
      const que = req.query;
      const data = Object.keys(que).map((value, index) => {
        const newKey = `attributes.${value}`;
        return {
          [newKey]: {
            $regex: new RegExp(que[value]),
            $options: "i",
          },
        };
      });
      deviceModel
        .aggregate([
          {
            $match: {
              "relationships.tenant.data.id": "774159416985035517",
            },
          },
          {
            $group: {
              _id: {
                type: "$attributes.deviceType",
              },
              name: {
                $first: "$attributes.deviceType",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              name: 1,
            },
          },
        ])
        .exec((err, products) => res.json(products));
    } else {
      res.status(200).json({});
    }
  },
};

export default deviceController;
