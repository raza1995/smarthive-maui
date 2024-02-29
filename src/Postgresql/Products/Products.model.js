import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../postgresDb";
import OpenCVEsVendorsModel from "../Vendors/Vendors.model";

const OpenCVEsProductsModel = sequelize.define(
  "products",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vendor_id: {
      type: Sequelize.UUID,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
OpenCVEsVendorsModel.hasMany(OpenCVEsProductsModel, {
  foreignKey: "vendor_id",
});
OpenCVEsProductsModel.belongsTo(OpenCVEsVendorsModel, {
  foreignKey: "vendor_id",
});

export default OpenCVEsProductsModel;
