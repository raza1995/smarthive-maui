import axios from "axios";
import HttpStatus, { StatusCodes } from "http-status-codes";
import { v4 } from "uuid";
import { Op } from "sequelize";
import companyService from "../Companies/company.service";
import emailService from "../../utils/EmailServices/emailService";
import userService, {
  findUserByEmail,
  findUserByPhoneNumber,
  saveUser,
  updateUser,
} from "./users.service";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";
import { getUserIntegrationSupport } from "../Integration/integration.service";
import userModel from "./users.model";
import { addRole } from "../Roles/roles.controller";
import { getUserRoleAndPermissions } from "../Auth/auth.service";
import { errorHandler } from "../../utils/errorHandler";
import userRolesSQLModel from "../UserRoles/userRoles.model";
import rolesSQLModel from "../Roles/roles.model";
import roleHasPermissionsSQLModel from "../RoleHasPermissions/roleHasPermissions.model";
import permissionsSQLModel from "../Permissions/permissions.model";
import { getUserRole, getUserRoleType } from "../UserRoles/userRoles.service";
import { findPartnerCompanyById } from "../PartnerCompanies/partnerCompanies.service";
import companyModel from "../Companies/company.model";
import userHasPermissionsSQLModel from "../UserHasPermissions/userHasPermissions.model";

require("dotenv").config();
const {
  roles,
  passwordLessSignup,
  passwordSignUp,
  userRole,
} = require("../../utils/constants");

