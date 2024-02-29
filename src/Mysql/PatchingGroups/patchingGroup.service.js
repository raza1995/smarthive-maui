import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import assetSourcesModel from "../AssetSources/assetSources.model";
import GroupAssetsSQLModel from "../GroupsAssets/GroupsAsset.model";
import { createGroupLog, deleteGroupLog, editGroupLog } from "../Logs/ActivitiesType/assetsactivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";

import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import patchingtGroupsSQLModel from "./patchingGroups.model";

export const getGroupData = async (filterObj) => {
  const tableData = await patchingtGroupsSQLModel.findAll(filterObj);
  return tableData;
};

export const findGroupByCompanyID = async (company_id) => {
  const group = await patchingtGroupsSQLModel.findOne({
    where: {
      company_id,
      name: "Default",
    },
  });
  return group;
};

export const createPatchingGroup = async (groupData, clientDetails) => {
  try {
    const GroupData = await patchingtGroupsSQLModel.create(groupData);
    await addEventLog(
      { ...clientDetails, user_id: null },
      createGroupLog.status.createGroupSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(groupData)),
        patchingtGroupsSQLModel.tableName
      )
    );
    return GroupData;
  } catch (error) {
    await addEventLog(
      { ...clientDetails, user_id: null },
      createGroupLog.status.createGroupFailed.code,
      null
    );
  }
};

export const findAsset = async (item) => {
  const patchingGroupData = await assetSourcesModel.findOne({
    where: {
      asset_id: item,
    },
  });
  return patchingGroupData;
};

export const addGroupAssetsData = async (item, groupData, company = null) => {
  try {
    const patchingGroupData = await findAsset(item);
    return new Promise(async (resolve, reject) => {
      const groupPayload = {
        asset_id: patchingGroupData.asset_id,
        patching_group_id: groupData.id,
        company_id: company.id,
      };
      await GroupAssetsSQLModel.create(groupPayload)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(true);
        });
    });
  } catch (error) {
    errorHandler(error)
  }
};

export const findOldGroups = async (company_id, body) => {
  const count = await patchingtGroupsSQLModel.count({
    where: {
      company_id,
      name: body.name,
    },
  });
  return count;
};

export const findGroupByGroupId = async (body) => {
  const group = patchingtGroupsSQLModel.findOne({
    where: {
      id: body.id,
    },
  });
  return group;
};

export const UpdateGroup = async (payload, grp_data, clientDetails) => {
  try {
    await patchingtGroupsSQLModel.update(payload, {
      where: { id: grp_data.id },
    });
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      editGroupLog.status.editGroupSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(grp_data)),
        patchingtGroupsSQLModel.tableName
      )
    );
  } catch (error) {
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      editGroupLog.status.editGroupFailed.code,
      null,
      error.message
    );
  }
};

export const deleteGroupByID = async (group, clientDetails, res) => {
  await patchingtGroupsSQLModel
    .destroy({
      where: { id: group.dataValues.id },
    })
    .then(async () => {
      // Event Logs Handler
      await addEventLog(
        { ...clientDetails, user_id: null },
        deleteGroupLog.status.deleteGroupSuccessfully.code,
        createEventPayload(
          {},
          JSON.parse(JSON.stringify(group)),
          patchingtGroupsSQLModel.tableName
        )
      );
      return res.status(200).json({ message: "Group deleted successfully" });
    })
    .catch(async (err) => {
      await addEventLog(
        { ...clientDetails, user_id: null },
        deleteGroupLog.status.deleteGroupFailed.code,
        null,
        err.message
      );
      return res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
};

export const addDevicesToGroup = async (
  devices,
  groupData,
  company_id,
  clientDetails
) => {
  try {
    const devicesArray = devices;
    console.log("devicesArray", devicesArray)
    console.log("devicesArray", devicesArray);
    await GroupAssetsSQLModel.destroy({
      where: {
        patching_group_id: groupData.id,
        company_id,
      },
    });
    for await (const item of devicesArray) {
      const groupPayload = {
        asset_id: item,
        patching_group_id: groupData.id,
        company_id,
      };
      console.log("groupPayload", groupPayload)
      await GroupAssetsSQLModel.create(groupPayload)
        .then(async (res) => {
          console.log("res");
        })
        .catch((err) => {
          errorHandler(err);
        });
    }

    await patchingtGroupsSQLModel
      .update(
        { devices: devicesArray },
        {
          where: {
            id: groupData.id,
          },
        }
      )
      .then((res) => {
        console.log("ressssssss");
      })
      .catch((err) => {
        console.log("errrrrr");
      });
  } catch (err) {
    return err;
  }
};

export const getPoliciesbyIds = async (policies) => {
  const data = await patchingPoliciesSQLModel.findAll({
    where: {
      id: { [Op.in]: [policies] },
    },
    attributes: ["id"],
  });
  const policyData = data.map((item) => item.policy_id);
  return policyData || [];
};
