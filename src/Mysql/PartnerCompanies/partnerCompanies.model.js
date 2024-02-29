import {
    DataTypes, Sequelize
} from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import rolesSQLModel from "../Roles/roles.model";
import userModel from "../Users/users.model";

const partnerCompanySQLModel = sequelize.define("partner_companies", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    company_id: {
        type: Sequelize.UUID,
    },
    user_id: {
        type: Sequelize.UUID,
    },
    user_company_id: {
        type: Sequelize.UUID,
    },
});

// Relation to Company model
companyModel.hasOne(partnerCompanySQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
    // as: 'company',
  },
});
partnerCompanySQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
  // as: 'company',
});

// 
// companyModel.hasOne(partnerCompanySQLModel, {
//   foreignKey: {
//     name: "user_company_id",
//     allowNull: false,
//     as: 'user_company',
//   },
// });
// partnerCompanySQLModel.belongsTo(companyModel, {
//   foreignKey: "user_company_id",
//   as: 'user_company',
// });


// Relation to User model
userModel.hasOne(partnerCompanySQLModel, {
  foreignKey: {
    name: "user_id",
    allowNull: false,
  },
});
partnerCompanySQLModel.belongsTo(userModel, {
    foreignKey: "user_id",
});

export default partnerCompanySQLModel;