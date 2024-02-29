import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import TagsModel from "../../Tags/tags.model";
import { updateOrCreateTag } from "../../Tags/tags.service";
import privilegeAccessScoreWeightageTagsModel from "./privilegeAccessScoreWeightageTags.model";

export const updateOrCreatePrivilegeAccessScoreWeightageTag = async (Tag) => {
  const TagInDB = await privilegeAccessScoreWeightageTagsModel.findOne({
    where: { tag_id: Tag.tag_id, weightage_id: Tag.weightage_id },
  });
  if (TagInDB) {
    await privilegeAccessScoreWeightageTagsModel.update(Tag, {
      where: {
        id: TagInDB.id,
      },
    });
  } else {
    await privilegeAccessScoreWeightageTagsModel.create(Tag);
  }
  return true;
};
export const updateOrCreatePrivilegeAccessScoreWeightageTags = async (
  tags,
  company_id,
  weightage_id
) => {
  try {
    const oldTags = await privilegeAccessScoreWeightageTagsModel
      .findAll({
        where: {
          weightage_id,
        },
        limit: 2,
        order: [["updatedAt", "DESC"]],
      })
      .then((resp) => resp);

    const lastUpdatedAtDate = oldTags?.[0]?.updatedAt;
    for await (const tag of tags) {
      const tagInDB = await updateOrCreateTag({ label: tag, company_id });
      if (tagInDB) {
        await updateOrCreatePrivilegeAccessScoreWeightageTag(
          { tag_id: tagInDB.id, weightage_id },
          tagInDB.label
        );
      }
    }
    if (oldTags.length > 0) {
      const deleteAssets =
        await privilegeAccessScoreWeightageTagsModel.findAll({
          where: {
            weightage_id,
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
        privilegeAccessScoreWeightageTagsModel.destroy({
          where: {
            id: assetTag.id,
          },
        });
      });

      console.log("delete secrets weightage tags", deleteAssets?.length);
    }
    return true;
  } catch (err) {
    errorHandler(err);
  }
};
