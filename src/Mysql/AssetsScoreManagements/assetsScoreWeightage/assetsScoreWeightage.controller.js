import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import { getAssetsCompanyByFilterAndAttributes } from "../../Assets/assets.service";
import sequelize from "../../db";
import { findUserOAuthId } from "../../Users/users.service";
import { createCustomWeightageAssetsScore } from "../assetsCustomWeightageScore/assetsCustomWeightageScore.controller";
import assetsScoreWeightageModel from "./assetsScoreWeightage.model";
import {
  deleteAssetsScoreWeightageService,
  updateOrCreateAssetsScoreWeightage,
  updatePriority,
} from "./assetsScoreWeightage.service";

export const getAssetFilterList = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const attributes = [];
    if (filter.statics) {
      attributes.push("assetsCountWithCustomScore", "assetsSubTypesCounts");
    }
    const result = await getAssetsCompanyByFilterAndAttributes(
      user.company_id,
      req.query.size,
      req.query.page,
      filter,
      ["totalAssetsCount", ...attributes]
    );
    const statics = {};
    attributes.forEach((item) => {
      statics[item] = result?.[item] || 0;
    });
    res.status(200).json({
      status: true,
      message: "Success",
      assets: result?.Assets,
      totalCount: result?.totalAssetsCount || 0,
      ...statics,
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};

export const getAssetScoreWeightageList = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);
    const { size, page } = req.query;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const filterQuery = {};
    if (filter?.name) {
      filterQuery.name = { [Op.like]: `%${filter.name}%` };
    }
    let paginationQuery = {};
    if (size !== "all") {
      paginationQuery = {
        offset: (page - 1) * size,
        limit: +size,
      };
    }
    const scoreWeightage = await assetsScoreWeightageModel.findAll({
      where: {
        company_id: user.company_id,
        ...filterQuery,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM assets_custom_weightage_scores as acs WHERE  acs.weightage_id= assets_score_weightage.id )`
            ),
            "assets_impacted",
          ],
        ],
      },
      order: [["priority", "ASC"]],
      ...paginationQuery,
    });
    const totalCount = await assetsScoreWeightageModel.count({
      where: {
        company_id: user.company_id,
      },
    });

    res.status(200).json({
      scoreWeightage,
      totalCount: totalCount || 0,
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};

export const createAssetsScoreWeightage = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const user = await findUserOAuthId(loggedInUser.sub);

    const payload = {
      ...req.body,
      created_by_id: user.id,
      company_id: user.company_id,
    };

    const AssetsScoreWeightage = await updateOrCreateAssetsScoreWeightage(
      payload,
      {
        client_id: user.id,
        client_email: user.email,
        ipAddress: req.socket.remoteAddress,
      }
    );

    await createCustomWeightageAssetsScore(AssetsScoreWeightage.id, {
      client_id: user.id,
      client_email: user.email,
      ipAddress: req.socket.remoteAddress,
    });
    res.status(200).json({
      status: true,
      message: payload.id
        ? "Assets score weightage Update successfully"
        : "Assets score weightage created successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json({ message: error.message });
  }
};
export const updateAssetsScoreWeightagePriorityController = async (
  req,
  res
) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);
    const { weightages } = req.body;
    await updatePriority(weightages, user.company_id, {
      client_id: user.id,
      client_email: user.email,
      ipAddress: req.socket.remoteAddress,
    });

    res.status(200).json({
      status: true,
      message: "assets score weightage  priority changed successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};

export const deleteAssetsScoreWeightageController = async (req, res) => {
  try {
    const loginUser = await findUserOAuthId(req.user.sub);
    const { id } = req.params;

    const ScoreMethodology = await assetsScoreWeightageModel
      .findOne({
        where: {
          id,
          company_id: loginUser.company_id,
        },
      })
      .then((resp) => JSON.parse(JSON.stringify(resp)));

    if (ScoreMethodology?.id) {
      await deleteAssetsScoreWeightageService(id, ScoreMethodology, {
        client_id: loginUser.id,
        client_email: loginUser.email,
        ipAddress: req.socket.remoteAddress,
      });

      res
        .status(StatusCodes.OK)
        .send({ message: "Score methodology deleted successfully" });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "You don't have access to delete it",
      });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
};
