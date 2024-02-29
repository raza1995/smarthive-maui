import axios from "axios";
import HttpStatus, { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { Auth0ManagementService } from "../../mongo/services/auth0ManagementService";
// import userModel from '../../models/inventory/users';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhoneNumber,
  findUserOAuthId,
  updateUser,
} from "../Users/users.service";
import companyService, {
  getCompany,
  getCompanyByFilter,
  updateOrCreateCompany,
} from "../Companies/company.service";
import userModel from "../Users/users.model";
import invitationService from "../Invitations/invitations.service";
import notificationsService from "../Notification/notification.service";
import { createUserOnAuth0, sendMagicLink, webAuth } from "../../utils/auth0";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { addRole } from "../Roles/roles.controller";
import userRolesSQLModel from "../UserRoles/userRoles.model";
import rolesSQLModel from "../Roles/roles.model";
import { getUserRoleAndPermissions } from "./auth.service";
import { createUserHumanRelation } from "../Human/human.service";
import { errorHandler } from "../../utils/errorHandler";
import {
  AuthenticationActivity,
  sendMagicLinkActivity,
  sendOTPonMobileActivity,
} from "../Logs/ActivitiesType/authActivities";
import { createPartnerCompanyRelation } from "../PartnerCompanies/partnerCompanies.service";
import { globalRolesSeed } from "../Roles/globalRole.seed";
import companyDetailsService from "../CompanyDetails/companyDetails.service";
import { RiskCostFactorAttributesSeed } from "../RiskCostFactorAttributes/RiskCostFactorAttributesSeed";
import { DowntimeProbabilitySeed } from "../DowntimeProbability/DowntimeProbabilitySeed";

const {
  passwordLessSignup,
  getTokenWithOTP,
  generateManagementToken,
  roles,
  NotificationType,
} = require("../../utils/constants");
// ./controllers/auth

