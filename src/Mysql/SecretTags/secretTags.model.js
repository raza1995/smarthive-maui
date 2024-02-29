import { Sequelize } from "sequelize";
import sequelize from "../db";
import secretsModel from "../secrets/secret.model";
import TagsModel from "../Tags/tags.model";

const secretTagsModel = sequelize.define("secret_tags", {
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
  secret_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

// ***************** relation to assets ********************

secretsModel.hasMany(secretTagsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "secret_id",
    allowNull: false,
  },
});
secretTagsModel.belongsTo(secretsModel, {
  foreignKey: "secret_id",
});
// ***************** relation to tags ********************

TagsModel.hasMany(secretTagsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "tag_id",
    allowNull: false,
  },
});
secretTagsModel.belongsTo(TagsModel, {
  foreignKey: "tag_id",
});

export default secretTagsModel;
