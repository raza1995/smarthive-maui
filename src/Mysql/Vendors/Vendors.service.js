import { Op } from "sequelize";
import softwareSQLModel from "../Softwares/softwares.model";
import VendorsModel from "./Vendors.model";

export const findOrCreateVendor = async (vendorName) => {
  console.log("vendorName =========== ", vendorName)
  const vendorInDB = await VendorsModel.findOne({
    where: { name: vendorName },
  });

  if (vendorInDB?.id) {
    return vendorInDB;
  }
  // eslint-disable-next-line no-return-await
  return await VendorsModel.create({ name: vendorName }).then((resp) => resp);
};

export const getVendors = async (size, page, filter) => {
  const query = {};
  if (filter?.search) {
    query.name = { [Op.like]: `%${filter.search}%` };
  }
  const totalCount = await VendorsModel.findAndCountAll({
    where: query,
    include: [
      {
        model: softwareSQLModel,
        attributes: ["id", "name"],
      },
    ],
  }).then((resp) => resp.rows.length);
  const Vendors = await VendorsModel.findAll({
    where: query,
    include: [
      {
        model: softwareSQLModel,
        attributes: ["id", "name"],
      },
    ],
    offset: (page - 1) * size,
    limit: +size,
  });
  return { Vendors, totalCount };
};
