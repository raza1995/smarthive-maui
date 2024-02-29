import {
  createAssetsScoreWeightageActivity,
  deleteAssetsScoreWeightageActivity,
  UpdateAssetsScoreWeightageActivity,
} from "../../Logs/ActivitiesType/assetsactivities";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import assetsScoreWeightageModel from "./assetsScoreWeightage.model";

export const updateOrCreateAssetsScoreWeightage = async (
  assetsScoreWeightage,
  client
) => {
  if (assetsScoreWeightage?.id) {
    const methodologyInDB = await assetsScoreWeightageModel.findOne({
      where: {
        id: assetsScoreWeightage.id,
      },
    });
    if (methodologyInDB.id) {
      await assetsScoreWeightageModel.update(assetsScoreWeightage, {
        where: {
          id: assetsScoreWeightage.id,
        },
      });
      const updatedMethodology = await assetsScoreWeightageModel.findOne({
        where: {
          id: assetsScoreWeightage.id,
        },
      });

      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `updated "${assetsScoreWeightage.name}" assets score weightage `,
          user_id: client?.client_id,
          asset_id: null,
          target_id: updatedMethodology.id,
          effected_table: assetsScoreWeightageModel.tableName,
          company_id: assetsScoreWeightage.company_id,
          isSystemLog: false,
        },
        UpdateAssetsScoreWeightageActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(updatedMethodology)),
          JSON.parse(JSON.stringify(methodologyInDB)),
          assetsScoreWeightageModel.tableName
        )
      );
      return updatedMethodology;
    }
    throw Error("Methodology not available");
  }
  const getLastPriority = await assetsScoreWeightageModel.findAll({
    where: {
      company_id: assetsScoreWeightage.company_id,
    },
    limit: 1,
    order: [["priority", "DESC"]],
  });
  const priority = getLastPriority?.[0]?.priority
    ? (getLastPriority?.[0]?.priority || 0) + 1
    : 1;
  const newMethodology = await assetsScoreWeightageModel.create({
    ...assetsScoreWeightage,
    priority,
  });
  await addEventLog(
    {
      id: client?.client_id,
      email: client?.client_email,
      ipAddress: client?.ipAddress,
      process: `Created "${assetsScoreWeightage.name}" assets score weightage`,
      user_id: client?.client_id,
      asset_id: null,
      target_id: newMethodology.id,
      effected_table: assetsScoreWeightageModel.tableName,
      company_id: assetsScoreWeightage.company_id,
      isSystemLog: false,
    },
    createAssetsScoreWeightageActivity.status.AssetsAssetUnAssignSuccessfully
      .code,
    createEventPayload(
      JSON.parse(JSON.stringify(newMethodology)),
      {},
      assetsScoreWeightageModel.tableName
    )
  );

  return newMethodology;
};

export const updatePriority = async (weightages, company_id, client) => {
  if (weightages?.length > 0) {
    for await (const weightage of weightages) {
      const methodologyInDB = await assetsScoreWeightageModel.findOne({
        where: {
          id: weightage.id,
        },
      });
      if (methodologyInDB?.id) {
        await assetsScoreWeightageModel.update(
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
            effected_table: assetsScoreWeightageModel.tableName,
            company_id: methodologyInDB.company_id,
            isSystemLog: false,
          },
          UpdateAssetsScoreWeightageActivity.status.Successfully.code,
          createEventPayload(
            { priority: weightage.priority },
            { priority: methodologyInDB.priority },
            assetsScoreWeightageModel.tableName
          )
        );
      }
    }
    return true;
  }
  return false;
};

const getListAndUpdatePriority = async (company_id, client_id) => {
  const weightages = await assetsScoreWeightageModel
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

export const deleteAssetsScoreWeightageService = async (
  id,
  methodologyInDB,
  client
) => {
  if (id) {
    await assetsScoreWeightageModel.destroy({ where: { id } });
    await addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client?.ipAddress,
        process: `Deleted "${methodologyInDB.name}" assets score weightage`,
        user_id: client?.client_id,
        asset_id: null,
        target_id: methodologyInDB.id,
        effected_table: assetsScoreWeightageModel.tableName,
        company_id: methodologyInDB.company_id,
        isSystemLog: false,
      },
      deleteAssetsScoreWeightageActivity.status
        .AssetsScoreWeightageDeletedSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(methodologyInDB)),
        assetsScoreWeightageModel.tableName
      )
    );
    await getListAndUpdatePriority(methodologyInDB.company_id, client);
    return true;
  }
  return false;
};
