import {
  createApplicationCustomScoreActivity,
  deleteApplicationScoreWeightageActivity,
  UpdateApplicationScoreWeightageActivity,
} from "../../Logs/ActivitiesType/ApplicationActivites";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import ApplicationScoreWeightageModel from "./ApplicationScoreWeightage.model";

export const updateOrCreateApplicationScoreWeightage = async (
  weightage,
  client
) => {
  if (weightage?.id) {
    const methodologyInDB = await ApplicationScoreWeightageModel.findOne({
      where: {
        id: weightage.id,
      },
    });
    if (methodologyInDB.id) {
      await ApplicationScoreWeightageModel.update(weightage, {
        where: {
          id: weightage.id,
        },
      });
      const updatedMethodology = await ApplicationScoreWeightageModel.findOne({
        where: {
          id: weightage.id,
        },
      });
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `updated "${weightage.name}" application score weightage `,
          user_id: client?.client_id,
          asset_id: null,
          target_id: updatedMethodology.id,
          effected_table: ApplicationScoreWeightageModel.tableName,
          company_id: weightage.company_id,
          isSystemLog: false,
        },
        UpdateApplicationScoreWeightageActivity.status
          .ApplicationScoreWeightageUpdateSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(updatedMethodology)),
          JSON.parse(JSON.stringify(methodologyInDB)),
          ApplicationScoreWeightageModel.tableName
        )
      );
      return updatedMethodology;
    }
    throw Error("Methodology not available");
  }
  const getLastPriority = await ApplicationScoreWeightageModel.findAll({
    where: {
      company_id: weightage.company_id,
    },
    limit: 1,
    order: [["priority", "DESC"]],
  });
  const priority = getLastPriority?.[0]?.priority
    ? (getLastPriority?.[0]?.priority || 0) + 1
    : 1;
  const newMethodology = await ApplicationScoreWeightageModel.create({
    ...weightage,
    priority,
  });
  await addEventLog(
    {
      id: client?.client_id,
      email: client?.client_email,
      ipAddress: client?.ipAddress,
      process: `Created "${weightage.name}" application score weightage`,
      user_id: client?.client_id,
      asset_id: null,
      target_id: newMethodology.id,
      effected_table: ApplicationScoreWeightageModel.tableName,
      company_id: weightage.company_id,
      isSystemLog: false,
    },
    createApplicationCustomScoreActivity.status
      .successfully.code,
    createEventPayload(
      JSON.parse(JSON.stringify(newMethodology)),
      {},
      ApplicationScoreWeightageModel.tableName
    )
  );

  return newMethodology;
};

export const updatePriority = async (weightages, company_id, client) => {
  if (weightages?.length > 0) {
    for await (const weightage of weightages) {
      const methodologyInDB = await ApplicationScoreWeightageModel.findOne({
        where: {
          id: weightage.id,
        },
      });
      if (methodologyInDB?.id) {
      await ApplicationScoreWeightageModel.update(
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
          process: `Priority updated "${methodologyInDB.name}" application score weightage `,
          user_id: client?.client_id,
          asset_id: null,
          target_id: methodologyInDB.id,
          effected_table: ApplicationScoreWeightageModel.tableName,
          company_id: methodologyInDB.company_id,
          isSystemLog: false,
        },
        UpdateApplicationScoreWeightageActivity.status
          .ApplicationScoreWeightageUpdateSuccessfully.code,
        createEventPayload(
          { priority: weightage.priority },
          { priority: methodologyInDB.priority },
          ApplicationScoreWeightageModel.tableName
        )
      );
    }
    }
    return true;
  }
  return false;
};

const getListAndUpdatePriority = async (company_id, client_id) => {
  const weightages = await ApplicationScoreWeightageModel
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

export const deleteApplicationsScoreWeightageService = async (
  id,
  methodologyInDB,
  client
) => {
  if (id) {
    await ApplicationScoreWeightageModel.destroy({ where: { id } });
    await addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client?.ipAddress,
        process: `Deleted "${methodologyInDB.name}" assets score weightage`,
        user_id: client?.client_id,
        asset_id: null,
        target_id: methodologyInDB.id,
        effected_table: ApplicationScoreWeightageModel.tableName,
        company_id: methodologyInDB.company_id,
        isSystemLog: false,
      },
      deleteApplicationScoreWeightageActivity.status
        .ApplicationScoreWeightageDeletedSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(methodologyInDB)),
        ApplicationScoreWeightageModel.tableName
      )
    );
    await getListAndUpdatePriority(methodologyInDB.company_id, client);
    return true;
  }
  return false;
};
