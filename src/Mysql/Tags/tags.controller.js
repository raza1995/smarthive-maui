import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import TagsModel from "./tags.model";

export const getCompanyTags = async (req, res) => {
  try {
    const {user} = req;
    const { label } = req.query;
    const query = { company_id: user.company_id };
    if (label) {
      query.label = { [Op.like]: `${label}%` };
    }
    const tags = await TagsModel.findAll({
      where: query,
      attributes: ["id", "label"],
      limit: 10,
    });

    res.status(StatusCodes.OK).json({ tags });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
