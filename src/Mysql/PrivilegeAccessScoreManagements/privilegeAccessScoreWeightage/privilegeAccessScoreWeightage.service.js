import {
  createPrivilegeAccessScoreWeightageActivity,
  deletePrivilegeAccessScoreWeightageActivity,
  UpdatePrivilegeAccessScoreWeightageActivity,
} from "../../Logs/ActivitiesType/SecretsActivityType";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import { updateOrCreatePrivilegeAccessScoreWeightageTags } from "../privilegeAccessScoreWeightageTags/privilegeAccessScoreWeightageTags.service";
import { updateOrCreatePrivilegeAccessScoreWeightageTypes } from "../privilegeAccessScoreWeightageTypes/privilegeAccessScoreWeightageTypes.service";
import privilegeAccessScoreWeightage from "./privilegeAccessScoreWeightage.model";

export const updateOrCreatePrivilegeScoreWeightage = async (
  weightage,
  client
) => {
  if (weightage?.id) {
    const methodologyInDB = await privilegeAccessScoreWeightage.findOne({
      where: {
        id: weightage.id,
      },
    });
    if (methodologyInDB.id) {
      await privilegeAccessScoreWeightage.update(weightage, {
        where: {
          id: weightage.id,
        },
      });

      const updatedMethodology = await privilegeAccessScoreWeightage.findOne({
        where: {
          id: weightage.id,
        },
      });
      if (!weightage.apply_on_all_secrets) {
        await updateOrCreatePrivilegeAccessScoreWeightageTags(
          weightage.secrets_tags?.map((tag) => tag.label),
          updatedMethodology.company_id,
          updatedMethodology.id
        );
        await updateOrCreatePrivilegeAccessScoreWeightageTypes(
          weightage.secrets_types,
          updatedMethodology.id
        );
      }
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Updated "${weightage.name}" privilege access score weightage `,
          user_id: client?.client_id,
          asset_id: null,
          target_id: updatedMethodology.id,
          effected_table: privilegeAccessScoreWeightage.tableName,
          company_id: weightage.company_id,
          isSystemLog: false,
        },
        UpdatePrivilegeAccessScoreWeightageActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(updatedMethodology)),
          JSON.parse(JSON.stringify(methodologyInDB)),
          privilegeAccessScoreWeightage.tableName
        )
      );

      return updatedMethodology;
    }
    throw Error("Methodology not available");
  }
  const getLastPriority = await privilegeAccessScoreWeightage.findAll({
    where: {
      company_id: weightage.company_id,
    },
    limit: 1,
    order: [["priority", "DESC"]],
  });
  const priority = getLastPriority?.[0]?.priority
    ? (getLastPriority?.[0]?.priority || 0) + 1
    : 1;
  const newMethodology = await privilegeAccessScoreWeightage.create({
    ...weightage,
    priority,
  });
  if (!weightage.apply_on_all_secrets) {
    await updateOrCreatePrivilegeAccessScoreWeightageTags(
      weightage.secrets_tags?.map((tag) => tag.label).Error,
      newMethodology.company_id,
      newMethodology.id
    );
    await updateOrCreatePrivilegeAccessScoreWeightageTypes(
      weightage.secrets_types,
      newMethodology.id
    );
  }
  await addEventLog(
    {
      id: client?.client_id,
      email: client?.client_email,
      ipAddress: client?.ipAddress,
      process: `Created "${weightage.name}" privilege access score weightage`,
      user_id: client?.client_id,
      asset_id: null,
      target_id: newMethodology.id,
      effected_table: privilegeAccessScoreWeightage.tableName,
      company_id: weightage.company_id,
      isSystemLog: false,
    },
    createPrivilegeAccessScoreWeightageActivity.status.Successfully.code,
    createEventPayload(
      JSON.parse(JSON.stringify(newMethodology)),
      {},
      privilegeAccessScoreWeightage.tableName
    )
  );

  return newMethodology;
};

export const updatePriority = async (weightages, company_id, client) => {
  if (weightages?.length > 0) {
    for await (const weightage of weightages) {
      const methodologyInDB = await privilegeAccessScoreWeightage.findOne({
        where: {
          id: weightage.id,
        },
      });
      if (methodologyInDB?.id) {
        await privilegeAccessScoreWeightage.update(
          { priority: weightage.priority },
          {
            where: {
              id: weightage.id,
              company_id,
            },
          }
        );
        await addEventLog(
          {
            id: client?.client_id,
            email: client?.client_email,
            ipAddress: client?.ipAddress,
            process: `Priority updated "${methodologyInDB.name}" assets score weightage `,
            user_id: client?.client_id,
            asset_id: null,
            target_id: methodologyInDB.id,
            effected_table: privilegeAccessScoreWeightage.tableName,
            company_id: methodologyInDB.company_id,
            isSystemLog: false,
          },
          UpdatePrivilegeAccessScoreWeightageActivity.status.Successfully.code,
          createEventPayload(
            { priority: weightage.priority },
            { priority: methodologyInDB.priority },
            privilegeAccessScoreWeightage.tableName
          )
        );
      }
    }
    return true;
  }
  return false;
};

const getListAndUpdatePriority = async (company_id, client_id) => {
  const weightages = await privilegeAccessScoreWeightage
    .findAll({
      where: {
        company_id,
      },
      order: [["priority", "ASC"]],
    })
    .then((resp) =>
      resp.map((item, index) => ({ id: item.id, priority: index + 1 }))
    );
  await updatePriority(weightages, company_id, client_id);
};

export const deletePrivilegeAccessScoreWeightageService = async (
  id,
  methodologyInDB,
  client
) => {
  if (id) {
    await privilegeAccessScoreWeightage.destroy({ where: { id } });
    await addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client?.ipAddress,
        process: `Deleted "${methodologyInDB.name}" privilege access score weightage`,
        user_id: client?.client_id,
        asset_id: null,
        target_id: methodologyInDB.id,
        effected_table: privilegeAccessScoreWeightage.tableName,
        company_id: methodologyInDB.company_id,
        isSystemLog: false,
      },
      deletePrivilegeAccessScoreWeightageActivity.status.Successfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(methodologyInDB)),
        privilegeAccessScoreWeightage.tableName
      )
    );
    await getListAndUpdatePriority(methodologyInDB.company_id, client);
    return true;
  }
  return false;
};
