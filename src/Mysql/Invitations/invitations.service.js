import { Op } from "sequelize"
import { roles, superAdminId1, superAdminId2 } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import { getCompany } from "../Companies/company.service";
import {
  deleteUserInvitationActivity,
  getUserInvitationActivity,
  inviteUserActivity,
} from "../Logs/ActivitiesType/userActivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import invitationModel from "./invitations.model";

const invitationService = {
  async getInvitedUsersAndTotalCount(company_id = null, queryFilter, client, page = 1, size = 10) {
    try {

      const filterObj = {}
      let filterObject
      if (queryFilter) {
        filterObject = JSON.parse(queryFilter)
      } else {
        filterObject = {}
      }

      let sort = "DESC"
      let sortColumn = "createdAt"
      if (filterObject?.sort) {
        sort = filterObject?.sort
        sortColumn = "email"
      }
      if (filterObject?.search) {
        filterObj.email = { [Op.like]: `%${filterObject?.search}%` }
      }
      if (company_id) {
        filterObj.company_id = company_id
      }
      if (filterObject?.type === "company") {
        filterObj.company_name = { [Op.ne]: null }
      } else {
        filterObj.company_name = null
      }
      if (filterObject?.type === roles.Partner) {
        filterObj.invited_to = roles.Partner
      }
      console.log("filterObj=====", filterObj)
      const users = await invitationModel.findAll({
        where: filterObj,
        offset: (page - 1) * size,
        limit: +size,
        nest: true,
        raw: true,
        order: [
          [sortColumn, sort],
          // [sequelize.literal('assetsCount'), assetCountSort],
        ],
      });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationSuccessfully.code
        );
      }
      const totalCount = await invitationModel.count({
        where: filterObj,
      })
      return Promise.resolve({users, totalCount});
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },
  async sendInvite(invitation, client) {
    try {
      const response = await invitationModel.create(invitation);
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          inviteUserActivity.status.createUserInvitationSuccessfully.code,
          createEventPayload(
            JSON.parse(JSON.stringify(response)),
            {},
            invitationModel.tableName
          )
        );
      }
      return Promise.resolve(response);
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },

  async findInvite(code, client) {
    try {
      const response = await invitationModel.findOne({
        where: { invite_code: code },
        nest: true,
        raw: true,
      });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationSuccessfully.code
        );
      }
      return Promise.resolve(response);
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },
  async findInviteByEmail(filterObj, client) {
    try {
      const response = await invitationModel.findOne({
        // where: { email },
        where: filterObj
      });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationSuccessfully.code
        );
      }
      return Promise.resolve(response);
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },
  async findInviteById(id, client) {
    try {
      const response = await invitationModel.findOne({ where: { id } });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationSuccessfully.code
        );
      }
      return Promise.resolve(response);
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },
  async updateInvite(invite, client) {
    try {
      const response = await invitationModel.update(invite, {
        where: { id: invite.id },
      });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationSuccessfully.code
        );
      }
      return Promise.resolve(response);
    } catch (err) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          getUserInvitationActivity.status.getUserInvitationFailed.code,
          null,
          err.message
        );
      }
      return Promise.reject(err);
    }
  },
  async deleteInvitation(id, client) {
    try {
      const response = await invitationModel.destroy({ where: { id } });
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          deleteUserInvitationActivity.status.userDeletedSuccessfully.code
        );
      }
      return Promise.resolve(response);
    } catch (error) {
      if (client) {
        await addEventLog(
          { ...client, user_id: null },
          deleteUserInvitationActivity.status.userDeletingFailed.code,
          null,
          error.message
        );
      }
      return Promise.reject(error);
    }
  },
  async checkIsWithPartner (invited_from, company_domain, company_id = null) {
    try {
      const company = await getCompany(company_domain[1]);    
      
      // i`f( (company_id && company_id===superAdmin.id && invited_from === roles.SuperAdmin) || (company_id === null && company && invited_from === roles.Partner)) {
      //   return false;        
      // }`

      if( (company_id === null || company_id === superAdminId1 || company_id === superAdminId2) && company && (invited_from === roles.Partner || invited_from === roles.SuperAdmin)) {
        return false;        
      }
      return true;       
    } catch(err) {
      errorHandler(err);
      return err.message
    }
  },
};
export default invitationService;
