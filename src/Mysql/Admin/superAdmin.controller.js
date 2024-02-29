import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import {
  getCompaniesWithSize,
  getTotalCompanies,
  getTotalLowRiskCompanies,
  getTotalHighRiskCompanies,
  getTotalMediumRiskCompanies,
  getTopScorerCompany,
  getLeastScorerCompany,
  getAverageScorerCompany,
  findCompanyById,
  companyLoginToken,
  deleteCompanyById,
} from "../Companies/company.service";
import { getEventLogs } from "../Logs/eventLogs/eventLogs.service";
import {
  getCompanyAllApplicationsData,
  getCompanyAllAssetsData,
  getCompanyAllEndpointsData,
  getCompanyAllHumansData,
  getCompanyAllSecretsData,
} from "../PartnerCompanies/partnerCompanies.service";
import eventLogsModel from "../Logs/eventLogs/eventLogs.model";
import activityStatusModel from "../Logs/activityStatus/activityStatus.model";
import {
  restrictedActivityCodes,
  roles,
  severitiesTypes,
} from "../../utils/constants";
import userService, { updateUser } from "../Users/users.service";
import invitationService from "../Invitations/invitations.service";
import { addRole } from "../Roles/roles.controller";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";

export const dashboard = async (req, res) => {
  try {
    const { query } = req;
    const { page } = query;
    const { size } = query;
    // const filter = { type: "company" };
    // const companies = await getCompaniesWithSize(query.filter, page, size);
    const totalCompanies = await getTotalCompanies(query.filter);
    const lowRiskClients = await getTotalLowRiskCompanies(query.filter);
    const highRiskClients = await getTotalHighRiskCompanies(query.filter);
    const mediumRiskClients = await getTotalMediumRiskCompanies(query.filter);
    const topScorerClient = await getTopScorerCompany(query.filter);
    const leastScorerClient = await getLeastScorerCompany(query.filter);
    const averageScorerClient = await getAverageScorerCompany(query.filter);
    console.log("highRiskClients", highRiskClients);
    res.status(200).json({
      valid: true,
      message: "dashboard fetch successfully",
      // companies,
      totalCompanies,
      lowRiskClients,
      highRiskClients,
      mediumRiskClients,
      topScorerClient,
      leastScorerClient,
      averageScorerClient,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get Compony Details
export const getCompanyDetails = async (req, res) => {
  try {
    const { company_id } = req.params;
    const company = await findCompanyById(company_id);
    if (company) {
      res.status(200).json({
        valid: true,
        data: company,
        message: "Company details fetched successfully",
      });
    } else {
      return res
        .status(400)
        .json({ valid: false, error: "Company not found with this user" });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get company overview
export const getCompanyOverview = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const company = await findCompanyById(id, user);
    if (company) {
      const allAssetsData = await getCompanyAllAssetsData(id);
      const allEndpointsData = await getCompanyAllEndpointsData(id);
      const allUsersData = await getCompanyAllHumansData(id);
      const allApplicationsData = await getCompanyAllApplicationsData(id);
      const allSecretsData = await getCompanyAllSecretsData(id);

      res.status(StatusCodes.OK).json({
        valid: true,
        company,
        overview: {
          assets: allAssetsData,
          endpoints: allEndpointsData,
          users: allUsersData,
          applications: allApplicationsData,
          secrets: allSecretsData,
        },
        message: "Company Overview data fetched successfully",
      });
    } else {
      return res
        .status(400)
        .json({ valid: false, error: "Company not found with this user" });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get Company Logs
export const getCompanyLogs = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const company = await findCompanyById(id, user);
    if (company) {
      const { filter } = req.body;
      const { page } = req.body;
      const { size } = req.body;
      const filterQuery = {};
      if (filter?.search) {
        filterQuery.process = { [Op.like]: `%${filter?.search}%` };
      }
      if (filter?.severity?.length > 0) {
        filterQuery["$activity_status.severity$"] = {
          [Op.in]: filter.severity,
        };
      }
      if (filter?.status?.length > 0) {
        filterQuery["$activity_status.status$"] = {
          [Op.in]: filter.status,
        };
      }
      filterQuery.company_id = id;
      console.log("filterQuery", filterQuery);

      const offset = size * (page - 1);
      const limit = +size;
      const logs = await getEventLogs(
        filterQuery,
        offset,
        limit,
        filter?.sortBy
      );
      res.status(200).json({
        valid: true,
        data: logs,
        message: "Company logs fetched successfully",
      });
    } else {
      return res
        .status(400)
        .json({ valid: false, error: "Company not found with this user" });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get company Logs statics
export const getCompanyLogStatics = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await findCompanyById(id);
    if (company) {
      const count = await eventLogsModel.count({
        distinct: "id",
        where: {
          company_id: id,
          status_code: {
            [Op.notIn]: restrictedActivityCodes,
          },
        },
        include: [
          {
            model: activityStatusModel,
            as: "activity_status",
            required: true,
          },
        ],
      });
      const highSeverityLogsCount = await eventLogsModel.count({
        distinct: "id",
        where: {
          company_id: id,
          attributes: ["status", "label", "code", "severity"],
          status_code: {
            [Op.notIn]: restrictedActivityCodes,
          },
        },
        include: [
          {
            model: activityStatusModel,
            where: { severity: severitiesTypes.high },
            as: "activity_status",
            required: true,
          },
        ],
      });
      const mediumSeverityLogsCount = await eventLogsModel.count({
        distinct: "id",
        where: {
          company_id: id,
          status_code: {
            [Op.notIn]: restrictedActivityCodes,
          },
        },
        include: [
          {
            model: activityStatusModel,
            where: { severity: severitiesTypes.medium },
            as: "activity_status",
            required: true,
          },
        ],
      });
      const lowSeverityLogsCount = await eventLogsModel.count({
        distinct: "id",
        where: {
          company_id: id,
          status_code: {
            [Op.notIn]: restrictedActivityCodes,
          },
        },
        include: [
          {
            model: activityStatusModel,
            where: { severity: severitiesTypes.low },
            as: "activity_status",
            required: true,
          },
        ],
      });
      return res.status(StatusCodes.OK).json({
        totalLogs: count,
        highSeverityLogsCount,
        mediumSeverityLogsCount,
        lowSeverityLogsCount,
      });
    }
    return res
      .status(400)
      .json({ valid: false, error: "Company not found with this user" });
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

// Get All Company Logs
export const getAllCompanyLogs = async (req, res) => {
  try {
    const { filter } = req.body;
    const { page } = req.body;
    const { size } = req.body;
    const filterQuery = {};
    if (filter?.search) {
      filterQuery.process = { [Op.like]: `%${filter?.search}%` };
    }
    if (filter?.severity?.length > 0) {
      filterQuery["$activity_status.severity$"] = {
        [Op.in]: filter.severity,
      };
    }
    if (filter?.status?.length > 0) {
      filterQuery["$activity_status.status$"] = {
        [Op.in]: filter.status,
      };
    }
    const offset = size * (page - 1);
    const limit = +size;
    const logs = await getEventLogs(filterQuery, offset, limit, filter?.sortBy);
    res.status(200).json({
      valid: true,
      data: logs,
      message: "Company logs fetched successfully",
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get All Company Log Stats
export const getAllCompanyLogStats = async (req, res) => {
  try {
    const { user } = req;
    const count = await eventLogsModel.count({
      distinct: "id",
      where: {
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          as: "activity_status",
          required: true,
        },
      ],
    });
    const highSeverityLogsCount = await eventLogsModel.count({
      distinct: "id",
      where: {
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.high },
          as: "activity_status",
          required: true,
        },
      ],
    });
    const mediumSeverityLogsCount = await eventLogsModel.count({
      distinct: "id",
      where: {
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.medium },
          as: "activity_status",
          required: true,
        },
      ],
    });
    const lowSeverityLogsCount = await eventLogsModel.count({
      distinct: "id",
      where: {
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.low },
          as: "activity_status",
          required: true,
        },
      ],
    });
    return res.status(StatusCodes.OK).json({
      totalLogs: count,
      highSeverityLogsCount,
      mediumSeverityLogsCount,
      lowSeverityLogsCount,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};
// Get Company Login Link
export const getCompanyLoginLink = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const company = await findCompanyById(id, user);
    if (company) {
      const response = await companyLoginToken(roles.SuperAdmin, id, user);
      res.status(StatusCodes.OK).json({
        valid: true,
        response,
        message: "Company login link fetched successfully",
      });
    } else {
      return res
        .status(400)
        .json({ valid: false, error: "Company not found with this user" });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Delete a company
export const deleteCompany = async (req, res) => {
  try {
    const { user } = req;
    const body = req.params;
    const company = await findCompanyById(body?.id, user);
    if (company) {
      await deleteCompanyById(company, user);
      res.status(200).json({
        valid: true,
        message: "Company deleted successfully",
      });
    } else {
      return res
        .status(400)
        .json({ valid: false, error: "Company not found with this user" });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ valid: false, error: err?.message });
  }
};

// Get Company Current Users
export const getSuperAdminCompanyCurrentUsers = async (req, res) => {
  try {
    const { user, params, query } = req;
    const { filter, page, size } = query;
    const { company_id } = params;
    const usersAndTotalCount = await userService.getUsersAndTotalCount(
      true,
      company_id,
      filter,
      {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Get company users by admin",
        company_id,
      },
      page,
      size
    );
    return res.json({
      valid: true,
      data: usersAndTotalCount.users,
      totalCount: usersAndTotalCount.totalCount,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

// Get Company Pending Users
export const getCompanyPendingUsers = async (req, res) => {
  try {
    const { user, params, query } = req;
    const { filter, page, size } = query;
    const { company_id } = params;
    const pendingUsersAndTotalCount = await userService.getUsersAndTotalCount(
      false,
      company_id,
      filter,
      {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Get company users by admin",
        company_id,
      },
      page,
      size
    );
    return res.json({
      valid: true,
      data: pendingUsersAndTotalCount.users,
      totalCount: pendingUsersAndTotalCount.totalCount,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

// Get Company Invited Users
export const getCompanyInvitedUsers = async (req, res) => {
  try {
    const { user, params, query } = req;
    const { filter, page, size } = query;
    const { company_id } = params;
    const invitedBy = user;

    const invitedUsersAndTotalCount =
      await invitationService.getInvitedUsersAndTotalCount(
        null,
        filter,
        {
          id: invitedBy?.id || "",
          email: invitedBy?.email,
          ipAddress: req.socket.remoteAddress,
          process: "Get invited user",
          company_id: invitedBy?.company_id,
        },
        page,
        size
      );

    return res.json({
      valid: true,
      data: invitedUsersAndTotalCount.users,
      totalCount: invitedUsersAndTotalCount.totalCount,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

// Company User Update Status
export const companyUserUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.findUserById(id);
    if (user) {
      const request = req.body;
      console.log(request);
      await userService.updateUser(id, request, {
        id: user.id,
        company_id: user.company_id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "update user status",
      });
      return res.json({
        valid: true,
        message: "User status updated successfully",
      });
    }
    return res.status(400).json({ valid: false, message: "Invalid user" });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({
      valid: false,
      error: `${err.response?.data?.message || err.message}`,
    });
  }
};

// Company User Update Details
export const companyUserUpdateDetails = async (req, res) => {
  try {
    const { body } = req;
    body.type = "company";
    await addRole(
      body.role,
      body.role_permissions,
      body.company_id,
      body.id,
      body.type
    );
    await updateUser(
      body.id,
      {
        full_name: body.name,
      },
      {
        id: req.user.id,
        email: req.user.email,
        ipAddress: req.socket.remoteAddress,
        process: "updated user detail",
      }
    );
    return res.json({ valid: true, message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ valid: false, error: error.message });
  }
};

// Company user delete
export const companyUserDelete = async (req, res) => {
  try {
    const logInUser = req.user;
    const { id } = req.params;
    const { company_id } = req.params;
    let user = null;

    user = await userService.getUserByFilter({
      id,
      company_id,
    });

    if (!user) {
      return res.json({ valid: false, error: "User with id not found" });
    }
    const auth0Service = new Auth0ManagementService();
    await auth0Service.deleteUser(user.auth0_id);
    await userService.deleteUser(user.id, {
      id: logInUser.id,
      email: logInUser.email,
      ipAddress: req.socket.remoteAddress,
      process: "User deleted by admin",
      company_id: user.company_id,
    });

    return res.json({ valid: true, message: "User deleted successfully" });
  } catch (err) {
    errorHandler(err);
    return res.json({ valid: false, error: "Internal server error" });
  }
};
