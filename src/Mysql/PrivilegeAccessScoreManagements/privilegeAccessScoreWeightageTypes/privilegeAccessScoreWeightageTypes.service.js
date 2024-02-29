import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import SecretsTypesModel from "../../SecretsTypes/SecretsTypes.model";
import privilegeAccessScoreWeightageModelTypesModel from "./privilegeAccessScoreWeightageTypes.model";

export const updateOrCreatePrivilegeAccessScoreWeightageType = async (type) => {
  const secretsTypeInDB =
    await privilegeAccessScoreWeightageModelTypesModel.findOne({
      where: {
        secret_type_id: type.secret_type_id,
        weightage_id: type.weightage_id,
      },
    });
  if (secretsTypeInDB) {
    await privilegeAccessScoreWeightageModelTypesModel.update(type, {
      where: {
        id: secretsTypeInDB.id,
      },
    });
  } else {
    await privilegeAccessScoreWeightageModelTypesModel.create(type);
  }
  return true;
};
export const updateOrCreatePrivilegeAccessScoreWeightageTypes = async (
  secretsTypes,
  weightage_id
) => {
  try {
    const oldTypes = await privilegeAccessScoreWeightageModelTypesModel
      .findAll({
        where: {
          weightage_id,
        },
        limit: 2,
        order: [["updatedAt", "DESC"]],
      })
      .then((resp) => resp);

    const lastUpdatedAtDate = oldTypes?.[0]?.updatedAt;
    for await (const type of secretsTypes) {
      const typeInDB = await SecretsTypesModel.findOne({
        where: {
          type,
        },
      });
      if (typeInDB) {
        await updateOrCreatePrivilegeAccessScoreWeightageType({
          secret_type_id: typeInDB.id,
          weightage_id,
        });
      }
    }
    if (oldTypes.length > 0) {
      const deleteAssets =
        await privilegeAccessScoreWeightageModelTypesModel.findAll({
          where: {
            weightage_id,
            updatedAt: {
              [Op.lte]: lastUpdatedAtDate,
            },
          },
        });
      deleteAssets.forEach((assetTag) => {
        privilegeAccessScoreWeightageModelTypesModel.destroy({
          where: {
            id: assetTag.id,
          },
        });
      });

      console.log("delete secrets weightage types", deleteAssets?.length);
    }
    return true;
  } catch (err) {
    errorHandler(err);
  }
};
