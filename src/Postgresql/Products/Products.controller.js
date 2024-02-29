import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import OpenCVEsModel from "../Cves/Cves.model";
import OpenCVEsProductsModel from "./Products.model";
import OpenCVEsVendorsModel from "../Vendors/Vendors.model";

export const getOpenCVEsProducts = async (req, res) => {
  try {
    const { search, size = 10, page = 1 } = req.query;
    const query = {};
    if (search) {
      query.name = { [Op.like]: `${search}%` };
    }
    const products = await OpenCVEsProductsModel.findAll({
      where: query,
      offset: (page - 1) * size,
      limit: +size,
    });
    const totalProducts = await OpenCVEsProductsModel.count({
      where: query,
    });
    res.status(StatusCodes.OK).json({ products, totalProducts });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};

export const getOpenCVEsProductCVEs = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const query = {};
    if (filter.search) {
      query.cve = { [Op.like]: `%${filter.search}%` };
    }
    const { product_id } = req.params;
    const product = await OpenCVEsProductsModel.findOne({
      where: { id: product_id },
      include: [
        {
          model: OpenCVEsVendorsModel,
        },
      ],
    });
    const { rows: cves, count: totalCves } = await OpenCVEsModel.findAndCountAll({
      distinct: "id",
      where: {
        vendors: {
          [Op.contains]: `${product.vendor.name}$PRODUCT$${product.name}`,
        },
      },
      offset: (page - 1) * size,
      limit: +size,
    });
    res.status(StatusCodes.OK).json({ cves, totalCves });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
