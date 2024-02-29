import { Op } from "sequelize";
import {
  getAllCompaniesHaveIntegration,
  getCompanyWithIntegtation,
} from "../Companies/company.service";
import automoxServerGroupModel from "../../mongo/models/Automox/automoxServerGroups.model";
import patchingtGroupsSQLModel from "./patchingGroups.model";
import { integrationsNames } from "../../utils/constants";
import { findIntegration } from "../Assets/assets.service";
import { findUserOAuthId } from "../Users/users.service";
import {
  addEventLog,
} from "../Logs/eventLogs/eventLogs.controller";

import assetSourcesModel from "../AssetSources/assetSources.model";
import {
  addDevicesToGroup,
  createPatchingGroup,
  deleteGroupByID,
  findGroupByCompanyID,
  findGroupByGroupId,
  findOldGroups,
  getGroupData,
  UpdateGroup,
} from "./patchingGroup.service";
import GroupAssetsSQLModel from "../GroupsAssets/GroupsAsset.model";
import assetSQLModel from "../Assets/assets.model";
import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import PolicyGroupsSQLModel from "../PolicyGroups/PolicyGroups.model";
import { onlyUnique } from "../Assets/asset.controller";
import IntegrationModel from "../Integration/integration.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import AssetDetailModel from "../AssetDetails/assetDetail.model";
import { getCompanyAssetTagsByFilter } from "../AssetTags/assetTags.service";
import { getGroupLog } from "../Logs/ActivitiesType/assetsactivities";
import { errorHandler } from "../../utils/errorHandler";

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const oldAssets = await patchingtGroupsSQLModel.findAll({
      where: { company_id },
      order: [["updatedAt", "DESC"]],
    });
    const sourcesLastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
    for await (const item of items) {
      const data = {
        company_id: item.company_id,
        server_group_id: item.wsus_config?.server_group_id,
        group_id: item.id,
        parent_server_group_id: item.parent_server_group_id,
        name: item.name,
        policies: item.policies,
        ui_color: item.ui_color,
      };
      const group = await patchingtGroupsSQLModel.findOne({
        where: { group_id: data.group_id, company_id: data.company_id },
      });
      i++;
      if (group) {
        await patchingtGroupsSQLModel.update(data, {
          where: {
            id: group.id,
          },
        });
      } else {
        await patchingtGroupsSQLModel.create(data);
      }
      const percentage = (i * 100) / items.length;
      // console.log("Group save to db", percentage, "%done...");
    }
    if (oldAssets.length > 0) {
      const deleteAssets = await patchingtGroupsSQLModel.destroy({
        where: {
          company_id,
          updatedAt: { [Op.lte]: sourcesLastUpdatedAtDate },
        },
      });
      console.log("delete groups", deleteAssets);
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const saveGroupsToMySqlOfCompany = async (company) => {
  await automoxServerGroupModel
    .find({ company_id: company.id })
    .then(async (data) => {
      await updateOrCreate(data, company.id);
    })
    .catch((error) => {
      console.log("error.message", error.message);
      return error.message;
    });
};
export const saveGroupsToMySql = async (req, res) => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.AUTOMOX
  );
  console.log("Companies", Companies);
  if (Companies) {
    if(res){ res.send("Automox devise data start successfully")}
    for await (const company of Companies) {
      await saveGroupsToMySqlOfCompany(company);
    }
  }
};



