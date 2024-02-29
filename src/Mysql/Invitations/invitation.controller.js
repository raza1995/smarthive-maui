import axios from "axios";
import HttpStatus from "http-status-codes";
import { v4 } from "uuid";
import { Op } from "sequelize";
import emailService from "../../utils/EmailServices/emailService";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";
import invitationService from "./invitations.service";
import userService, {
  findUserByEmail,
  findUserOAuthId,
} from "../Users/users.service";

import { errorHandler } from "../../utils/errorHandler";

import { getCompanyByFilter } from "../Companies/company.service";

const {
  roles,
  passwordLessSignup,
  passwordSignUp,
} = require("../../utils/constants");

const invitationController = {
  async getInvitedUsers(req, res) {
    try {
      const { user, query } = req;
      const { filter, page, size } = query;
      const invitedBy = user;
      const { company_id } = user;

      const invitedUsersAndTotalCount =
        await invitationService.getInvitedUsersAndTotalCount(
          company_id,
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
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        error: `Something went wrong please try again later,${err.message}`,
      });
    }
  },
  async cancelInvitation(req, res) {
    try {
      const loggedInUser = req.user;
      const { id } = req.params;
      const user = await invitationService.findInviteById(id);
      if (!user.id) {
        return res.json({ valid: false, error: "User with id not found" });
      }
      await invitationService.deleteInvitation(id, {
        id: loggedInUser.id,
        email: loggedInUser.email,
        ipAddress: req.socket.remoteAddress,
        process: "Cancel invitation by admin",
        company_id: user.company_id,
      });

      return res.json({ valid: true, message: "User deleted successfully" });
    } catch (err) {
      return res.json({ valid: false, error: "Internal server error" });
    }
  },

  async sendInvite(req, res) {
    try {
      const message = "Invitation sent successfully";
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const invitedBy = req.user;
      const userData = req.user;
      const { data } = request;
      const { role } = data;
      const { role_permissions } = data;
      const { inviting_emails } = data;
      const { invited_from } = data;
      const { invited_to } = data;
      const { company_name } = data;
      const { company_id } = data;
      const { address } = data;
      const { industry } = data;
      // get or save company
      const error = false;
  
      for await (const email of inviting_emails) {
        //      inviting_emails?.forEach(async (email) => {
        const company_domain = email.split("@");
        const checkIsWithPartner = await invitationService.checkIsWithPartner(
          invited_from,
          company_domain,
          company_id
        );
        if (!checkIsWithPartner) {
          return res.json({
            valid: false,
            error: "You cannot invite with given details",
          });
        }
        const user = await findUserByEmail(email);
        if (user) {
          return res.status(400).json({
            valid: false,
            error: "You cannot invite with given details",
          });
        }
        let companyId;
        // if (invited_from === roles.SuperAdmin) {
        //   companyId = null
        // } else
        if (company_id) {
          companyId = company_id;
        } else {
          companyId = userData?.company_id;
          // companyId = req.user?.company_id
        }
        const companyInfo = company_name
        ? { company_name }
        : await getCompanyByFilter({ id: companyId });
        const invitation = {
          email,
          invited_by: userData?.id,
          company_id: companyId,
          is_expired: false,
          invite_code: v4(),
          role,
          role_permissions,
          invited_from: invited_from || null,
          invited_to: invited_to || null,
          company_name: company_name || null,
          address: address || null,
          industry: industry || null,
        };
        // console.log("invitation", invitation)
        const filterObj = {
          email: invitation.email,
          company_id: invitation.company_id,
        };
        const existingInvite = await invitationService.findInviteByEmail(
          // invitation.email
          filterObj
        );
        if (!existingInvite) {
          await invitationService.sendInvite(invitation, {
            id: userData.id,
            email: userData.email,
            company_id: userData.company_id,
            ipAddress: req.socket.remoteAddress,
            process: `User invited by ${userData.full_name}`,
          });
        } else {
          const existingInviteData = JSON.parse(JSON.stringify(existingInvite));
          // console.log({ existingInviteData })
          const newInvite = {
            // ...existingInviteData,
            // invite_code: invitation.invite_code,
            id: existingInviteData.id,
            ...invitation,
          };
          await invitationService.updateInvite(newInvite, {
            id: userData.id,
            email: userData.email,
            company_id: userData.company_id,
            ipAddress: req.socket.remoteAddress,
            process: `User Again invited by ${userData.full_name}`,
          });
        }
        const loggedInUser = req.user;
        await emailService.sendInvite(
          loggedInUser.full_name,
          invitation.email,
          invitation.invite_code,
          invited_to,
          companyInfo.company_name,
          invitation.role
        );
      }

      return res.json({ valid: true, message });
    } catch (err) {
      errorHandler(err);
      return res.json({
        valid: false,
        error: `Something went wrong please try again later,${err.message}`,
      });
    }
  },
};

export default invitationController;
