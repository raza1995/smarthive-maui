import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import OpenCVEsModel from "./Cves.model";

export const getOpenCVEs = async (req, res) => {
  try {
    const { size = 10, page = 1 } = req.query;
    const filter = JSON.parse(req.query.filter || "{}");
    const query = {};
    if (filter?.search) {
      query.cve_id = { [Op.like]: `%${filter?.search}%` };
    }
    // if (filter?.severity?.length > 0) {
    //   query.json.impact = {
    //     [Op.contains]: {
          
    //         baseMetricV3: { severity: filter.severity[0] },
          
    //     },
    //   };
    // }
    let order = ["json.publishedDate", "DESC"];
    if (filter?.sort) {
      if (filter.sort === "older first") {
        order = ["json.publishedDate", "ASC"];
      }
    }
    const cves = await OpenCVEsModel.findAll({
      where: query,
      order: [order],
      offset: (page - 1) * size,
      limit: +size,
    });
    const totalCves = await OpenCVEsModel.count({
      where: query,
    });

    res.status(StatusCodes.OK).json({ cves, totalCves });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
export const getOpenCVEsDetailById = async (req, res) => {
  try {
    const { cve_id } = req.params;
    const cves = await OpenCVEsModel.findOne({
      where: { cve_id },
    });

    res.status(StatusCodes.OK).json(cves);
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
