import { Op } from "sequelize";
import { getAutomoxPoliciesOfCompany } from "../../mongo/controllers/Automox/automoxPolicy.controller";
import automoxPolicyListModel from "../../mongo/models/Automox/automoxPolicy.model";
import { errorHandler } from "../../utils/errorHandler";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import { activitiesData } from "../Logs/logsConstant";
import patchingtGroupsSQLModel from "../PatchingGroups/patchingGroups.model";
import {
  savePolicyGroupData,
  updatePoliciesToGroups,
} from "../PolicyGroups/policyGroup.service";
import patchingPoliciesSQLModel from "./patchingPolicy.model";

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const oldAssets = await patchingPoliciesSQLModel.findAll({
      where: { company_id },
      order: [["updatedAt", "DESC"]],
    });
    const sourcesLastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
    for await (const item of items) {
      const data = {
        company_id: item.company_id,
        policy_id: item.id,
        name: item.name,
        policy_type_name: item.policy_type_name,
        configuration: item.configuration,
        organization_id: item.organization_id,
        schedule_days: item.schedule_days,
        schedule_time: item.schedule_time,
        schedule_weeks_of_month: item.schedule_weeks_of_month,
        schedule_months: item.schedule_months,
        server_groups: item.server_groups,
        notes: item.notes,
        status: item.status,
      };
      const policy = await patchingPoliciesSQLModel.findOne({
        where: { policy_id: data.policy_id, company_id: data.company_id },
      });
      i++;
      if (policy) {
        await patchingPoliciesSQLModel.update(data, {
          where: {
            id: policy.id,
          },
        });
      } else {
        await patchingPoliciesSQLModel.create(data);
      }
      // Save Assigned groups to Policy data
      await savePolicyGroupData(company_id, item.server_groups, item.id);

      const percentage = (i * 100) / items.length;
      console.log("policy save to db", percentage, "%done...");
    }
    await updatePoliciesToGroups(company_id);
    if (oldAssets.length > 0) {
      const deleteAssets = await patchingPoliciesSQLModel.destroy({
        where: {
          company_id,
          updatedAt: { [Op.lte]: sourcesLastUpdatedAtDate },
        },
      });
      // console.log("delete groups", deleteAssets);
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const SaveAutomoxPoliciesForCompany = async (company) => {
  await automoxPolicyListModel
    .find({ company_id: company.id })
    .then(async (data) => {
      await updateOrCreate(data, company.id);
    })
    .catch((error) => error.message);
};

export const saveData = async (company, clientDetails, payload, body) => {
  try {
    // to get lastes data from automax and save in our database
    await getAutomoxPoliciesOfCompany(company).then(async () => {
      await SaveAutomoxPoliciesForCompany(company);
    });
    const data = patchingPoliciesSQLModel.findOne({
      where: {
        id: payload.name,
      },
    });
    // Event Logs Handler
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      activitiesData.AuditActivity.activities.createPolicyLog.status
        .createPolicySuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(data)),
        patchingPoliciesSQLModel.tableName
      )
    );
  } catch (error) {
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      activitiesData.AuditActivity.activities.createPolicyLog.status
        .createPolicyFailed.code,
      null,
      error.message
    );
  }
};

export const getGroupByID = async (item) => {
  const data = [];
  await patchingtGroupsSQLModel
    .findOne({
      where: {
        id: item,
      },
    })
    .then(async (res) => {
      data.push(parseInt(res.group_id, 10));
    });
  return data;
};

export const getPolicyData = async (body) => {
  const data = patchingPoliciesSQLModel.findOne({
    where: {
      id: body.id,
    },
  });
  return data;
};

export const updatePolicy = async (payload, policyData, clientDetails) => {
  try {
    const data = await patchingPoliciesSQLModel.update(payload, {
      where: {
        policy_id: policyData.policy_id,
      },
    });
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      activitiesData.AuditActivity.activities.editPolicyLog.status
        .editPolicySuccessfully.code,
      createEventPayload(
        JSON.parse(JSON.stringify(data)),
        {},
        patchingPoliciesSQLModel.tableName
      )
    );
  } catch (error) {
    const eventLogs = await addEventLog(
      { ...clientDetails, user_id: null },
      activitiesData.AuditActivity.activities.editPolicyLog.status
        .editPolicyFailed.code,
      null,
      error.message
    );
  }
};

export const deletePolicyWithID = async (policyData, clientDetails) => {
  try {
    const deleted = patchingPoliciesSQLModel.destroy({
      where: {
        id: policyData.id,
      },
    });
    if (clientDetails) {
      const eventLogs = await addEventLog(
        { ...clientDetails, user_id: null },
        activitiesData.AuditActivity.activities.deletePolicyLog.status
          .deletePolicySuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(deleted)),
          {},
          patchingPoliciesSQLModel.tableName
        )
      );
    }
    return deleted;
  } catch (error) {
    if (clientDetails) {
      const eventLogs = await addEventLog(
        { ...clientDetails, user_id: null },
        activitiesData.AuditActivity.activities.deletePolicyLog.status
          .deletePolicyFailed.code,
        null,
        error.message
      );
    }
  }
};

// program to convert decimal to binary
export function convertToBinary(x) {
  const binaryValue = Number(x).toString(2);
  return binaryValue;
}

export // program to convert binary to decimal
const convertToDec = (bin) => {
  const { length } = bin;
  let pos = length - 1;
  let conversion;
  let value;
  const convertedArr = [];

  for (let i = 0; i <= length - 1; i++) {
    if (
      parseInt(bin.charAt(i), 10) !== 0 &&
      parseInt(bin.charAt(i), 10) !== 1
    ) {
      // alert("Por favor, digite apenas 0 e 1.");
      return;
    }
    value = parseInt(bin.charAt(i), 10) * 2 ** pos;
    convertedArr.push(value);
    pos -= 1;
    conversion = convertedArr.reduce((acc, curr) => acc + curr, 0);
  }
  return conversion;
};

export const updateOrCreateSinglePolicy = async (
  item,
  company_id,
  id = null
) => {
  try {
    const data = {
      company_id,
      name: item.name,
      policy_type_name: item.policy_type_name,
      configuration: item.configuration,
      schedule_days: item.schedule_days,
      schedule_time: item.schedule_time,
      schedule_weeks_of_month: item.schedule_weeks_of_month,
      schedule_months: item.schedule_months,
      server_groups: item.server_groups,
      notes: item.notes,
      status: item.status,
    };
    const policy = await patchingPoliciesSQLModel.findOne({
      where: { id, company_id },
    });
    let policy_id = id;
    if (policy) {
      await patchingPoliciesSQLModel.update(data, {
        where: {
          id,
        },
      });
    } else {
      const policyData = await patchingPoliciesSQLModel.create(data);
      policy_id = policyData.id;
    }
    // Save Assigned groups to Policy data
    await savePolicyGroupData(company_id, item.server_groups, policy_id);
    return true;
  } catch (err) {
    errorHandler(err);
    // res.status(400).json({ err, message: err?.response?.data?.errors });
  }
};
