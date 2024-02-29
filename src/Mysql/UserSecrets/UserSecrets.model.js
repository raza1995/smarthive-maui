import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import secretsModel from "../secrets/secret.model";
import userModel from "../Users/users.model";

const UserSecretsModel = sequelize.define("user_secrets", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  access_role: {
    type: DataTypes.ENUM(["Admin", "viewer"]),
    defaultValue:"viewer",
    allowNull: false,
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  secret_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

// ***************** relation to assets ********************

secretsModel.hasOne(UserSecretsModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "secret_id",
    allowNull: false,
  },
});
UserSecretsModel.belongsTo(secretsModel, {
  foreignKey: "secret_id",
});
// ***************** relation to tags ********************

userModel.hasMany(UserSecretsModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "user_id",
    allowNull: false,
  },
});
UserSecretsModel.belongsTo(userModel, {
  foreignKey: "user_id",
});

export default UserSecretsModel;
