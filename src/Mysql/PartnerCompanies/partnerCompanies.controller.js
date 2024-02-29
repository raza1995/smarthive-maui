import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import { getEventLogs } from "../Logs/eventLogs/eventLogs.service";
import userService, { getAllUsersAndTotal, getUserByFilter, updateUser } from "../Users/users.service";
import { createPartnerCompanyRelation, deleteCompanyById, findPartnerCompanyById, getCompanyAllApplicationsData, getCompanyAllAssetsData, getCompanyAllEndpointsData, getCompanyAllHumansData, getCompanyAllSecretsData, getPartnerCompanies, getTotalPartnerCompanies, getTotalPartnerHighRiskCompanies, getTotalPartnerLowRiskCompanies, getTotalPartnerMediumRiskCompanies } from "./partnerCompanies.service";
import { getUserRole, getUserRoleType } from "../UserRoles/userRoles.service";
import eventLogsModel from "../Logs/eventLogs/eventLogs.model";
import activityStatusModel from "../Logs/activityStatus/activityStatus.model";
import { roles, severitiesTypes } from "../../utils/constants";
import {getAssetsByCompanyId } from "../Assets/assets.service";
import { companyLoginToken } from "../Companies/company.service";
import companyModel from "../Companies/company.model";
import userHasPermissionsSQLModel from "../UserHasPermissions/userHasPermissions.model";
import userRolesSQLModel from "../UserRoles/userRoles.model";
import rolesSQLModel from "../Roles/roles.model";
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model";
import userModel from "../Users/users.model";
import invitationService from "../Invitations/invitations.service";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";
import { addRole } from "../Roles/roles.controller";
import { createRolePermissions } from "../Permissions/permission.service";