const authController = {
  // async login(req, res) {
  //   //request = JSON.parse(req)
  //   delete axios.defaults.headers.common["authorization"];
  //   const request = req.body;
  //   let user = await userService.findUserByEmail(request.username);
  //   if (!user || !user.is_active) {
  //     return res.status(500).json({
  //       valid: false,
  //       error: "Your account does not exist.",
  //       // error: 'User not found or user not active'
  //     });
  //   }

  //   axios
  //     .request(authOptions(req.body.username, req.body.password))
  //     .then((response) => {})
  //     .catch((err) => {
  //       return res.json({
  //         valid: false,
  //         error: "Something went wrong, Please try again.",
  //       });
  //     });
  // },

  async loginEmailOTP(req, res) {
    try {
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const user = await findUserByEmail(request.email);
      
      if (user) {
        const fyndUserRole = await userRolesSQLModel.findOne({
          where: {
            user_id: user.id,
          },
          include: [
            {
              model: rolesSQLModel,
              where: {
                type: user?.company?.type
              }
            },
          ],
          attributes: [],
        });
        if (request?.user_role) {
          if (
            request?.user_role === roles.Partner &&
            fyndUserRole?.role?.type !== roles.Partner
          ) {
            return res.status(400).json({
              valid: false,
              error:
                "You cannot login with given details. Please contact support.",
            });
          }
          if (
            request?.user_role === roles.SuperAdmin &&
            fyndUserRole?.role?.type !== roles.SuperAdmin
          ) {
            return res.status(400).json({
              valid: false,
              error:
                "You cannot login with given details. Please contact support.",
            });
          }
        } else if (fyndUserRole?.role?.type === roles.Partner) {
          return res.status(400).json({
            valid: false,
            error:
              "You cannot login with given details. Please contact support.",
          });
        }

        if (!user) {
          const company_domain = request.email.split("@");
          const company = await companyService.getCompany(company_domain[1]);
          await addEventLog(
            {
              id: null,
              email: request.email,
              ipAddress: req.socket.remoteAddress,
              company_id: company?.id,
              process: `Authorized user ${request.email}`,
              user_id: null,
            },
            AuthenticationActivity.status.authenticationFailed.code,
            null,
            "account does not exist."
          );
          return res.status(400).json({
            valid: false,
            error:
              "Email has been sent at your email address. Please check your email for further steps.",
          });
        }
        if (!request.forSignup && !user.is_active) {
          await addEventLog(
            {
              id: null,
              email: request.email,
              ipAddress: req.socket.remoteAddress,
              company_id: user?.company_id,
              process: `Authorized user ${request.email}`,
              user_id: user.id,
            },
            AuthenticationActivity.status.authenticationFailed.code,
            null,
            "account not verified."
          );
          return res.status(400).json({
            valid: false,
            error: "Your account is not verified yet.",
          });
        }
        if (user.prefer_contact === "phone_number") {
          const options = passwordLessSignup(user);
          // delete options.data.email;
          options.data.phone_number = user.phone_number;
          options.data.connection = "sms";
          options.data.send = "code";

          try {
            await axios.request(options);
            await addEventLog(
              {
                id: user?.id,
                email: request.email,
                ipAddress: req.socket.remoteAddress,
                company_id: user?.company_id,
                process: `OTP sent on ${user.phone_number}`,
                user_id: user.id,
              },
              sendOTPonMobileActivity.status.OtpSentSuccessfully.code,
              null
            );
            return res.status(200).json({
              isOtpVerified: false,
              valid: true,
              authType: "phone_number",
              phone_number: options.data.phone_number,
              message: "OTP sent on your phone number.",
              email: options.data.email,
            });
          } catch (error) {
            errorHandler(error);
            await addEventLog(
              {
                id: user?.id,
                email: request.email,
                ipAddress: req.socket.remoteAddress,
                company_id: user?.company_id,
                process: `OTP sent on ${user.phone_number}`,
                user_id: user.id,
              },
              sendOTPonMobileActivity.status.otpSendingFailed.code,
              null,
              error.message
            );
            return res.status(400).json({ valid: false, error: error.message });
          }
        }

        let redirectUri = process.env.APP_URL;
        if (request?.user_role === roles.Partner) {
          redirectUri = process.env.PARTNER_APP_URL;
        } else if (request?.user_role === roles.SuperAdmin) {
          redirectUri = process.env.SUPER_ADMIN_APP_URL;
        }

        await sendMagicLink(request.email, redirectUri, {
          id: user?.id,
          email: request.email,
          ipAddress: req.socket.remoteAddress,
          company_id: user?.company_id,
          process: `Magic link sent to ${request.email}`,
          user_id: user.id,
        }).then(async (response) =>
          res.json({
            valid: true,
            message:
              "Email has been sent at your email address. Please check your email for further steps.",
          })
        );
      } else {
        const company_domain = request.email.split("@");
        const company = await getCompany(company_domain[1]);
        addEventLog(
          {
            id: null,
            email: request.email,
            ipAddress: req.socket.remoteAddress,
            company_id: company?.id,
            process: `Magic link sent to ${request.email}`,
            user_id: null,
          },
          sendMagicLinkActivity.status.MagicLinkSendingFailed.code,
          null,
          "user is not found"
        );
        res.json({
          valid: true,
          message:
            "Email has been sent at your email address. Please check your email for further steps.",
        });
      }
    } catch (error) {
      errorHandler(error);
      return res.json({ valid: false, message: error });
    }
  },

  async loginPhoneOTP(req, res) {
    try {
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const user = await findUserByPhoneNumber(request.phoneNumber);

      if (!user) {
        return res.status(200).json({
          valid: false,
          error: "Your account does not exist.",
        });
      }
      const fyndUserRole = await userRolesSQLModel.findOne({
        where: {
          user_id: user.id,
        },
        include: [
          {
            model: rolesSQLModel,
          },
        ],
        attributes: [],
      });

      if (
        request?.user_role !== roles.Partner &&
        fyndUserRole?.role?.slug === roles.Partner
      ) {
        return res.status(400).json({
          valid: false,
          error: "Your account does not exist.",
        });
      }

      if (!user.is_active) {
        return res.status(200).json({
          valid: false,
          error: "Your account is not verified yet.",
        });
      }

      if (user.prefer_contact === "email") {
        return res.status(200).json({
          valid: false,
          error: "You have registered as email authentication",
        });
      }

      const options = passwordLessSignup(request);
      delete options.data.email;
      options.data.phone_number = request.phoneNumber;
      options.data.connection = "phone_number";
      await axios.request(options);

      return res.json({
        valid: true,
        message: "OTP sent on your phone number.",
      });
    } catch (err) {
      return res.json({
        valid: false,
        error: "Something went wrong, please try again later",
        stack: err,
      });
    }
  },

  async verifyOTP(req, res) {
    try {
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const options = getTokenWithOTP(request);
      if (request.phoneNumber) {
        options.data.realm = "sms";
        options.data.username = request.phoneNumber;
      }
      const response = await axios.request(options);
      if (response.data) {
        const userDetails = await findUserByPhoneNumber(request.phoneNumber);
        if (!userDetails.is_active) {
          return res.status(400).json({
            valid: false,
            resetForm: true,
            error:
              "Your Account is created successfully. Please wait for admin approval to login",
          });
        }
        const responseData = {
          isOtpVerified: true,

          user: userDetails,
        };
        await webAuth.users
          .getInfo(response.data.access_token)
          .then((userInfo) => {
            const expiresIn =
              parseInt(response?.data?.expires_in, 10) || 120 * 60;

            const token = jwt.sign(
              userInfo,
              process.env.AUTH0_CLIENT_SECRET,
              { expiresIn },
              { algorithm: "RS256" }
            );

            userDetails.expiresIn = expiresIn;
            responseData.token = token;
          });
        let partnerCompany = null;
        if (userDetails.role === roles.Partner) {
          partnerCompany = userDetails.company_id;
        }

        // find role and permission;
        responseData.role_details = await getUserRoleAndPermissions(
          userDetails,
          partnerCompany
        );
        return res.status(StatusCodes.OK).json({ ...responseData });
      }
    } catch (err) {
      errorHandler(err);
      return res.status(400).json({
        resetForm: false,
        isOtpVerified: false,
        valid: false,
        error: err.response?.data?.error_description || `OTP does not match`,
      });
    }
  },

  async verifyPhoneOTP(req, res) {
    try {
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const options = getTokenWithOTP(request);
      options.data.realm = "phone_number";
      options.data.username = request.phoneNumber;
      options.data.code = request.code;
      const response = await axios.request(options);
      return res.json({ valid: true, data: response.data });
    } catch (err) {
      return res.json({
        valid: false,
        error: `Something went wrong, please try again later,${err.message}`,
        data: err,
      });
    }
  },

  async signup(req, res) {
    // signup will be implemented heregit remote
    let message =
      "Your account is created successfully, Check your email for login process.";
    delete axios.defaults.headers.common.authorization;
    const request = req.body;
    const roleConfig = { role: "", role_permissions: [] };
    try {
      let user = await findUserByEmail(request.email);

      if (user) {
        return res.status(400).json({
          valid: false,
          error: "Email address is already exist.",
          resetForm: false,
        });
      }
      if (request.phoneNumber) {
        user = await findUserByPhoneNumber(request.phoneNumber);
        if (user) {
          return res.status(400).json({
            valid: false,
            error: "Phone number is already exist.",
            resetForm: false,
          });
        }
      }

      // get or save company
      const company_domain = request.email.split("@");
      let company = await getCompany(company_domain[1]);
      if (company) {
        const fyndPartnerRole = await userRolesSQLModel.count({
          where: { company_id: company.id },
          include: [
            {
              model: rolesSQLModel,
              where: { slug: roles.Partner },
              required: true,
            },
          ],
        });
        if (fyndPartnerRole > 0) {
          return res.status(400).json({
            valid: false,
            error:
              "You cannot register with this email address. Please contact support.",
            resetForm: false,
          });
        }
      }

      // Check if user was invited
      const filterObj = {
        email: request.email,
      };
      const existingInvite = await invitationService.findInviteByEmail(
        // request.email
        filterObj
      );

      if (!existingInvite && company) {
        return res.status(400).json({
          valid: false,
          error:
            "You cannot register with given details. Please contact support.",
          resetForm: false,
        });
      }

      user = {
        email: request.email,
        phone_number: request.phoneNumber || null,
        approved_by_customer_admin: request.is_approved ?? false,
        full_name: request.fullName,
        is_active: true,
        role: roles.CustomerAnalyst,
        phone_verified: false,
        prefer_contact: request.authType,
        profile_image: request.profileImage || null,
      };
      
      if (existingInvite) {
        const invitedBy = await findUserById(existingInvite?.invited_by);
        let companyDomain = invitedBy.email.split("@");
        // let companyInfo = await getCompanyByFilter({ id: invitedBy.company_id })
        let companyInfo = await getCompanyByFilter({
          id: existingInvite.company_id,
        });
        // Code for partner invited companies starts
        if (
          existingInvite?.invited_from === "partner" ||
          existingInvite?.invited_from === roles.SuperAdmin
        ) {
          companyDomain = existingInvite.email.split("@");
          if (existingInvite.company_id && !existingInvite.company_name) {
            companyInfo = await getCompanyByFilter({
              id: existingInvite.company_id,
            });
          } else {
            companyInfo = await getCompany(companyDomain[1]);
          }
          if (!companyInfo) {
            companyInfo = await updateOrCreateCompany({
              company_name: existingInvite.company_name,
              company_domain: company_domain[1],
              industry_type: existingInvite.industry,
              address: existingInvite.address,
            });
            // Create default entries in Risk cost factor tables
            await RiskCostFactorAttributesSeed(companyInfo.id);
            await DowntimeProbabilitySeed(companyInfo.id);
          }
        }
        // Code for partner invited companies ends
        roleConfig.role = existingInvite.role || "";
        roleConfig.role_permissions = existingInvite.role_permissions || [];
        invitationService.deleteInvitation(existingInvite.id);
        user.is_active = true;
        user.approved_by_customer_admin = true;
        user.company_name = companyInfo.company_name;
        user.company_id = `${companyInfo.id}`;
        message =
          "Your account is created successfully. Please check your email for further steps.";
      } else {
        roleConfig.role = "analyst";
        roleConfig.role_permissions = [];
        user.is_active = false;
        if (!company) {
          roleConfig.role = "admin";
          user.role = roles.CustomerAdmin;
          user.approved_by_customer_admin = true;
          user.is_active = true;
          message =
            "Your account is created successfully. Please check your email for further steps.";
          company = await updateOrCreateCompany({
            company_name: request.industry,
            company_domain: company_domain[1],
            industry_type: request.industryType,
          });
          if (company === null) throw new Error("company could not be created");
          // Create default entries in Risk cost factor tables
          await RiskCostFactorAttributesSeed(company.id);
          await DowntimeProbabilitySeed(company.id);
        }
        user.company_name = company.company_name;
        user.company_id = `${company.id}`;
      }
      // save to auth0
      const response = await createUserOnAuth0(user);
      const fyndAdminRole = await rolesSQLModel.findOne({
        where: { company_id: user.company_id, slug: roles.Admin },
        raw: true,
        nest: true,
      });
      if (fyndAdminRole) {
        const customerAdmin = await userModel.findOne({
          where: {
            company_id: user.company_id,
            // role: roles.CustomerAdmin,
          },
          include: [
            {
              model: userRolesSQLModel,
              where: {
                role_id: fyndAdminRole?.id,
              },
              // attributes:["id","role_id"],
              required: true,
            },
          ],
        });
        if (customerAdmin) {
          notificationsService.addNotification(
            customerAdmin.id,
            user,
            NotificationType.acceptUser
          );
        }
      }

      // const response = await createUserOnAuth0(user)

      if (response) {
        // save user
        user.auth0_id = response.user_id;
        // const auth0Roles = await auth0Service.getRoles();
        // const editorRole = auth0Roles.data.find((m) => m.name === user.role);

        // await auth0Service.setUserRoles(`${user.auth0_id}`, [editorRole.id]);
        // user = await userService.saveUser(user);
        user = await createUser(
          user,
          {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: "signUp",
            company_id: user.company_id,
          },
          user?.role
        );
      }

      if (user?.prefer_contact === "phone_number") {
        message = null;
      }

      if (
        existingInvite?.invited_from === "partner" ||
        existingInvite?.invited_from === roles.SuperAdmin
      ) {
        await createPartnerCompanyRelation(
          user.company_id,
          existingInvite.invited_by,
          existingInvite.company_id
        );
      }
      // RoleFunction
      await addRole(
        roleConfig.role,
        roleConfig.role_permissions,
        user.company_id,
        user.id,
        "company"
      );
      return res
        .status(StatusCodes.OK)
        .json({ valid: true, data: user, message, resetForm: true });
    } catch (err) {
      errorHandler(err);
      return res
        .status(400)
        .json({ valid: false, error: `${err.message}`, resetForm: false });
    }
  },

  async updateUserAtRegistration(req, res) {
    const request = req.body;
    const isUserExist = await findUserById(request.userId);

    if (!isUserExist) {
      return res.status(400).json({
        error: "Your account does not exist. Please create your account again.",
      });
    }

    delete axios.defaults.headers.common.authorization;
    try {
      let user = {
        phone_number: request.phoneNumber,
        id: request.userId,
      };
      const auth0Service = new Auth0ManagementService();

      // save to auth0
      const response = await auth0Service.updateUserAtRegistration(
        request.auth0Id,
        user
      );

      if (
        response.status === HttpStatus.CREATED ||
        response.status === HttpStatus.OK
      ) {
        // save user
        user.auth0_id = response.data.user_id;
        user = await updateUser(user.id, { phone_number: user.phone_number });

        // update the phone number from request, as the response phn no is still old no.
        user = { ...user, phone_number: request.phoneNumber };

        // send OTP
        const options = passwordLessSignup(user);
        // delete options.data.email;
        options.data.phone_number = user.phone_number;
        options.data.connection = "sms";
        options.data.send = "code";

        axios.request(options);
      }

      user = { ...user, phone_number: request.phoneNumber };

      return res.json({
        valid: true,
        data: user,
        message: "Check the otp on the phone number",
      });
    } catch (err) {
      return res.status(400).json({
        valid: false,
        error: `${err.response?.data?.message || err.message}`,
      });
    }
  },

  async loginUserByLink(req, res) {
    try {
      let email = null;
      let user = null;
      if (req.user.sub) {
        const emailIndex = req.user.sub.split(",");
        [email] = emailIndex;
        user = await findUserOAuthId(req.user.sub, {
          id: null,
          email: req.user.email,
          ipAddress: req.socket.remoteAddress,
          process: "Login by link",
        });
      } else if (req.user.email) {
        email = req.user.email;
        user = await findUserByEmail(email, {
          id: null,
          email: req.user.email,
          ipAddress: req.socket.remoteAddress,
          process: "Login by link",
        });
      } else
        return res.status(400).json({
          valid: false,
          error: "Something went wrong. please try again",
        });
      if (!user) {
        return res
          .status(400)
          .json({ valid: false, error: "Invalid token, please try to login." });
      }
      // else if()
      // let email = req.user.email;

      if (!user.is_active) {
        return res
          .status(400)
          .json({ valid: false, error: "Account is not verified yet" });
      }

      // Update User Last Active Date
      await updateUser(
        user.id,
        {
          last_active: new Date(),
        },
        null
      );
      // Add user Human Relation
      await createUserHumanRelation(user);

      let partnerCompany = null;
      if (
        req?.user?.role === roles.Partner ||
        req?.user?.role === roles.SuperAdmin
      ) {
        partnerCompany = req?.user?.company_id;
      }

      // find role and permission;
      const role_details = await getUserRoleAndPermissions(
        user,
        partnerCompany,
        req?.user?.role
      );
      return res.json({
        valid: true,
        data: user,
        token: req.token,
        role_details,
      });
    } catch (err) {
      errorHandler(err);
      return res.status(400).json({ valid: false, error: `${err.message}` });
    }
  },

  async clientCredentials(req, res) {
    // request = JSON.parse(req)
    delete axios.defaults.headers.common.authorization;
    axios
      .request(generateManagementToken())
      .then((response) => res.json(response.data))
      .catch((err) => res.status(500).json(err));
  },

  async getManagementRoles(req, res) {
    try {
      const service = new Auth0ManagementService();
      const authResponse = await service.authorize();
      const rolesResponse = await service.getRoles();
      return res.json(rolesResponse.data);
    } catch (err) {
      return res.json(err);
    }
  },

  async processInvite(req, res) {
    try {
      const { body } = req;
      const invite = await invitationService.findInvite(body.code, false);
      if (invite) {
        const invitedBy = await findUserById(invite?.invited_by);
        const company = await getCompanyByFilter({ id: invitedBy.company_id });
        invite.is_expired = true;
        await invitationService.updateInvite(invite);
        return res.json({
          valid: true,
          data: {
            ...invite,
            company: {
              company_name: company.company_name,
              industry_type: company.industry_type,
            },
          },
        });
      }
      return res.json({ valid: false, error: "Invitation code is not valid." });
    } catch (err) {
      errorHandler(err);
      res.json({
        valid: false,
        error: "Error while processing code",
        stack: err,
      });
    }
  },

  async partnerSignup(req, res) {
    try {
      // signup will be implemented heregit remote
      let message =
        "You cannot register with given details. Please contact support.";
      delete axios.defaults.headers.common.authorization;
      const request = req.body;
      const roleConfig = { role: "", role_permissions: [] };
      try {
        let user = await findUserByEmail(request.email);
        // Check if user was invited
        const filterObj = {
          email: request.email,
        };
        const existingInvite = await invitationService.findInviteByEmail(
          // request.email
          filterObj
        );
        const company_domain = request.email.split("@");
        let company = await getCompany(company_domain[1]);
        if (!existingInvite && company) {
          return res.status(400).json({
            valid: false,
            error:
              "You cannot register with given details. Please contact support.",
            resetForm: false,
          });
        }

        if (user) {
          return res.status(400).json({
            valid: false,
            error:
              "You cannot register with given details. Please contact support.",
            resetForm: false,
          });
        }
        if (request.phone_number) {
          user = await findUserByPhoneNumber(request.phone_number);
          if (user) {
            return res.status(400).json({
              valid: false,
              error:
                "You cannot register with given details. Please contact support.",
              resetForm: false,
            });
          }
        }

        user = {
          email: request.email,
          phone_number: request.phone_number || null,
          approved_by_customer_admin: request.is_approved ?? false,
          full_name: request.full_name,
          is_active: true,
          role: roles.CustomerAnalyst,
          phone_verified: false,
          prefer_contact: request.auth_type,
          profile_image: request.profile_image || null,
        };

        if (existingInvite) {
          const invitedBy = await findUserById(existingInvite?.invited_by);
          let companyDomain = invitedBy.email.split("@");
          let companyInfo = await getCompany(companyDomain[1]);
          // Code for partner invited companies starts
          if (
            existingInvite?.invited_from === "partner" ||
            existingInvite?.invited_from === roles.SuperAdmin
          ) {
            // check if user is inviter to partner
            if (existingInvite?.invited_from === existingInvite?.invited_to) {
              companyInfo = await getCompanyByFilter({
                id: existingInvite.company_id,
              });
            } else {
              companyDomain = existingInvite.email.split("@");
              companyInfo = await getCompany(companyDomain[1]);
              if (!companyInfo) {
                companyInfo = await updateOrCreateCompany({
                  company_name: request?.company_name,
                  company_domain: company_domain[1],
                  industry_type: existingInvite.industry || "Financial",
                  address: request?.address,
                  type: roles.Partner,
                });
              }
              await globalRolesSeed(companyInfo.id);
              // Create default entries in Risk cost factor tables
              await RiskCostFactorAttributesSeed(companyInfo.id);
              await DowntimeProbabilitySeed(companyInfo.id);
            }
          }
          // Code for partner invited companies ends
          roleConfig.role = existingInvite.role || "";
          roleConfig.role_permissions = existingInvite.role_permissions || [];
          invitationService.deleteInvitation(existingInvite.id);
          user.is_active = true;
          user.role = roleConfig.role;
          user.approved_by_customer_admin = true;
          user.company_name = companyInfo.company_name;
          user.company_id = `${companyInfo.id}`;
          message =
            "Your account is created successfully. Please check your email for further steps.";
        } else {
          // get or save company
          // const company_domain = request.email.split("@");
          // let company = await getCompany(company_domain[1]);
          if (company) {
            return res.status(400).json({
              valid: false,
              error:
                "You cannot register with this email address. Please contact support.",
              resetForm: false,
            });
          }

          company = await updateOrCreateCompany({
            company_name: request?.company_name || company_domain[1],
            company_domain: company_domain[1],
            industry_type: request?.industry_type,
            type: roles.Partner,
          });
          await globalRolesSeed(company.id);
          // Create default entries in Risk cost factor tables
          await RiskCostFactorAttributesSeed(company.id);
          await DowntimeProbabilitySeed(company.id);

          roleConfig.role = "admin";
          user.role = "admin";
          user.approved_by_customer_admin = true;
          user.is_active = true;
          message =
            "Your account is created successfully. Please check your email for further steps.";
          user.company_name = company.company_name;
          user.company_id = `${company.id}`;
        }

        const auth0Service = new Auth0ManagementService();
        // save to auth0
        const response = await createUserOnAuth0(user, true);
        user.company_address_one = request?.company_address_one;
        user.company_address_two = request?.company_address_two;
        user.clients_count = request?.clients_count;
        user.is_active = true;
        let userData = null;
        if (response) {
          // save user
          user.auth0_id = response.user_id;
          userData = await createUser(
            user,
            {
              id: user.id,
              email: user.email,
              ipAddress: req.socket.remoteAddress,
              process: "signUp",
              company_id: user.company_id,
            },
            "partner"
          );

          // creating record in company_details table
          await companyDetailsService.createCompanyDetail({
            ...user,
          });
          // if(roleConfig?.role !== roles.Admin) {
          await addRole(
            roleConfig.role,
            roleConfig.role_permissions,
            userData.company_id,
            userData.id,
            "partner"
          );
          // }

          await createPartnerCompanyRelation(
            userData.company_id,
            userData.id,
            userData.company_id
          );

          // RoleFunction
          await addRole(
            roleConfig.role,
            roleConfig.role_permissions,
            userData.company_id,
            userData.id,
            "company",
            true
          );
        }

        if (userData?.prefer_contact === "phone_number") {
          message = null;
        }
        return res
          .status(StatusCodes.OK)
          .json({ valid: true, data: userData, message, resetForm: true });
      } catch (err) {
        errorHandler(err);
        return res
          .status(400)
          .json({ valid: false, error: `${err.message}`, resetForm: false });
      }
    } catch (err) {
      res.json({
        valid: false,
        error: "Error while signup process",
        stack: err,
      });
    }
  },
};
export default authController;
