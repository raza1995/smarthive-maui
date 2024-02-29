import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import { addAssetsToApplication } from "../ApplicationAssets/applicationAssets.service";
import { addHumansToApplication } from "../ApplicationHumans/applicationHumans.service";
import ApplicationServicesSQLModel from "../ApplicationServices/applicationServices.model";
import { addServicesToApplication } from "../ApplicationServices/applicationServices.service";
import { AssetUnassignToApplication } from "../Logs/ActivitiesType/assetsactivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import ApplicationSQLModel from "./application.model";
import {
  createApplication,
  deleteApplicationByID,
  findApplicationById,
  findOldApplication,
  getAllApplications,
  sortApplicationScore,
  updateApplication,
  updateApplicationScore,
} from "./application.service";

export const addNewApplication = async (req, res) => {
  try {
    const { user } = req;
    const { body } = req;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Create Application",
      company_id: user.company_id,
    };
    const findOldWithName = await findOldApplication(user.company_id, body);
    if (findOldWithName > 0) {
      res.status(400).json({
        error: true,
        message: "Application name already exists. Please use different name.",
      });
    } else {
      const payload = {
        company_id: user.company_id,
        name: body.name,
        description: body.description,
        is_shared_service: body.is_shared_service,
        is_using_other_services: body.is_using_other_services,
        risk_score: 0.0,
      };
      const applicationData = await createApplication(payload, clientDetails);
      await addAssetsToApplication(
        body.asset_ids,
        applicationData,
        user.company_id,
        clientDetails
      );
      await addServicesToApplication(
        body.service_ids,
        applicationData,
        user.company_id,
        clientDetails
      );
      await addHumansToApplication(
        body.human_ids,
        applicationData,
        user.company_id,
        clientDetails
      ).then(async () => {
        await updateApplicationScore(applicationData);
        res.status(200).json({
          message: "Application created successfully",
          applicationName: body.name,
        });
      });
    }
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { user } = req;
    const body = req.params;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Delete Application",
      company_id: user.company_id,
    };
    const application = await findApplicationById(body);
    deleteApplicationByID(application, clientDetails, res);
  } catch (err) {
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const viewApplication = async (req, res) => {
  try {
    const body = req.params;
    // console.log('req', req)
    const applicationData = await findApplicationById(body);
    const application = JSON.parse(JSON.stringify(applicationData));
    const { application_custom_weightage_scores } = application;
    delete application.secrets_custom_weightage_scores;
    application.scores = sortApplicationScore(
      application_custom_weightage_scores,
      application?.default_risk_score
    );
    const sharedServices = await ApplicationServicesSQLModel.findAll({
      where: {
        application_id: application.id,
      },
      include: [{ model: ApplicationSQLModel }],
    });
    application.sharedServices = sharedServices;

    const allApplicationsRiskScoreSum = await ApplicationSQLModel.sum(
      "risk_score",
      {
        where: {
          company_id: application.company_id,
        },
      }
    );
    const allApplicationsRiskScoreCount = await ApplicationSQLModel.count({
      where: {
        company_id: application.company_id,
      },
    });
    const average = allApplicationsRiskScoreSum / allApplicationsRiskScoreCount;

    if (application) {
      return res.status(200).json({
        message: "fetch application successfully",
        application,
        sharedServices,
        average: Math.round(average),
      });
    }
    res.status(400).json({ message: "Application not found" });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const editApplication = async (req, res) => {
  try {
    const { user } = req;
    const { body } = req;
    const { id } = req.params;
    body.id = id;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Update Application",
      company_id: user.company_id,
    };
    const findOldWithName = await findOldApplication(user.company_id, body);
    if (findOldWithName > 0) {
      res.status(400).json({
        error: true,
        message: "Application name already exists. Please use different name.",
      });
    } else {
      const payload = {
        company_id: user.company_id,
        name: body.name,
        description: body.description,
        is_shared_service: body.is_shared_service,
        is_using_other_services: body.is_using_other_services,
        default_risk_score: 0.0,
      };
      await updateApplication(payload, body, clientDetails);
      const applicationData = await findApplicationById(body);
      await addAssetsToApplication(
        body.asset_ids,
        applicationData,
        user.company_id,
        clientDetails
      );
      // Unasign assets from application
      const deleteAssetIds = body?.deleted_asset_ids || [];
      // console.log('deleteAssetIds', deleteAssetIds)
      if (deleteAssetIds.length > 0) {
        deleteAssetIds?.map((assetId) => {
          addEventLog(
            {
              id: user?.id,
              email: user?.email,
              ipAddress: req.socket.remoteAddress,
              company_id: user.company_id,
              process: `Asset unassigned from application "${applicationData.name}"`,
              user_id: null,
              asset_id: assetId,
              isSystemLog: false,
              effected_table: ApplicationSQLModel.tableName,
              target_id: applicationData.id,
            },
            AssetUnassignToApplication.status
              .AssetUnassignToApplicationSuccessfully.code,
            null
          );
          return true;
        });
      }
      await addServicesToApplication(
        body.service_ids,
        applicationData,
        user.company_id,
        clientDetails
      );
      await addHumansToApplication(
        body.human_ids,
        applicationData,
        user.company_id,
        clientDetails
      ).then(async () => {
        await updateApplicationScore(applicationData);
        res.status(200).json({
          message: "Application updated successfully",
          groupName: body.name,
        });
      });
    }
  } catch (err) {
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const applicationList = async (req, res) => {
  try {
    const { query } = req;
    const { size, page } = query;
    const filter = query.filter ? JSON.parse(query.filter) : {};
    const { user } = req;
    const applications = await getAllApplications(
      user.company_id,
      page,
      size,
      filter
    );

    res.status(200).json({
      message: "Application fetched successfully",
      ...applications,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const getSharedApplications = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { user } = req;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    let sort = "DESC";
    let sortColumn = "createdAt";
    let filter = {};
    if (query?.filter) {
      filter = JSON.parse(query.filter);
    }
    const filterObj = {
      company_id: user.company_id,
      is_shared_service: true,
    };
    if (filter?.sort) {
      sort = filter?.sort === "asc" ? "ASC" : "DESC";
      sortColumn = "name";
    }
    if (filter?.not_included_ids) {
      filterObj.id = { [Op.notIn]: filter?.not_included_ids };
    }
    if (filter?.included_ids) {
      filterObj.id = { [Op.in]: filter?.included_ids };
    }
    const applications = await ApplicationSQLModel.findAll({
      where: filterObj,
      offset: (page - 1) * size,
      limit: +size,
      order: [[sortColumn, sort]],
    });
    const totalCount = await ApplicationSQLModel.count({
      where: filterObj,
    });
    res.status(200).json({
      message: "Shared Applications fetched successfully",
      tableData: applications,
      totalCount,
    });
  } catch (err) {
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};