export const dashboard = async (req, res) => {
    try {        
        const {user} = req;
        const { query } = req;
        const { page } = query;
        const { size } = query;

        const partnerCompany = await findPartnerCompanyById(user.company_id, user);
        if(!partnerCompany) {
            const roleConfig = { role: "admin", role_permissions: [] };
            await createRolePermissions(user.company_id, "company");
            await createPartnerCompanyRelation(
                user.company_id,
                user.id,
                user.company_id
            );

            // RoleFunction
            await addRole(
                "admin",
                roleConfig.role_permissions,
                user.company_id,
                user.id,
                "company",
                true
            );
        }
        const companies = await getPartnerCompanies(user, page, size);
        // const totalCompanies = await getTotalPartnerCompanies(user);
        const totalCompanies = await getTotalPartnerCompanies({ user_company_id: user.company_id, company_id: { [Op.ne]: user.company_id } });
        const lowRiskClients = await getTotalPartnerLowRiskCompanies(user);
        const highRiskClients = await getTotalPartnerHighRiskCompanies(user);
        const mediumRiskClients = await getTotalPartnerMediumRiskCompanies(user);
        res.status(200).json({
            valid: true,
            message: "dashboard fetch successfully",
            companies,
            totalCompanies,
            lowRiskClients,
            highRiskClients,
            mediumRiskClients
        });
    }catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

export const getCompaniesList  = async (req, res) => {
    try {
        const {user} = req;
        const { query } = req;
        const { page } = query;
        const { size } = query;
        const tableData = await getPartnerCompanies(user, page, size);
        // const totalCount = await getTotalPartnerCompanies(user);
        const totalCount = await getTotalPartnerCompanies({ user_company_id: user.company_id });
        res.status(200).json({
            valid: true,
            message: "Companies fetch successfully",
            page,
            size,
            totalCount,
            tableData,
        });
    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get Partner companies by Id
export const getPartnerCompaniesById = async (req, res) => {
    try {
        const { query } = req;
        const { page } = query;
        const { size } = query;
        const {partner_id } = req.params;
        const partner = await getUserByFilter({id: partner_id}, null);
        const tableData = await getPartnerCompanies(partner, page, size);
        // const totalCount = await getTotalPartnerCompanies(partner);
        const filterObj = {};
        filterObj[Op.or] = [
            { user_company_id: partner.company_id, company_id: { [Op.ne]: partner.company_id } },
            { company_id: partner.company_id, user_id: partner.id, user_company_id: partner.company_id  },
        ]; 
        // const totalCount = await getTotalPartnerCompanies({ user_company_id: partner.company_id });
        const totalCount = await getTotalPartnerCompanies(filterObj);
        res.status(200).json({
            valid: true,
            message: "Companies fetch successfully",
            page,
            size,
            totalCount,
            tableData,
        });

    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Delete a company Function

export const deletePartnerCompany = async (req, res) => {
    try {
        const {user} = req;
        const body = req.params;
        const company = await findPartnerCompanyById(body?.id, user);
        if(company) {
            await deleteCompanyById(company, user)
            res.status(200).json({
                valid: true,
                message: "Company deleted successfully",
            });
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
            // deleteApplicationByID(application, clientDetails, res);
        }        

    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}


// Get Compony Details
export const getCompanyDetails = async(req, res) =>{
    try {
        const {user} = req;
        const { id } = req.params;
        const company = await findPartnerCompanyById(id, user);
        if(company) {
            res.status(200).json({
                valid: true,
                data: company,
                message: "Company details fetched successfully",
            });
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }   
    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
} 

// Get Company Logs
export const getCompanyLogs = async(req, res) =>{
    try {
        const {user, query} = req;
        const { id } = req.params;
        const company = await findPartnerCompanyById(id, user);
        if(company) {
            const { filter, page, size } = query;
            const filterQuery = {};
            let filterObj;
            if (filter) {
                filterObj = JSON.parse(filter);
            }else{
                filterObj = {};
            }
            if (filterObj?.search) {
                filterQuery.process = { [Op.like]: `%${filterObj?.search}%` };
            }
            if (filterObj?.severity?.length > 0) {
                filterQuery["$activity_status.severity$"] = {
                    [Op.in]: filterObj.severity,
                };
            }
            if (filterObj?.status?.length > 0) {
                filterQuery["$activity_status.status$"] = {
                    [Op.in]: filterObj.status,
                };
            }
            filterQuery.company_id = id;
            console.log("filterQuery", filterQuery)

            const offset = size * (page - 1);
            const limit = +size;
            const logs = await getEventLogs(
                filterQuery,
                offset,
                limit,
                filterObj?.sortBy
            );
            res.status(200).json({
                valid: true,
                data: logs,
                message: "Company logs fetched successfully",
            });
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }   
    }catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get company Logs statics
export const getCompanyLogStatics = async (req, res) => {
  try {
    const {user} = req;
    const { id } = req.params;
    const company = await findPartnerCompanyById(id, user);
    if(company) {
        const count = await eventLogsModel.count({
            where: { company_id: id },
        });
        const highSeverityLogsCount = await eventLogsModel.count({
            where: { company_id: id },
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
            where: { company_id: id },
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
            where: { company_id: id },
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
    .json({ valid: false, error: "Company not found with this user"});        
           
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

// Get Company user Logs
export const getCompanyUserLogs = async (req, res) => {
    try {
        const {user} = req;
        const { company_id } = req.params;
        const { user_id } = req.params;
        const company = await findPartnerCompanyById(company_id, user);
        if(company) {
            const { filter } = req.body;
            const { page } = req.query;
            const { size } = req.query;
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
            filterQuery.company_id = company_id
            filterQuery.user_id = user_id
            const logs = await getEventLogs(
                filterQuery,
                page,
                size,
                filter?.sortBy
            );
            res.status(200).json({
                valid: true,
                data: logs,
                message: "Company user logs fetched successfully",
            });
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }
    }catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get Company Login Link
export const getCompanyLoginLink = async (req, res) => {
    try{
        const {user} = req;
        const { id } = req.params;
        const company = await findPartnerCompanyById(id, user);
        if(company) {
            const response = await companyLoginToken(roles.Partner, id, user);
            res.status(StatusCodes.OK).json({
                valid: true,
                response,
                message: "Company login link fetched successfully",
            });            
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }
    }catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get company overview
export const getCompanyOverview = async(req,res) => {
    try {
        const {user} = req;
        const { id } = req.params;
        const company = await findPartnerCompanyById(id, user);
        if(company) {   
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
                    secrets: allSecretsData
                },
                message: "Company Overview data fetched successfully",
            });   
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }
    }catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get Company Assets List
export const getCompanyAssetList = async (req, res) => {
    try {
        const {user} = req;
        const { id } = req.params;
        const company = await findPartnerCompanyById(id, user);
        if(company) {  
            const { filter } = req.query;
            const { page } = req.query;
            const { size } = req.query;
            const result = await getAssetsByCompanyId(id, size, page, {});
            res.status(StatusCodes.OK).json({
                valid: true,
                data: result,
                message: "Company assets fetched successfully",
            });   
        }else {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"});        
        }
    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get All Partners for Superadmin Portal
export const getAllPartners = async (req, res) => {
    try {
        const { filter } = req.query;
        const { page } = req.query;
        const { size } = req.query;
        const filterObject = {
            role_type: roles.Partner
        }
        let filterobj
        if(filter){
            filterobj = JSON.parse(filter)
        }else{
            filterobj = {}
        }
        if (filterobj?.search) {
            filterObject.full_name = { [Op.like]: `%${filterobj?.search}%` };
        }
        const data = await getAllUsersAndTotal(
            filterObject, page, size, filterobj?.sort
        )
        res.status(StatusCodes.OK).json({
            valid: true,
            ...data,
            message: "Partners fetched successfully",
        });  

    } catch (err) {
        errorHandler(err);
        return res
        .status(400)
        .json({ valid: false, error: err?.message});
    }
}

// Get Partner Company Current Users
export const getPartnerCompanyCurrentUsers = async (req, res) => {
    try {
        const { user, params, query } = req;
        const { filter, page, size } = query;
        const { company_id } = params;

        const company = await findPartnerCompanyById(company_id, user);
        if(!company) {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"}); 
        }
        
        const usersAndTotalCount = await userService.getUsersAndTotalCount(
            true,
            company_id,
            filter,
            {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: "Get company users by partner",
            company_id
            },
            page,
            size,
        );
        return res.json({ valid: true, data: usersAndTotalCount.users, totalCount: usersAndTotalCount.totalCount });
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}

// Get Partner Company Pending Users
export const getPartnerCompanyPendingUsers = async (req, res) => {
    try {
        const { user, params, query } = req;
        const { filter, page, size } = query;
        const { company_id } = params;

        const company = await findPartnerCompanyById(company_id, user);
        if(!company) {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"}); 
        }
        
        const pendingUsersAndTotalCount = await userService.getUsersAndTotalCount(
            false,
            company_id,
            filter,
            {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: "Get company users by admin",
            company_id
            },
            page,
            size,
        );
        return res.json({ valid: true, data: pendingUsersAndTotalCount.users, totalCount: pendingUsersAndTotalCount.totalCount });
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}

// Get Company Invited Users
export const getCompanyInvitedUsers = async (req, res) => {
    try {
        const { user, params, query } = req;
        const { filter, page, size } = query;
        const { company_id } = params;
        const invitedBy = user
        // console.log("company_id  ======== ", company_id)

        const company = await findPartnerCompanyById(company_id, user);
        if(!company) {
            return res
            .status(400)
            .json({ valid: false, error: "Company not found with this user"}); 
        }

        const invitedUsersAndTotalCount = await invitationService.getInvitedUsersAndTotalCount(
            company_id,
            filter,
            {
              id: invitedBy?.id || "",
              email: invitedBy?.email,
              ipAddress: req.socket.remoteAddress,
              process: "Get invited user",
              company_id: invitedBy?.company_id
            },
            page,
            size
          )
          
        return res.json({ valid: true, data: invitedUsersAndTotalCount.users, totalCount: invitedUsersAndTotalCount.totalCount })
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}

// Get Partner Current Users
export const getPartnerCurrentUsers = async (req, res) => {
    try {
        const { user, query } = req;
        const { filter, page, size } = query;
        
        const usersAndTotalCount = await userService.getUsersAndTotalCount(
            true,
            user.company_id,
            filter,
            {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: "Get users by partner",
            company_id: user.company_id
            },
            page,
            size,
        );
        return res.json({ valid: true, data: usersAndTotalCount.users, totalCount: usersAndTotalCount.totalCount });
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}

// Update partner user status
export const partnerUserUpdateStatus = async (req, res) => {
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
        return res.json({ valid: true, message: "User status updated successfully" });
      }
      return res.status(400).json({ valid: false, message: "Invalid user" });
    } catch (err) {
      errorHandler(err);
      return res.status(400).json({
        valid: false,
        error: `${err.response?.data?.message || err.message}`,
      });
    }
  }

export const partnerUpdateUserDetails = async (req, res) => {
    try {
      const { body } = req;
      console.log("partnerUpdateUserDetails body =========== ", body)
      body.type = "company";
    //   await addRole(body.role, body.role_permissions, body.company_id, body.id, body.type);
      await addRole(body.role, body.role_permissions, body.company_id, body.id, "partner");
      await createPartnerCompanyRelation(
        body.company_id,
        body.id,
        body.company_id
      );
      await addRole(body.role, body.role_permissions, body.company_id, body.id, "company", true);
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
  }

// Partner delete user
export const partnerDeleteUser = async (req, res) => {
    try {
        const logInUser = req.user;
        const { id } = req.params;
        let user = null;
        const userInfo = await userService.getUserByFilter({
            id,
        });
        const checkCompanyWithPartner = await findPartnerCompanyById(
        userInfo.company_id,
        logInUser
        );
        // Check if loggedin user company is equals to deleteable user company
        const isPartnerCompany = userInfo.company_id === logInUser.company_id;
        if (checkCompanyWithPartner || isPartnerCompany) {
        user = userInfo;
        }

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
            company_id: user.company_id
        });

        return res.json({ valid: true, message: "User deleted successfully" });
    } catch (err) {
      errorHandler(err);
      return res.json({ valid: false, error: "Internal server error" });
    }
}

// Get Partner Invited Companies
export const getPartnerInvitedCompanies = async (req, res) => {
    try {
        const { user, params, query } = req;
        const { filter, page, size } = query;
        const invitedBy = user

        const invitedUsersAndTotalCount = await invitationService.getInvitedUsersAndTotalCount(
            invitedBy?.company_id,
            filter,
            {
              id: invitedBy?.id || "",
              email: invitedBy?.email,
              ipAddress: req.socket.remoteAddress,
              process: "Get invited user",
              company_id: invitedBy?.company_id
            },
            page,
            size
          )
          
        return res.json({ valid: true, data: invitedUsersAndTotalCount.users, totalCount: invitedUsersAndTotalCount.totalCount })
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}

// Partner Delete Company Invitation
export const partnerCompanyCancelInvitation = async (req, res) => {
    try {
        const loggedInUser = req.user
        const { id } = req.params
        const user = await invitationService.findInviteById(id)
        if (!user?.id) {
            return res.json({ valid: false, error: "company with id not found" })
        }
        await invitationService.deleteInvitation(id, {
            id: loggedInUser.id,
            email: loggedInUser.email,
            ipAddress: req.socket.remoteAddress,
            process: "Cancel invitation by partner",
            company_id: user.company_id,
        })

        return res.json({ valid: true, message: "Company deleted successfully" })
    } catch (err) {
      errorHandler(err);
      return res.json({ valid: false, error: "Internal server error" });
    }
}

// Get Partner Users Invited
export const getPartnerUsersInvited = async (req, res) => {
    try {
        const { user, params, query } = req;
        const { filter, page, size } = query;
        // const { company_id } = params;
        const invitedBy = user
        // console.log("company_id  ======== ", company_id)

        // const company = await findPartnerCompanyById(user.company_id, user);
        // if(!company) {
        //     return res
        //     .status(400)
        //     .json({ valid: false, error: "Company not found with this user"}); 
        // }

        const invitedUsersAndTotalCount = await invitationService.getInvitedUsersAndTotalCount(
            user.company_id,
            filter,
            {
              id: invitedBy?.id || "",
              email: invitedBy?.email,
              ipAddress: req.socket.remoteAddress,
              process: "Get invited user",
              company_id: invitedBy?.company_id
            },
            page,
            size
        )
          
        return res.json({ valid: true, data: invitedUsersAndTotalCount.users, totalCount: invitedUsersAndTotalCount.totalCount })
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
}
