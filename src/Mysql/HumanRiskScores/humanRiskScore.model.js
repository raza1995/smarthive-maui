import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import humanSQLModel from "../Human/human.model";
import companyModel from "../Companies/company.model";
import eventEmitter, {
  eventTypes,
  triggerHumanScoreUpdate,
} from "../../EventEmitter";

const humanRiskScoreModel = sequelize.define(
  "human_risk_scores",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    human_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    security_awareness: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    pishing: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 850.0,
    },
    asset: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    mfa: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 850.0,
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
  },
  {
    hooks: {
      async afterSave(humanScore, options) {
        const risk_score =
          humanScore.custom_methodology_risk_score === "N/A"
            ? humanScore.default_risk_score
            : parseInt(humanScore.custom_methodology_risk_score, 10);
        if (risk_score !== humanScore.risk_score) {
          console.log(
            "human risk score updated",
            { new: risk_score },
            humanScore.risk_score,
            options.fields
          );
          await humanScore.update({ risk_score });
          triggerHumanScoreUpdate(humanScore.human_id);
        }
        return true;
      },
    },
  }
);

// ***************** relations **********************

humanSQLModel.hasOne(humanRiskScoreModel, {
  foreignKey: {
    name: "human_id",
  },
});

humanRiskScoreModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
});

companyModel.hasMany(humanRiskScoreModel, {
  foreignKey: {
    name: "company_id",
  },
});
humanRiskScoreModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default humanRiskScoreModel;
