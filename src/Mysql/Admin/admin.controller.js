import HttpStatus from "http-status-codes";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";

import settingModel from "../../mongo/models/inventory/settings";
import userService, { findUserOAuthId, getUsers } from "../Users/users.service";
import companyService from "../Companies/company.service";
import { getIntegrationByFilter } from "../Integration/integration.service";
import { errorHandler } from "../../utils/errorHandler";

const {
  roles,
  integrationsNames,
} = require("../../utils/constants");

const adminController = {
  async getUser(req, res) {
    try {
      const { id } = req.query;
      if (
        req.user[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
        ].indexOf(roles.SuperAdmin) === -1 &&
        req.user[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
        ].indexOf(roles.CustomerAdmin) === -1
      ) {
        res.status(HttpStatus.FORBIDDEN).json({
          valid: false,
          error: "You are not authorized to view profile",
        });
      }

      const users = await userService.getUsers({ _id: id });

      return res.json({ valid: true, data: users });
    } catch (err) {
      return res.status(500).json({
        valid: false,
        data: null,
        error: "Something went wrong",
        stack: err,
      });
    }
  },
  async getUsers(req, res) {
    try {
      let users = [];
      const userList = [];

      // https://sequelize.org/docs/v6/core-concepts/assocs/
      users = await getUsers({ role: "customer_admin" });
      if (users && users.length) {
        await Promise.all(
          users.map(async (u) => {
            const newObj = { ...u.dataValues };
            const auvik = await getIntegrationByFilter({
              company_id: u.company_id,
              // integration_id: auvikId,
              integration_name: integrationsNames.AUVIK,
            });
            if (auvik) {
              newObj.auvik = {
                id: auvik.id,
                tenant_id: auvik.integration_values.tenant_id,
              };
            }
            const automox = await getIntegrationByFilter({
              company_id: u.company_id,
              integration_name: integrationsNames.AUTOMOX,
            });
            if (automox) {
              newObj.automox = {
                id: automox.id,
                access_key: automox?.integration_values?.access_key,
                organization_id: automox?.integration_values?.organization_id,
              };
            }

            userList.push(newObj);
          })
        );
      }
      return res.json({ valid: true, data: userList });
    } catch (error) {
      errorHandler(error)
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
  },
  async updateUser(req, res) {
    try {
      const userToUpdate = req.body;
      let users = await getUsers({ email: userToUpdate.email });
      let user = null;
      if (users && users.length > 0) {
        [user] = users;
        if (user.id !== userToUpdate.id) {
          return res.json({
            valid: false,
            error: "User with email already exists",
          });
        }
      } else {
        users = await getUsers({
          phone_number: userToUpdate.phone_number,
        });
        if (users && users.length > 0) {
          const existingUser = users[0];

          if (existingUser.id !== userToUpdate.id) {
            return res.json({
              valid: false,
              error: "User with phone number already exists",
            });
          }
        }
      }
      const auth0Service = new Auth0ManagementService();
      // await auth0Service.authorize();
      // const userDetails = await auth0Service.getUser(user.auth0_id);

      // if (userDetails.email) {
      //     userDetails.email = userToUpdate.email;
      // }
      // if (userDetails.phone_number) {
      //     userDetails.phone_number = userToUpdate.phone_number;
      // }

      // auth0Service.updateUser(userDetails);

      user.email = userToUpdate.email;
      // console.log('Users', users);

      if (user.role !== userToUpdate.role) {
        const auth0Roles = await auth0Service.getRoles();
        const userRole = auth0Roles.data.find((m) => m.name === user.role);
        const newRole = auth0Roles.data.find(
          (m) => m.name === userToUpdate.role
        );
        await auth0Service.removeUserFromRole(user.auth0_id, [userRole.id]);
        await auth0Service.setUserRoles(user.auth0_id, [newRole.id]);
      }
      const company = await companyService.getCompanyByFilter({
        id: user.company_id,
      });
      if (company) {
        company.tenant = userToUpdate.tenant;
        await companyService.saveCompany(company);
      }
      // eslint-disable-next-line no-unused-vars
      const response = await userService.updateUser(
        userToUpdate.id,
        userToUpdate,
        {
          id: user.id,
          email: user.email,
          ipAddress: req.socket.remoteAddress,
          process: "updated user detail",
        }
      );

      return res.json({ valid: true, message: "User updated successfully" });
    } catch (err) {
      return res
        .status(200)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },
  async getUserInfo(req, res) {
    try {
      const user = await userService.findUserOAuthId(req.user.sub);
      return res.json(user);
    } catch (err) {
      return res
        .status(500)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },
  async deleteUser(req, res) {
    try {
      const logInUser = await userService.findUserOAuthId(req.user.sub);
      const { id } = req.params;
      const users = await userService.getUserByFilter({
        id,
        company_id: logInUser.company_id,
      });
      if (!users || users.length === 0) {
        return res.json({ valid: false, error: "User with id not found" });
      }
      const user = users[0];
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
  },
  async addPatchUrl(req, res) {
    try {
      const loggedInUser = req.user;
      const data = req.body;
      const user = await findUserOAuthId(loggedInUser.sub);
      if (data._id) {
        settingModel.findByIdAndUpdate(
          data._id,
          data,
          { new: true },
          (err, resp) => {
            if (err) return res.status(500).json(err);
            return res.json({
              valid: true,
              data: resp,
              message: "Patch Url added successfully",
            });
          }
        );
      } else {
        settingModel.create(
          {
            user_id: user.id,
            patchUrl: data.patchUrl,
          },
          (err, resp) => {
            if (err) return res.status(500).json(err);
            return res.json({
              valid: true,
              data: resp,
              message: "Patch Url added successfully",
            });
          }
        );
      }
    } catch (err) {
      return res
        .status(500)
        .json({ valid: false, error: "Internal server error" });
    }
  },
  async getPatchUrl(req, res) {
    try {
      const loggedInUser = req.user;
      const user = await findUserOAuthId(loggedInUser.sub);
      settingModel.findOne(
        {
          user_id: user.id,
        },
        (err, resp) => {
          if (err) return res.status(500).json(err);
          return res.json(resp);
        }
      );
    } catch (err) {
      return res
        .status(500)
        .json({ valid: false, error: "Internal server error" });
    }
  },
};

export default adminController;
