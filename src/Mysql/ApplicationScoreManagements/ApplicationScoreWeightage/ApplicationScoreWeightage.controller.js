import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import sequelize from "../../db";

import { findUserOAuthId } from "../../Users/users.service";
import { createApplicationCustomWeightageSecretsScore } from "../ApplicationCustomWeightageScore/ApplicationCustomWeightageScore.controller";
import ApplicationScoreWeightageModel from "./ApplicationScoreWeightage.model";
import {
  deleteApplicationsScoreWeightageService,
  updateOrCreateApplicationScoreWeightage,
  updatePriority,
} from "./ApplicationScoreWeightage.service";

export const getApplicationScoreWeightageList = async (req, res) => {
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
    const scoreWeightage = await ApplicationScoreWeightageModel.findAll({
      where: {
        company_id: user.company_id,
        ...filterQuery,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM application_custom_weightage_scores as acs WHERE  acs.weightage_id = applications_score_weightage.id )`
            ),
            "application_impacted",
          ],
        ],
      },
      order: [["priority", "ASC"]],
      ...paginationQuery,
    });
    const totalCount = await ApplicationScoreWeightageModel.count({
      where: {
        company_id: user.company_id,
        ...filterQuery,
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

export const createApplicationScoreWeightage = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);

    const payload = {
      ...req.body,
      created_by_id: user.id,
      company_id: user.company_id,
    };

    const ApplicationsScoreWeightage =
      await updateOrCreateApplicationScoreWeightage(payload, {
        client_id: user.id,
        client_email: user.email,
        ipAddress: req.socket.remoteAddress,
      });

    await createApplicationCustomWeightageSecretsScore(
      ApplicationsScoreWeightage.id,
      {
        client_id: user.id,
        client_email: user.email,
        ipAddress: req.socket.remoteAddress,
      }
    );
    res.status(200).json({
      status: true,
      message: payload.id
        ? "Application score weightage Update successfully"
        : "Application score weightage created successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json({ message: error.message });
  }
};
export const updateApplicationScoreWeightagePriorityController = async (
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
      message: "Application score weightage priority changed successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};

export const deleteApplicationScoreWeightageController = async (req, res) => {
  try {
    const loginUser = await findUserOAuthId(req.user.sub);
    const { id } = req.params;

    const ScoreMethodology = await ApplicationScoreWeightageModel.findOne({
      where: {
        id,
        company_id: loginUser.company_id,
      },
    }).then((resp) => JSON.parse(JSON.stringify(resp)));

    if (ScoreMethodology?.id) {
      await deleteApplicationsScoreWeightageService(id, ScoreMethodology, {
        client_id: loginUser.id,
        client_email: loginUser.email,
        ipAddress: req.socket.remoteAddress,
      });

      await ApplicationScoreWeightageModel.destroy({ where: { id } });
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
