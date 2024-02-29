import { Sequelize } from "sequelize";
import sequelize from "../../db";
import SecretsTypesModel from "../../SecretsTypes/SecretsTypes.model";
import privilegeAccessScoreWeightageModel from "../privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";

const privilegeAccessScoreWeightageModelTypesModel = sequelize.define(
  "privilege_access_score_weightage_types",
  {
    id: {
      primaryKey: true,
      unique: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    secret_type_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    weightage_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  }
);

privilegeAccessScoreWeightageModelTypesModel.belongsTo(
  privilegeAccessScoreWeightageModel,
  {
    foreignKey: "weightage_id",
  }
);

// // ***************** relation to secrets types ********************
privilegeAccessScoreWeightageModelTypesModel.belongsTo(SecretsTypesModel, {
  foreignKey: "secret_type_id",
});

privilegeAccessScoreWeightageModel.belongsToMany(SecretsTypesModel, {
  through: {
    model: privilegeAccessScoreWeightageModelTypesModel,
    unique: false,
  },
  foreignKey: "weightage_id",
  otherKey: "secret_type_id",
});
SecretsTypesModel.belongsToMany(privilegeAccessScoreWeightageModel, {
  through: {
    model: privilegeAccessScoreWeightageModelTypesModel,
    unique: false,
  },
  foreignKey: "secret_type_id",
  otherKey: "weightage_id",
});

export default privilegeAccessScoreWeightageModelTypesModel;
