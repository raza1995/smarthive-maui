import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import companyModel from "../Companies/company.model";
import userModel from "../Users/users.model";
import assetSQLModel from "../Assets/assets.model";

const secretsModel = sequelize.define(
  "secrets",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    secrets_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    custom_methodology_risk_score: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "N/A",
    },
    default_risk_score: {
      type: DataTypes.INTEGER,
    },
    secrets_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    secrets_strength_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    secrets_upto_date_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    linked_human_score: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "N/A",
    },
    linked_asset_score: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "N/A",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    users: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    asset_id: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    secretsLastUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  },
  {
    hooks: {
      async afterSave(secrets, options) {
        const secrets_score =
          secrets.custom_methodology_risk_score === "N/A"
            ? secrets.default_risk_score
            : parseInt(secrets.custom_methodology_risk_score, 10);
        if (secrets_score !== secrets.secrets_score) {
          console.log(
            "secret risk score updated",
            { new: secrets_score },
            secrets.risk_score,
            options.fields
          );
          await secrets.update({ secrets_score });
          // eventEmitter.emit(eventTypes.assetScoreUpdated, secrets.asset_id);
        }
        return true;
      },
    },
  }
);
userModel.hasMany(secretsModel, {
  foreignKey: {
    name: "created_by_id",
    allowNull: false,
    as: "created_by",
  },
});
secretsModel.belongsTo(userModel, {
  foreignKey: "created_by_id",
  as: "created_by",
});
companyModel.hasMany(secretsModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
secretsModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
assetSQLModel.hasMany(secretsModel, {
  foreignKey: {
    name: "asset_id",
  },
  onUpdate: "NO ACTION",
  onDelete: "NO ACTION",
});
secretsModel.belongsTo(assetSQLModel, {
  foreignKey: {
    name: "asset_id",
    allowNull: true,
  },
});

export default secretsModel;
