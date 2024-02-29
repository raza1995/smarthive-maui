import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import sequelize from "../../db";
import SecretsTypesModel from "../../SecretsTypes/SecretsTypes.model";
import TagsModel from "../../Tags/tags.model";

import { findUserOAuthId } from "../../Users/users.service";
import { createCustomWeightageSecretsScore } from "../privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.controller";
import privilegeAccessScoreWeightageTagsModel from "../privilegeAccessScoreWeightageTags/privilegeAccessScoreWeightageTags.model";
import privilegeAccessScoreWeightageModelTypesModel from "../privilegeAccessScoreWeightageTypes/privilegeAccessScoreWeightageTypes.model";
import privilegeAccessScoreWeightageModel from "./privilegeAccessScoreWeightage.model";
import {
  deletePrivilegeAccessScoreWeightageService,
  updateOrCreatePrivilegeScoreWeightage,
  updatePriority,
} from "./privilegeAccessScoreWeightage.service";

export const getPrivilegeAccessScoreWeightageList = async (req, res) => {
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
    const scoreWeightage = await privilegeAccessScoreWeightageModel.findAll({
      where: {
        company_id: user.company_id,
        ...filterQuery,
      },
      include: [
        {
          model: SecretsTypesModel,
          through: {
            attributes: [],
          },
          attributes: ["id", "type"],
        },
        {
          model: TagsModel,
          through: {
            attributes: [],
          },
          attributes: ["id", "label"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM secrets_custom_weightage_scores as acs WHERE  acs.weightage_id = privilege_access_score_weightage.id )`
            ),
            "secrets_impacted",
          ],
        ],
      },
      order: [["priority", "ASC"]],
      ...paginationQuery,
    });
    const totalCount = await privilegeAccessScoreWeightageModel.count({
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

export const createPrivilegeAccessScoreWeightage = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await findUserOAuthId(loggedInUser.sub);

    const payload = {
      ...req.body,
      created_by_id: user.id,
      company_id: user.company_id,
    };

    const AssetsScoreWeightage = await updateOrCreatePrivilegeScoreWeightage(
      payload,
      {
        client_id: user.id,
        client_email: user.email,
        ipAddress: req.socket.remoteAddress,
      }
    );

    await createCustomWeightageSecretsScore(AssetsScoreWeightage.id, {
      client_id: user.id,
      client_email: user.email,
      ipAddress: req.socket.remoteAddress,
    });
    res.status(200).json({
      status: true,
      message: payload.id
        ? "Privilege access score weightage Update successfully"
        : "Privilege access score weightage created successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};
export const updatePrivilegeAccessScoreWeightagePriorityController = async (
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
      message: "PrivilegeAccess score weightage priority changed successfully",
    });
  } catch (error) {
    errorHandler(error);
    res.status(503).json(error.message);
  }
};

export const deletePrivilegeAccessScoreWeightageController = async (
  req,
  res
) => {
  try {
    const loginUser = await findUserOAuthId(req.user.sub);
    const { id } = req.params;

    const ScoreMethodology = await privilegeAccessScoreWeightageModel
      .findOne({
        where: {
          id,
          company_id: loginUser.company_id,
        },
      })
      .then((resp) => JSON.parse(JSON.stringify(resp)));

    if (ScoreMethodology?.id) {
      await deletePrivilegeAccessScoreWeightageService(id, ScoreMethodology, {
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