const userController = {
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
      const users = await userService.getUsers({ id });

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
      const filterObj = {};
      const { user } = req;
      let users = [];
      if (
        req.user[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
        ].indexOf(roles.SuperAdmin) > -1
      ) {
        users = await userService.getUsers(null);
      }
      if (
        req.user[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
        ].indexOf(roles.CustomerAdmin) > -1
      ) {
        filterObj.company_id = user.company_id;
        users = await userService.getUsers(filterObj);
        users = users.filter((m) => m.role !== roles.CustomerAdmin);
      }

      return res.json({ valid: true, data: users });
    } catch (error) {
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
  },
  async getCustomerAdminUsers(req, res) {
    try {
      const { user, query } = req;
      const { filter, page, size } = query;
      const { company_id } = user;
      const usersAndTotalCount = await userService.getUsersAndTotalCount(
        true,
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
      return res.json({ valid: true, data: usersAndTotalCount.users, totalCount: usersAndTotalCount.totalCount });
    } catch (error) {
      errorHandler(error);
      return res
        .status(500)
        .json({ valid: false, data: null, error: error.message });
    }
  },

  // async getCustomerAdminPendingUsers(req, res) {
  //   try {
  //     // const { user } = req;
  //     const { user } = req;
  //     const filterObj = {
  //       company_id: user.company_id,
  //       // role: { [Op.notIn]: [roles.SuperAdmin] },
  //       approved_by_customer_admin: false,
  //     };
  //     const { query } = req;
  //     const { page } = query;
  //     const { size } = query;
  //     let filter = {};
  //     if (query?.filter) {
  //       filter = JSON.parse(query.filter);
  //     }
  //     let sort = "DESC";
  //     let sortColumn = "createdAt";
  //     let role_id = "";
  //     if (filter?.role_id) {
  //       role_id = filter?.role_id;
  //     }
  //     if (filter?.company_id) {
  //       filterObj.company_id = filter?.company_id;
  //     }
  //     if (filter?.sort) {
  //       sort = filter?.sort;
  //       sortColumn = "full_name";
  //     }
  //     if (filter?.status) {
  //       // filterObj.is_active =
  //       if (filter?.status === "active") {
  //         filterObj.is_active = true;
  //       } else {
  //         filterObj.is_active = false;
  //       }
  //       // filter?.filter?.status === "active" ?  true : false
  //     }

  //     if (filter?.search) {
  //       filterObj.full_name = { [Op.like]: `%${filter?.search}%` };
  //     }

  //     // filterObj.approved_by_customer_admin = 0
  //     console.log("filterObj", filter);
  //     // let users;
  //     // if (user.role === roles.CustomerAdmin) {
  //     // eslint-disable-next-line prefer-const
  //     const users = await userService.getUsers(
  //       filterObj,
  //       {
  //         id: user.id,
  //         email: user.email,
  //         ipAddress: req.socket.remoteAddress,
  //         process: "Get company users by admin",
  //         company_id: filter?.company_id
  //       },
  //       sort,
  //       sortColumn,
  //       role_id,
  //       page,
  //       size
  //     );
  //     let roleRequired = false;
  //     let whereRole = {};
  //     if (role_id) {
  //       roleRequired = true;
  //       whereRole = { role_id };
  //     }
  //     const totalCount = await userModel
  //       .findAll({
  //         where: filterObj,
  //         include: [
  //           {
  //             model: companyModel,
  //             attributes: ["company_name", "company_domain"],
  //           },
  //           {
  //             model: userHasPermissionsSQLModel,
  //           },
  //           {
  //             model: userRolesSQLModel,
  //             where: whereRole,
  //             required: roleRequired,
  //             include: [
  //               {
  //                 model: rolesSQLModel,
  //                 include: [
  //                   {
  //                     model: roleHasPermissionsSQLModel,
  //                   },
  //                 ],
  //               },
  //             ],
  //           },
  //         ],
  //       })
  //       .then((resul) => resul.length ?? 0);
  //     return res.json({ valid: true, data: users, totalCount });
  //     // }
  //     // return res.status(400).json({ valid: false, message: "Invalid user" });
  //   } catch (error) {
  //     return res
  //       .status(400)
  //       .json({ valid: false, error: "Something went wrong", stack: error });
  //   }
  // },

  async getCustomerAdminPendingUsers(req, res) {
    try {
      // const { user } = req;
      // const filterObj = {
      //   company_id: user.company_id,
      //   approved_by_customer_admin: false,
      // };
      // const { query } = req;
      // const { page } = query;
      // const { size } = query;
      // let filter = {};
      // if (query?.filter) {
      //   filter = JSON.parse(query.filter);
      // }
      // let sort = "DESC";
      // let sortColumn = "createdAt";
      // let role_id = "";
      // if (filter?.role_id) {
      //   role_id = filter?.role_id;
      // }
      // if (filter?.company_id) {
      //   filterObj.company_id = filter?.company_id;
      // }
      // if (filter?.sort) {
      //   sort = filter?.sort;
      //   sortColumn = "full_name";
      // }
      // if (filter?.status) {
      //   if (filter?.status === "active") {
      //     filterObj.is_active = true;
      //   } else {
      //     filterObj.is_active = false;
      //   }
      // }

      // if (filter?.search) {
      //   filterObj.full_name = { [Op.like]: `%${filter?.search}%` };
      // }

      // const users = await userService.getUsers(
      //   filterObj,
      //   {
      //     id: user.id,
      //     email: user.email,
      //     ipAddress: req.socket.remoteAddress,
      //     process: "Get company users by admin",
      //     company_id: filter?.company_id
      //   },
      //   sort,
      //   sortColumn,
      //   role_id,
      //   page,
      //   size
      // );
      // let roleRequired = false;
      // let whereRole = {};
      // if (role_id) {
      //   roleRequired = true;
      //   whereRole = { role_id };
      // }
      // const totalCount = await userModel
      //   .findAll({
      //     where: filterObj,
      //     include: [
      //       {
      //         model: companyModel,
      //         attributes: ["company_name", "company_domain"],
      //       },
      //       {
      //         model: userHasPermissionsSQLModel,
      //       },
      //       {
      //         model: userRolesSQLModel,
      //         where: whereRole,
      //         required: roleRequired,
      //         include: [
      //           {
      //             model: rolesSQLModel,
      //             include: [
      //               {
      //                 model: roleHasPermissionsSQLModel,
      //               },
      //             ],
      //           },
      //         ],
      //       },
      //     ],
      //   })
      //   .then((resul) => resul.length ?? 0);
      // return res.json({ valid: true, data: users, totalCount });

      const { user, query } = req;
      const { filter, page, size } = query;
      const { company_id } = user;
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
      return res
        .status(400)
        .json({ valid: false, error: "Something went wrong", stack: error });
    }
  },

  async updateUser(req, res) {
    try {
      const userToUpdate = req.body;
      let users = await userService.getUsers({ email: userToUpdate.email });
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
        users = await userService.getUsers({
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

      // if (user.role !== userToUpdate.role) {
      //   const auth0Roles = await auth0Service.getRoles();
      //   const userRoleData = auth0Roles.data.find((m) => m.name === user.role);
      //   const newRole = auth0Roles.data.find(
      //     (m) => m.name === userToUpdate.role
      //   );
      //   await auth0Service.removeUserFromRole(user.auth0_id, [userRoleData.id]);
      //   await auth0Service.setUserRoles(user.auth0_id, [newRole.id]);
      // }

      const response = await userService.updateUser(
        userToUpdate.id,
        userToUpdate,
        {
          id: user.id,
          email: user.email,
          ipAddress: req.socket.remoteAddress,
          process: "update user detail",
        }
      );

      return res.json({ valid: true, message: "User updated successfully" });
    } catch (err) {
      return res
        .status(200)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },
  // Update user only is_status and approved_by_customer_admin
  async updateUserStatus(req, res) {
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
        return res.json({ valid: true, message: "User updated successfully" });
      }
      return res.status(400).json({ valid: false, message: "Invalid user" });
    } catch (err) {
      errorHandler(err);
      return res.status(400).json({
        valid: false,
        error: `${err.response?.data?.message || err.message}`,
      });
    }
  },

  async getUserInfo(req, res, next) {
    try {
      const userData = req.user;
      const { company_id } = userData;
      const user_integration = await getUserIntegrationSupport(company_id);
      let partnerCompany = null;
      if (req?.user?.role === roles.Partner || req?.user?.role === roles.SuperAdmin) {
        partnerCompany = req?.user?.company_id;
      }
      const role_details = await getUserRoleAndPermissions(
        userData,
        partnerCompany,
        req?.user?.role
      );
      if (user_integration) {
        userData.integrations = user_integration;
      }
      const user = JSON.parse(JSON.stringify(userData));
      user.role_details = role_details;
      return res.json(user);
    } catch (err) {
      errorHandler(err);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },

  async addUser(req, res) {
    try {
      const message = "Account created successfully!";
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      // get or save company
      const company_domain = request.email.split("@");
      let user = await findUserByEmail(request.email);
      if (user) {
        return res.json({
          valid: false,
          error: "User with email already exists",
        });
      }
      if (request.phone_number) {
        user = await findUserByPhoneNumber(request.phone_number);
        if (user) {
          return res.json({
            valid: false,
            error: "User with phone number already exists",
          });
        }
      }

      user = {
        email: request.email,
        phone_number: request.phone_number,
        industry_name: request.industry_name,
        approved_by_customer_admin: true,
        is_active: true,
        role: roles.CustomerAuditor,
        phone_verified: true,
        prefer_contact: request.prefer_contact,
        invite_code: v4(),
      };

      let company = await companyService.getCompany(company_domain[1]);

      if (!company) {
        user.role = roles.CustomerAdmin;
        user.approved_by_customer_admin = true;
        user.is_active = true;
        company = await companyService.saveCompany({
          company_name: request.industry_name,
          company_domain: company_domain[1],
        });
      }
      user.company_name = company.company_name;
      user.company_id = company.id;
      const auth0Service = new Auth0ManagementService();

      // save to auth0
      const response = await auth0Service.createUser(user);
      if (
        response.status === HttpStatus.CREATED ||
        response.status === HttpStatus.OK
      ) {
        // save user
        user.auth0_id = response.data.user_id;
        user = await saveUser(user);
        const auth0Roles = await auth0Service.getRoles();
        const editorRole = auth0Roles.data.find((m) => m.name === user.role);

        await auth0Service.setUserRoles(`${user.auth0_id}`, [editorRole.id]);
        user = await saveUser(user);

        const loggedInUser = req.user;
        emailService
          .sendInvite(
            loggedInUser.name,
            user.email,
            user.prefer_contact === "email" ? "Email" : "Phone Number",
            user.invite_code
          )
          .then((resp) => {
            console.log(resp);
          })
          .catch((err) => {
            errorHandler(err);
          });
      }
      return res.json({ valid: true, data: user, message });
    } catch (err) {
      errorHandler(err);
      return res.json({
        valid: false,
        error: `Something went wrong please try again later,${err.message}`,
      });
    }
  },

  async deleteUser(req, res) {
    try {
      // const logInUser = req.user;
      const logInUser = req.user;
      const fyndRole = await getUserRoleType(logInUser.id);
      const { id } = req.params;
      let user = null;
      // if (fyndRole === roles.Partner) {
      //   const userInfo = await userService.getUserByFilter({
      //     id,
      //   });
      //   const checkCompanyWithPartner = await findPartnerCompanyById(
      //     userInfo.company_id,
      //     logInUser
      //   );
      //   // Check if loggedin user company is equals to deleteable user company
      //   const isPartnerCompany = userInfo.company_id === logInUser.company_id;
      //   if (checkCompanyWithPartner || isPartnerCompany) {
      //     user = userInfo;
      //   }
      // } else {
        user = await userService.getUserByFilter({
          id,
          company_id: logInUser.company_id,
        });
      // }

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
  },
  async getTenants(req, res) {
    try {
      const tenants = await userService.getTenants(null);

      return res.json({ valid: true, data: tenants });
    } catch (error) {
      return res.json({ valid: false, error: "Internal server error" });
    }
  },
  async uploadProfileImage(req, res) {
    try {
      const { user } = req;
      if (user) {
        await userService.updateUser(
          user.id,
          {
            profile_image: `${process.env.SERVER_LINK}/uploads/profile_image/${req.file.filename}`,
          },
          {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: "update image",
            company_id: user.company_id
          }
        );
        return res.json({ valid: true, message: "User updated successfully" });
      }
      return res.status(400).json({ valid: false, message: "Invalid user" });
    } catch (error) {
      return res.status(500).json({ valid: false, error: error.message });
    }
  },

  async updateRole(req, res) {
    try {
      const { user } = req;
      const { body } = req;
      const { id } = req.params;
      const users = await userService.getUsers({
        id,
        company_id: user.company_id,
      });
      if (!users || users.length === 0) {
        return res.json({ valid: false, error: "User with id not found" });
      }
      updateUser(
        users?.[0]?.id,
        { role: userRole?.[body.value] },
        {
          id: user.id,
          email: user.email,
          ipAddress: req.socket.remoteAddress,
          process: "update user role",
        }
      );
      return res.json({ valid: true, message: "User updated successfully" });
    } catch (error) {
      return res.status(500).json({ valid: false, error: error.message });
    }
  },

  async updateUserDetails(req, res) {
    try {
      const { body } = req;
      body.type = "company";
      await addRole(body.role, body.role_permissions, body.company_id, body.id, body.type);
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
  },
};

export default userController;
