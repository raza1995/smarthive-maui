import { Sequelize } from "sequelize";
import sequelize from "../../db";
import TagsModel from "../../Tags/tags.model";
import privilegeAccessScoreWeightageModel from "../privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";

const privilegeAccessScoreWeightageTagsModel = sequelize.define(
  "privilege_access_score_weightage_tags",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      // defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    tag_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    weightage_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  }
);

// // ***************** relation to assets ********************

// privilegeAccessScoreWeightageModel.hasMany(privilegeAccessScoreWeightageTagsModel, {
//   onDelete:"CASCADE",
//   foreignKey: {
//     name: "weightage_id",
//     allowNull: false,
//   },
// });
privilegeAccessScoreWeightageTagsModel.belongsTo(privilegeAccessScoreWeightageModel, {
  foreignKey: "weightage_id",
});

// // ***************** relation to tags ********************

// TagsModel.hasMany(privilegeAccessScoreWeightageTagsModel, {
//   onDelete:"CASCADE",
//   foreignKey: {
//     name: "tag_id",
//     allowNull: false,
//   },
// });
privilegeAccessScoreWeightageTagsModel.belongsTo(TagsModel, {
  foreignKey: "tag_id",
});

privilegeAccessScoreWeightageModel.belongsToMany(TagsModel, {
  through: {
    model: privilegeAccessScoreWeightageTagsModel,
  },
  foreignKey: "weightage_id",
  otherKey: "tag_id",
});
TagsModel.belongsToMany(privilegeAccessScoreWeightageModel, {
  through: {
    model: privilegeAccessScoreWeightageTagsModel,
  },
  foreignKey: "tag_id",
  otherKey: "weightage_id",
});

export default privilegeAccessScoreWeightageTagsModel;
