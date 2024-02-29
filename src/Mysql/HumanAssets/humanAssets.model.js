import {
    DataTypes, Sequelize
} from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import humanSQLModel from "../Human/human.model";

const humanAssetsSQLModel = sequelize.define("human_assets", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    company_id: {
        type: Sequelize.UUID,
    allowNull: false,
    },
    human_id: {
        type: Sequelize.UUID,
    allowNull: false,
    },
    asset_id: {
        type: Sequelize.UUID,
    allowNull: false,
    },
});

// relation to company
companyModel.hasMany(humanAssetsSQLModel, {
  foreignKey: {
    name: "company_id",
  },
})

humanAssetsSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
})

// relation to asset
assetSQLModel.hasMany(humanAssetsSQLModel, {
  foreignKey: {
    name: "asset_id",
  },
})

humanAssetsSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
})

// relation to human
humanSQLModel.hasMany(humanAssetsSQLModel, {
  foreignKey: {
    name: "human_id",
  },
})

humanAssetsSQLModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
})

export default humanAssetsSQLModel;