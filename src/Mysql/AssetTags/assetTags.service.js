import { Op } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import { TagAssignToAsset } from "../Logs/ActivitiesType/assetsactivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import TagsModel from "../Tags/tags.model";
import { getTagsByFilter, updateOrCreateTag } from "../Tags/tags.service";
import AssetTagModel from "./assetTags.model";

export const updateOrCreateAssetTag = async (assetTag, tagLabel, client) => {
  const AssetTagInDB = await AssetTagModel.findOne({
    where: { tag_id: assetTag.tag_id, asset_id: assetTag.asset_id },
  });
  if (AssetTagInDB) {
    await AssetTagModel.update(assetTag, {
      where: {
        id: AssetTagInDB.id,
      },
    });
  } else {
    await AssetTagModel.create(assetTag);
    await addEventLog(
      {
        id: client?.client_id,
        email: client?.client_email,
        ipAddress: client?.ipAddress,
        process: `A new tag "${tagLabel}" assigned successfully`,
        user_id: null,
        asset_id: assetTag.asset_id,
        company_id: client?.company_id,
        isSystemLog: false,
      },
      TagAssignToAsset.status.TagAssignToAssetSuccessfully.code,
      null
    );
  }
  return true;
};
export const updateOrCreateAssetTags = async (
  tags,
  company_id,
  asset_id,
  client
) => {
  for await (const tag of tags) {
    const tagInDB = await updateOrCreateTag({ label: tag, company_id }, client);
    if (tagInDB) {
     await updateOrCreateAssetTag(
        { tag_id: tagInDB.id, asset_id },
        tagInDB.label,
        client
      );
    }
  }
  return true;
};

export const getCompanyAssetTagsByFilter = async (query) => {
  const tags = await AssetTagModel.findAll({
    where: query,
    attributes: ["id"],

    include: [
      {
        model: TagsModel,
        required: true,
        attributes: ["label"],
      },
    ],
  }).then((resp) =>
    resp.map((assetTag) => ({ id: assetTag.id, label: assetTag.tag.label }))
  );
  return tags;
};

export const getGroupAssetTags = async (filterObj) => {
  try {
    // let tagsData = [];
    // const tagIds = [];
    // const filterQuery = {};
    const assetData = await AssetTagModel.findAll({
      // where: filterObj,
      attributes: ["tag_id"],
      // group: "tag_id",
      // raw: true,
      include: [
        {
          model: assetSQLModel,
          where: filterObj,
          required: true,
        },
        {
          model: TagsModel,
        },
      ],
    });
    const tagsData = assetData.filter((item, pos, self) => self.findIndex(v => v.dataValues.tag_id === item.dataValues.tag_id) === pos);
    // console.log("tags =========== ", tagsData)
    // assetData.map(function (item) { tagIds.push(item.dataValues.tag_id) })
    // filterQuery.id = { [Op.in]: tagIds};
    // tagsData = await getTagsByFilter(filterQuery);
    // console.log("tagsData ======== ", tagsData);
    return Promise.resolve( tagsData );
  } catch (err) {
    return Promise.reject(err);
  }
};
