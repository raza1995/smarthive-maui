import {
  createHumanCustomScoreActivity,
  deleteHumanScoreWeightageActivity,
  UpdateHumanScoreWeightageActivity,
} from "../../Logs/ActivitiesType/humanActivities";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import HumanScoreWeightageModel from "./HumanScoreWeightage.model";

export const updateOrCreateHumanScoreWeightage = async (weightage, client) => {
  if (weightage?.id) {
    const methodologyInDB = await HumanScoreWeightageModel.findOne({
      where: {
        id: weightage.id,
      },
    });
    if (methodologyInDB.id) {
      await HumanScoreWeightageModel.update(weightage, {
        where: {
          id: weightage.id,
        },
      });
      const updatedMethodology = HumanScoreWeightageModel.findOne({
        where: {
          id: weightage.id,
        },
      });
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Updated "${weightage.name}" human score weightage `,
          user_id: client?.client_id,
          asset_id: null,
          target_id: updatedMethodology.id,
          effected_table: HumanScoreWeightageModel.tableName,
          company_id: weightage.company_id,
          isSystemLog: false,
        },
        UpdateHumanScoreWeightageActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(updatedMethodology)),
          JSON.parse(JSON.stringify(methodologyInDB)),
          HumanScoreWeightageModel.tableName
        )
      );
      return updatedMethodology;
    }
    throw Error("Methodology not available");
  }
  const getLastPriority = await HumanScoreWeightageModel.findAll({
    where: {
      company_id: weightage.company_id,
    },
    limit: 1,
    order: [["priority", "DESC"]],
  });
  const priority = getLastPriority?.[0]?.priority
    ? (getLastPriority?.[0]?.priority || 0) + 1
    : 1;
  const newMethodology = await HumanScoreWeightageModel.create({
    ...weightage,
    priority,
  });
  await addEventLog(
    {
      id: client?.client_id,
      email: client?.client_email,
      ipAddress: client?.ipAddress,
      process: `Created "${weightage.name}" human score weightage`,
      user_id: client?.client_id,
      asset_id: null,
      target_id: newMethodology.id,
      effected_table: HumanScoreWeightageModel.tableName,
      company_id: weightage.company_id,
      isSystemLog: false,
    },
    createHumanCustomScoreActivity.status.Successfully.code,
    createEventPayload(
      JSON.parse(JSON.stringify(newMethodology)),
      {},
      HumanScoreWeightageModel.tableName
    )
  );

  return newMethodology;
};

export const updatePriority = async (weightages, company_id, client) => {
  if (weightages?.length > 0) {
    for await (const weightage of weightages) {
      const methodologyInDB = await HumanScoreWeightageModel.findOne({
        where: {
          id: weightage.id,
        },
      });
      if (methodologyInDB?.id) {
        await HumanScoreWeightageModel.update(
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
            process: `Priority updated "${methodologyInDB.name}" human score weightage `,
            user_id: client?.client_id,
            asset_id: null,
            target_id: methodologyInDB.id,
            effected_table: HumanScoreWeightageModel.tableName,
            company_id: methodologyInDB.company_id,
            isSystemLog: false,
          },
          UpdateHumanScoreWeightageActivity.status.Successfully.code,
          createEventPayload(
            { priority: weightage.priority },
            { priority: methodologyInDB.priority },
            HumanScoreWeightageModel.tableName
          )
        );
      }
    }
    return true;
  }
  return false;
};

const getListAndUpdatePriority = async (company_id, client_id) => {
  const weightages = await HumanScoreWeightageModel.findAll({
    where: {
      company_id,
    },
    order: [["priority", "ASC"]],
  }).then((resp) =>
    resp.map((item, index) => ({ id: item.id, priority: index + 1 }))
  );
  await updatePriority(weightages, company_id, client_id);
};

export const deleteHumanScoreWeightageService = async (
  id,
  methodologyInDB,
  client
) => {
  if (id) {
    await HumanScoreWeightageModel.destroy({ where: { id } });
    await addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client?.ipAddress,
        process: `Deleted "${methodologyInDB.name}" human score weightage`,
        user_id: client?.client_id,
        asset_id: null,
        target_id: methodologyInDB.id,
        effected_table: HumanScoreWeightageModel.tableName,
        company_id: methodologyInDB.company_id,
        isSystemLog: false,
      },
      deleteHumanScoreWeightageActivity.status.Successfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(methodologyInDB)),
        HumanScoreWeightageModel.tableName
      )
    );
    await getListAndUpdatePriority(methodologyInDB.company_id, client);
    return true;
  }
  return false;
};
