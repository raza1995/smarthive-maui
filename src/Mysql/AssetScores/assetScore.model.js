import { triggerAssetScoreUpdate } from "../../EventEmitter";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const { DataTypes, Sequelize } = require("sequelize");

const AssetScoreSQLModel = sequelize.define(
  "asset_scores",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    asset_id: {
      type: Sequelize.UUID,
    },
    company_id: {
      type: Sequelize.UUID,
    },
    lifecycle_score: {
      type: DataTypes.FLOAT,
    },
    endpoint_score: {
      type: DataTypes.FLOAT,
    },
    backup_score: {
      type: DataTypes.FLOAT,
    },
    patching_score: {
      type: DataTypes.FLOAT,
    },
    real_time_score: {
      type: DataTypes.FLOAT,
    },
    custom_methodology_risk_score: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "N/A",
    },
    default_risk_score: {
      type: DataTypes.INTEGER,
    },
    risk_score: {
      type: DataTypes.INTEGER,
    },
    pure_risk_score: {
      type: DataTypes.INTEGER,
    },
    is_pure_score: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // tolerance_score: {
    //   type: DataTypes.FLOAT,
    // },
  },
  {
    hooks: {
      async afterSave(assertScore, options) {
        const risk_score =
          assertScore.custom_methodology_risk_score === "N/A"
            ? assertScore.default_risk_score
            : parseInt(assertScore.custom_methodology_risk_score, 10);
        if (risk_score !== assertScore.risk_score) {
          console.log(
            "asset risk score updated",
            { new: risk_score },
            assertScore.risk_score,
            options.fields
          );
          await assertScore.update({ risk_score });
          triggerAssetScoreUpdate(assertScore.asset_id)
          return true;
        }
      },
    },
  }
);

companyModel.hasOne(AssetScoreSQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetScoreSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasOne(AssetScoreSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetScoreSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default AssetScoreSQLModel;
