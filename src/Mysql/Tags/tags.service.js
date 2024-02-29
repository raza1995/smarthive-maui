import { TagCreated } from "../Logs/ActivitiesType/assetsactivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import TagsModel from "./tags.model";

export const updateOrCreateTag = async (tag, client) => {
  const tagInDB = await TagsModel.findOne({
    where: { label: tag.label, company_id: tag.company_id },
  });

  if (tagInDB?.id) {
    return tagInDB;
  }
  // eslint-disable-next-line no-return-await
  return await TagsModel.create(tag).then((resp) => {
    addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client.ipAddress,
        process: `New tag created`,
        user_id: null,
        company_id: tag.company_id,
        isSystemLog: false,
      },
      TagCreated.status.TagCreatedSuccessfully.code,
      null
    );
    return resp;
  });
};

export const getCompanyTagsByFilter = async (query) => {
  const tags = await TagsModel.findAll({
    where: query,
    attributes: ["id", "label"],
    limit: 10,
  });
  return tags;
};

export const getTagsByFilter = async (query) => {
  const tags = await TagsModel.findAll({
    where: query,
    attributes: ["id", "label"],
  });
  return tags;
};