export const createGroup = async (req, res) => {
  // try {
    const {user} = req;
    const integration = await findIntegration(user);
    const { body } = req;
      // For logs
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Create Group",
        company_id: user.company_id,
      };
      // const url = `servergroups?o=${company.integrations?.integration_values?.organization_id}`;

      const findOldWithName = await findOldGroups(user.company_id, body);
      if (findOldWithName > 0) {
        res.status(400).json({
          error: true,
          message: "Group name already exists. Please use different name.",
        });
      } else {
        const group = await findGroupByCompanyID(user.company_id, "Default");
        const data = group;
        const payload = {
          company_id: user.company_id,
          name: body.name,
          refresh_interval: body.refresh_interval,
          ui_color: body.ui_color,
          notes: body.notes,
          enable_os_auto_update: body.enable_os_auto_update,
          enable_wsus: body.enable_wsus,
          wsus_server: body.wsus_server,
          policies: body.policies || [],
          devices: body.devices 
        };
        const grpData = await createPatchingGroup(payload, clientDetails);
        await addDevicesToGroup(
          body.devices,
          grpData,
          user.company_id,
          clientDetails
        ).then(() => {
          res.status(200).json({
            message: "Group created successfully",
            groupName: body.name,
          });
        });

        // await automoxAPI
        //   .post(url, payload)
        //   .then(async (response) => {
        //     const groupData = {
        //       company_id: company.id,
        //       group_id: response?.data?.id,
        //       server_group_id: response?.data?.wsus_config?.server_group_id,
        //       parent_server_group_id: response?.data?.parent_server_group_id,
        //       name: response?.data?.name,
        //       policies: policies || [],
        //       ui_color: response?.data?.ui_color,
        //       notes: response?.data?.notes,
        //       enable_os_auto_update: body.enable_os_auto_update,
        //       enable_wsus: body.enable_wsus,
        //       wsus_server: body.wsus_server,
        //       devices: response?.data?.devices,
        //     };
        //     const grpData = await createPatchingGroup(groupData, clientDetails);
        //     await addDevicesToGroup(
        //       response?.data.id,
        //       body.devices,
        //       company.integrations?.integration_values?.organization_id,
        //       integrationsNames.AUTOMOX,
        //       grpData,
        //       company,
        //       clientDetails
        //     ).then(() => {
        //       res.status(200).json({
        //         message: "Group created successfully",
        //         groupName: body.name,
        //       });
        //     });
        //   })
        //   .catch(async (error) => {
        //     res.status(400).json({ message: error.response?.data?.errors });
        //   });
      }

  // } catch (err) {
  //   res.status(400).json({ err, message: err.message });
  // }
};

