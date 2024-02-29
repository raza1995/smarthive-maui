import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import TagsModel from "../Tags/tags.model";
import { updateOrCreateTag } from "../Tags/tags.service";
import secretTagsModel from "./secretTags.model";

export const updateOrCreateSecretTag = async (assetTag, tagLabel, client) => {
  const AssetTagInDB = await secretTagsModel.findOne({
    where: { tag_id: assetTag.tag_id, secret_id: assetTag.secret_id },
  });
  if (AssetTagInDB) {
    await secretTagsModel.update(assetTag, {
      where: {
        id: AssetTagInDB.id,
      },
    });
  } else {
    await secretTagsModel.create(assetTag);
    // await addEventLog(
    //   {
    //     id: client?.client_id,
    //     email: client?.client_email,
    //     ipAddress: client?.ipAddress,
    //     process: `A new tag "${tagLabel}" assigned successfully`,
    //     user_id: null,
    //     asset_id: assetTag.asset_id,
    //     company_id: client?.company_id,
    //     isSystemLog: false,
    //   },
    //   TagAssignToAsset.status.TagAssignToAssetSuccessfully.code,
    //   null
    // );
  }
  return true;
};
export const updateOrCreateSecretTags = async (
  tags,
  company_id,
  secret_id,
  client
) => {
  try {
    const oldAssets = await secretTagsModel
      .findAll({
        where: {
          secret_id,
        },
        limit: 2,
        order: [["updatedAt", "DESC"]],
      })
      .then((resp) => resp);

    const lastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
    for await (const tag of tags) {
      const tagInDB = await updateOrCreateTag(
        { label: tag, company_id },
        client
      );
      if (tagInDB) {
        await updateOrCreateSecretTag(
          { tag_id: tagInDB.id, secret_id },
          tagInDB.label,
          client
        );
      }
    }
    if (oldAssets.length > 0) {
      const deleteAssets = await secretTagsModel.findAll({
        where: {
          secret_id,
          updatedAt: {
            [Op.lte]: lastUpdatedAtDate,
          },
        },
        include: {
          model: TagsModel,
          attributes: ["label"],
        },
      });
      deleteAssets.forEach((assetTag) => {
        secretTagsModel.destroy({
          where: {
            id: assetTag.id,
          },
        });
      });

      console.log("delete assets", deleteAssets?.length);
    }
    return true;
  } catch (err) {
    errorHandler(err);
  }
};
export const getSecretTagsByFilter = async (query) => {
  const tags = await secretTagsModel.findAll({
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