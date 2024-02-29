import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import OpenCVEsModel from "../Cves/Cves.model";
import OpenCVEsProductsModel from "../Products/Products.model";
import OpenCVEsVendorsModel from "./Vendors.model";

export const getOpenCVEsVendors = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const query = {};
    const filter = JSON.parse(req.query.filter || "{}");
    if (filter?.search) {
      // query.name = { [Op.like]: `%${filter?.search}%` };
      query[Op.and] = [
        { name: { [Op.like]: `%${filter?.search}%` } },
        {
          name: {
            [Op.notIn]: ['-','*'],
          },
        },
      ];
    }else{
      query.name = { [Op.notIn]: ['-','*'] };
    }
    const { count: totalVendors, rows } =
      await OpenCVEsVendorsModel.findAndCountAll({
        distinct: "id",
        where: query,
        order: ["name"],
        offset: (page - 1) * size,
        limit: +size,
        include: [
          {
            model: OpenCVEsProductsModel,
          },
        ],
      });
    const vendors = await Promise.all(
      rows.map(async (vendor) => {
        const products = await Promise.all(
          vendor?.products?.map(async (item) => {
            const soft = JSON.parse(JSON.stringify(item));
            const totalCves = await OpenCVEsModel.count({
              distinct: "id",
              where: {
                vendors: {
                  [Op.contains]: `${vendor.name}$PRODUCT$${soft.name}`,
                },
              },
            });
            return {
              ...soft,
              totalCves,
            };
          })
        );
        const totalCves = await OpenCVEsModel.count({
          distinct: "id",
          logging: true,
          where: {
            vendors: {
              [Op.contains]: vendor.name,
            },
          },
        });
        return {
          id: vendor.id,
          name: vendor?.name,
          totalCves,
          totalProducts: vendor?.products?.length,
          products,
        };
      })
    );
    res.status(StatusCodes.OK).json({ vendors, totalVendors });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