export const editGroup = async (req, res) => {
  try {
    const {user} = req;
    // For logs
    const integration = await findIntegration(user);
    const { body } = req;

    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Edit Group",
      company_id: user.company_id,
    };
      const group = await findGroupByCompanyID(user.company_id, "Default");
      const payload = {
        name: body.name,
        refresh_interval: body.refresh_interval,
        ui_color: body.ui_color,
        notes: body.notes,
        enable_os_auto_update: body.enable_os_auto_update,
        enable_wsus: body.enable_wsus,
        wsus_server: body.wsus_server,
        policies: body.policies || [],
      };
      const grp_data = await findGroupByGroupId(body);
      await UpdateGroup(payload, grp_data, clientDetails);

      if (body.policies.length > 0) {
          await patchingPoliciesSQLModel
            .findAll({
              where: {
                id: { [Op.in]: body.policies },
              },
              attributes: ["id"],
            })
            .then(async (resp) => {
              if (resp !== null && resp.length > 0) {
                resp.map(async (policy) => {
                  await patchingtGroupsSQLModel
                    .findOne({
                      where: {
                        id: grp_data.id,
                      },
                      attributes: ["id"],
                    })
                    .then(async (group_data) => {
                      if (group_data !== null) {
                        const fyndLast = await PolicyGroupsSQLModel.count({
                          where: {
                            patching_group_id: group_data.id,
                            patching_policy_id: policy?.id,
                            company_id: user.company_id,
                          },
                        });
                        if (fyndLast === 0) {
                          const data = {
                            patching_group_id: group_data.id,
                            patching_policy_id: policy?.id,
                            company_id: user.company_id,
                          };
                          await patchingPoliciesSQLModel
                            .findOne({
                              where: {
                                id: policy.id,
                              },
                              attributes: ["id", "server_groups"],
                            })
                            .then(async (dataVal) => {
                              if (dataVal !== null) {
                                const array = dataVal.server_groups;
                                console.log("array", array)
                                array?.push(grp_data?.id); 
                                patchingPoliciesSQLModel.update(
                                  {
                                    server_groups: array.filter(onlyUnique),
                                  },
                                  {
                                    where: {
                                      id: policy.id,
                                    },
                                  }
                                );
                              }
                            });
                          await PolicyGroupsSQLModel.create(data);
                        }
                      }
                    });
                });
              }
            });
        }

        res.status(200).json({ message: "Group updated successfully" });

      // const url = `servergroups/${grp_data.group_id}?o=${company.integrations?.integration_values?.organization_id}`;
      // await automoxAPI
      //   .put(url, payload)
      //   .then(async (response) => {
      //     const groupData = {
      //       company_id: company.id,
      //       group_id: response?.data?.id,
      //       parent_server_group_id: response?.data?.parent_server_group_id,
      //       name: response?.data?.name,
      //       policies: policies || [],
      //       ui_color: response?.data?.ui_color,
      //     };
      //     await UpdateGroup(payload, grp_data, clientDetails);

      //     if (policies.length > 0) {
      //       await patchingPoliciesSQLModel
      //         .findAll({
      //           where: {
      //             id: { [Op.in]: policies },
      //           },
      //           attributes: ["id"],
      //         })
      //         .then(async (resp) => {
      //           if (resp !== null && resp.length > 0) {
      //             resp.map(async (policy) => {
      //               await patchingtGroupsSQLModel
      //                 .findOne({
      //                   where: {
      //                     id: grp_data.id,
      //                   },
      //                   attributes: ["id"],
      //                 })
      //                 .then(async (group_data) => {
      //                   if (group_data !== null) {
      //                     const fyndLast = await PolicyGroupsSQLModel.count({
      //                       where: {
      //                         patching_group_id: group_data.id,
      //                         patching_policy_id: policy?.id,
      //                         company_id: user.company_id,
      //                       },
      //                     });
      //                     if (fyndLast === 0) {
      //                       const data = {
      //                         patching_group_id: group_data.id,
      //                         patching_policy_id: policy?.id,
      //                         company_id: user.company_id,
      //                       };
      //                       await patchingPoliciesSQLModel
      //                         .findOne({
      //                           where: {
      //                             id: policy.id,
      //                           },
      //                           attributes: ["id", "server_groups"],
      //                         })
      //                         .then(async (dataVal) => {
      //                           if (dataVal !== null) {
      //                             const array = data.server_groups;
      //                             array.push(grp_data.id);

      //                             patchingPoliciesSQLModel.update(
      //                               {
      //                                 server_groups: array.filter(onlyUnique),
      //                               },
      //                               {
      //                                 where: {
      //                                   id: policy.id,
      //                                 },
      //                               }
      //                             );
      //                           }
      //                         });
      //                       await PolicyGroupsSQLModel.create(data);
      //                     }
      //                   }
      //                 });
      //             });
      //           }
      //         });
      //     }

      //     res.status(200).json({ message: "Group updated successfully" });
      //   })
      //   .catch(async (error) => {
      //     res.status(400).json({ error, message: error.response.data });
      //   });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const {user} = req;
    const integration = await findIntegration(user);
    const body = req.params;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Delete Group",
      company_id: user.company_id,
    };
    const group = await findGroupByGroupId(body);
    deleteGroupByID(group, clientDetails, res);
  } catch (err) {
    res.status(400).json({ err, message: "Something went wrongs" });
  }
};

export const groupsData = async (req, res) => {
  try {
    const {user} = req;
    const filterObj = { company_id: user.company_id };
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const filter = JSON.parse(query?.filter);
    if (filter?.search) {
      filterObj.name = { [Op.like]: `%${filter.search}%` };
    }
    const sortFilter = [["createdAt", "DESC"]];

    const tableData = await patchingtGroupsSQLModel.findAll({
      where: filterObj,
      offset: (page - 1) * size,
      limit: +size,
      order: sortFilter,
    });

    const totalCount = await patchingtGroupsSQLModel.count({
      where: filterObj,
    });

    res.status(200).json({
      valid: true,
      message: "Group fetch successfully",
      page,
      size,
      totalCount,
      tableData,
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const getGroupByID = async (req, res) => {
  try {
    const body = req.params;

    const relatedDevices = await GroupAssetsSQLModel.findAll({
      where: { patching_group_id: body.id },
    });
    const devices = [];
    for await (const item of relatedDevices) {
      const data = await assetSQLModel.findOne({
        where: { id: item.asset_id },
        include: [
          {
            model: AssetDetailModel,
          },
          {
            model: assetSourcesModel,
            where: {
              asset_id: item.asset_id,
            },
            required: true,
            include: [
              {
                model: IntegrationModel,
                // required: true,
                attributes: [],
              },
            ],
          },
          {
            model: AssetPatchingInformationModel,
            attributes: ["os_version"],
          },
        ],
      });
      const tags = await getCompanyAssetTagsByFilter({
        asset_id: item.asset_id,
      });
      
      if(data){
        const filteredData = {
          asset_name: data.asset_name,
          id: data.id,
          ipaddress: data.ipaddress,
          os_version: data?.asset_patching_informations[0]?.os_version,
          tags: tags || [],
        };
        devices.push(filteredData);
      }
    }
    await patchingtGroupsSQLModel
      .findOne({
        where: {
          id: body.id,
        },
      })
      .then((response) => {
        if (response === null) {
          return res.status(200).json({
            message: "Group not found",
          });
        }
        if (relatedDevices?.length) {
          response.dataValues.devices = devices;
        }
        return res.status(200).json({
          message: "fetch group successfully",
          group: response,
        });
      })
      .catch((err) =>
        res.status(500).json({
          message: err.message,
        })
      );
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, massage: err.message });
  }
};

export const addDeviceToOtherGroup = async (req, res) => {
  const {user} = req;
  const integration = await findIntegration(user);
  const { body } = req;
  const integrationName = integrationsNames.AUTOMOX;
  const { group } = body;
  const devices = body.device;
  // For logs
  const clientDetails = {
    id: user.id,
    email: user.email,
    ipAddress: req.socket.remoteAddress,
    process: "Move Group",
    company_id: user.company_id,
  };
  const groupData = await patchingtGroupsSQLModel.findOne({
    where: { id: group.id },
  });
  await addDevicesToGroup(
    devices,
    groupData,
    user.company_id,
    clientDetails
  )
    .then(() =>
      res.status(200).json({
        status: true,
        messsage: "Device move successfully",
        group_name: group.name,
        device: body.device.asset_name,
      })
    )
    .catch((err) =>
      res.status(500).json({
        status: false,
        messsage: "Something went wrong",
        error: err,
      })
    );
};

export const getAllGroups = async (req, res) => {
  try {
    const {user} = req;
    const company = await getCompanyWithIntegtation(user.company_id, "automox");
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Create Group",
      company_id: company.id,
    };
    const groups = await getGroupData({
      where: { company_id: user.company_id },
      attributes: ["id", "name"],
    });

    res.status(200).json({
      valid: true,
      message: "Group fetch successfully",
      groups,
    });
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      getGroupLog.status.getGroupSuccessfully.code
    );
  } catch (err) {
    // const eventLogs = await addEventLog(
    //   { ...clientDetails, user_id: null },
    //   getGroupLog.status.getGroupFailed.code,
    //   null,
    //   err.message
    // );
    res.status(400).json({ err, message: err.message });
  }
};
