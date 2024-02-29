import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import invitationController from "../Mysql/Invitations/invitation.controller";
import {
  dashboard,
  getCompanyDetails,
  getCompanyInvitedUsers,
  getCompanyLoginLink,
  getCompanyLogs,
  getCompanyLogStatics,
  getCompanyOverview,
  getCompanyUserLogs,
  getPartnerCompanyCurrentUsers,
  getPartnerCompanyPendingUsers,
  getPartnerCurrentUsers,
  getPartnerInvitedCompanies,
  getPartnerUsersInvited,
  partnerCompanyCancelInvitation,
  partnerDeleteUser,
  partnerUpdateUserDetails,
  partnerUserUpdateStatus,
} from "../Mysql/PartnerCompanies/partnerCompanies.controller";
import { checkUserRole } from "../middlewares/auth.role.partner";
import { roles } from "../utils/constants";
import {
  assertByRisk,
  getAssetByType,
} from "../Mysql/GetAssets/getAssets.controller";
import { checkPermission } from "../middlewares/auth.checkPermission";
import { permissionSlug } from "../Mysql/Permissions/permissionSlugs";
import { assetsOverview } from "../Mysql/Assets/asset.controller";
import { partnerCompanySendInviteApiPayload, partnerCompanyUserSendInviteApiPayload, partnerCompanyUserUpdateApiPayload, partnerCompanyUserUpdateStatusApiPayload, partnerUserSendInviteApiPayload } from "../Mysql/PartnerCompanies/partnerCompanies.dto";
import validateRequestPayload from "../middlewares/validateRequestPayload";

const partnerRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *        type: http
 *        scheme: bearer
 *   schemas:
 *     sendInvite:
 *       type: object
 *       properties:
 *         data:
 *          type: object
 *          description: data object.
 *
 */

// Partner Dashboard
partnerRouter.get(
  "/dashboard",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD, "view"),
  ],
  dashboard
);

// Partner Current Companies List route (not in use as on 10-mar-2023)
// partnerRouter.get(
//   "/company/list",
//   [
//     userAuth, 
//     checkUserRole(roles.Partner),
//   ],
//   getCompaniesList
// );

// Partner Get Invited Companies route
/**
 * @swagger
 * /partner/invited/{company_id}:
 *   get:
 *     summary: Returns list of invited company's users
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/invited/:company_id",
  // [userAuth, checkUserRole(roles.Partner)],
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_INVITED_USERS,"view"),
  ],
  // invitationController.getInvitedUsers
  getCompanyInvitedUsers
);

// Partner Delete Company route (not in use as on 10-mar-2023)
// partnerRouter.post(
//   "/company/delete/:id",
//   [userAuth, checkUserRole(roles.Partner)],
//   deletePartnerCompany
// );

// Partner Company Current users route
/**
 * @swagger
 * /partner/company/current-users/{company_id}:
 *   get:
 *     summary: Returns list of partner company's current users
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/current-users/:company_id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS,"view"),
  ],
  getPartnerCompanyCurrentUsers
);

// User Update Status
/**
 * @swagger
 * /partner/company/user/update-status/{id}:
 *   post:
 *     summary: This API will update the user status
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                is_active:
 *                  type: Object
 *                  example: true
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/user/update-status/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS, "update_status"),
    validateRequestPayload(partnerCompanyUserUpdateStatusApiPayload),
  ],
  // userController.updateUserStatus
  partnerUserUpdateStatus
);

// update user details
/**
 * @swagger
 * /partner/company/user/update:
 *   post:
 *     summary: Update partner company user and return updated partner company user data
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                approved_by_customer_admin:
 *                  type: boolean
 *                  example: true
 *                auth0_id:
 *                  type: string
 *                  example: email|63eb6ce3dce7a1aa1263b61e
 *                company:
 *                  type: object
 *                  example: {company_name: "mailinator.com", company_domain: "mailinator.com"}
 *                company_id:
 *                  type: string
 *                  example: 840b5d60-b9e0-4e97-ba90-e39ce7fafcb9
 *                createdAt:
 *                  type: string
 *                  example: 2023-02-14T11:13:40.000Z
 *                email:
 *                  type: string
 *                  example: ankssaduh@yopmail.com
 *                full_name:
 *                  type: string
 *                  example: ankush
 *                id:
 *                  type: string
 *                  example: 8b8292ce-0752-4e56-8a60-84895ce4fca1
 *                is_active:
 *                  type: boolean
 *                  example: false
 *                last_active:
 *                  type: string
 *                  example: 2023-02-14T11:14:02.000Z
 *                name:
 *                  type: string
 *                  example: ankush1
 *                phone_number:
 *                  type: string
 *                  example: +91
 *                prefer_contact:
 *                  type: string
 *                  example: email
 *                role:
 *                  type: string
 *                  example: mynewrole
 *                updatedAt:
 *                  type: string
 *                  example: 2023-03-09T07:35:50.000Z
 *                role_permissions:
 *                  type: string
 *                  example: []
 *                user_has_permissions:
 *                  type: string
 *                  example: []
 *                user_roles:
 *                  type: string
 *                  example: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/signup'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/user/update",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS, "edit"),
    validateRequestPayload(partnerCompanyUserUpdateApiPayload),
  ],
  // userController.updateUserDetails
  partnerUpdateUserDetails
);

// Partner company delete user route
/**
 * @swagger
 * /partner/company/delete/user/{id}:
 *   delete:
 *     summary: Returns partner company delete user response
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.delete(
  "/company/delete/user/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS, "delete"),
  ],
  partnerDeleteUser
);

// Partner Company Pending users route
/**
 * @swagger
 * /partner/company/pending-users/{company_id}:
 *   get:
 *     summary: Returns list of partner company's pending users
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/pending-users/:company_id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_PENDING_USERS,"view"),
  ],
  // userController.getCustomerAdminPendingUsers
  getPartnerCompanyPendingUsers
);

// Partner Company Details route
/**
 * @swagger
 * /partner/company-details/{company_id}:
 *   get:
 *     summary: Returns Company Details
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company-details/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW, "view"),
  ],
  getCompanyDetails
);

// Invite User Route
/**
 * @swagger
 * /partner/user/send-invite:
 *   post:
 *     summary: Send invitation to partner company
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: Object
 *                  example: { company_id: "840b5d60-b9e0-4e97-ba90-e39ce7fafcb9", invited_from: "partner", invited_to: "partner", inviting_emails: ["xyz@abc.com"], role: "admin", role_permissions: [] }
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/user/send-invite",  
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT,"invite_user"),
    validateRequestPayload(partnerUserSendInviteApiPayload),
  ],
  invitationController.sendInvite
);

// Partner Company Invite Route
/**
 * @swagger
 * /partner/company/send-invite:
 *   post:
 *     summary: Send invitation to company
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: Object
 *                  example: { address: "address", company_name: "company", industry: "SLED", invited_from: "partner", inviting_emails: ["xyz@abc.com"], role: "admin", role_permissions: [] }
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/send-invite",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ONBOARD_CLIENT,"view"),
    validateRequestPayload(partnerCompanySendInviteApiPayload),
  ],
  invitationController.sendInvite
);

// Invite Company User Route
/**
 * @swagger
 * /partner/company/user/send-invite:
 *   post:
 *     summary: Send invitation to company user
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                data:
 *                  type: Object
 *                  example: { address: "address", company_name: "company", industry: "financial", invited_from: "partner", inviting_emails: ["xyz@abc.com"], role: analyst, role_permissions: [] }
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/sendInvite'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/user/send-invite",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT,"invite_user"),
    validateRequestPayload(partnerCompanyUserSendInviteApiPayload),
  ],
  invitationController.sendInvite
);

// Get Company Logs
/**
 * @swagger
 * /partner/company/logs/{company_id}:
 *   get:
 *     summary: Returns list of company event logs
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/logs/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_ACTIVITY_LOG,"view"),
  ],
  getCompanyLogs
);

// Get Company logs statics
/**
 * @swagger
 * /partner/company/logs-statics/{company_id}:
 *   get:
 *     summary: Returns list of company event logs
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/logs-statics/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_ACTIVITY_LOG,"view"),
  ],
  getCompanyLogStatics
);

// Get Company User Logs
/**
 * @swagger
 * /partner/company/{company_id}/user/logs/{user_id}:
 *   post:
 *     summary: Returns list of company user event logs
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: body
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: body
 *         name: filter
 *         required: true
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/:company_id/user/logs/:user_id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS,"view"),
  ],
  getCompanyUserLogs
);

// Get Login Link for the company
/**
 * @swagger
 * /partner/company/login-link/{company_id}:
 *   post:
 *     summary: Returns list of company Login link token
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/login-link/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(
      permissionSlug.PARTNER_DASHBOARD_COMPANY_LOGIN_TO_COMPANY,
      "view"
    ),
  ],
  getCompanyLoginLink
);

// Get Company Overview
/**
 * @swagger
 * /partner/company/overview/{company_id}:
 *   get:
 *     summary: Returns overview of company Login link token
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/overview/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW, "view"),
  ],
  getCompanyOverview
);

// Get Company Asset List
/**
 * @swagger
 * /partner/company/{company_id}/asset-list:
 *   get:
 *     summary: Returns list of company assets
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/company/:id/asset-list",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW, "view"),
  ],
  getAssetByType
);

/**
 * @swagger
 * /partner/company/{company_id}/device/type/{device}:
 *   post:
 *     summary: Returns list of company devices
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: body
 *         name: filter
 *         required: true
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/company/:id/device/type/:device",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW, "view"),
  ],
  assertByRisk
);

/**
 * @swagger
 * /partner/assets/overview:
 *   get:
 *     summary: Get overview detail
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   endpointCount:
 *                     type: number
 *                   peerScore:
 *                     type: string
 *                   unknownAssets:
 *                     type: number
 *                   assetsAtRisk:
 *                     type: number
 *                   avgScore:
 *                     type: number
 *                   companyAvgScore:
 *                     type: number
 *                   totalAssetsCount:
 *                     type: number
 *                   patching:
 *                     type: object
 *                     properties:
 *                         patchingAvailable:
 *                           type: boolean
 *                         updatedAssetsCount:
 *                           type: number
 *                         AssetNeedAttention:
 *                           type: number
 *                         assetswithoutPatch:
 *                           type: number
 *                         totalPatchingAssetsCount:
 *                           type: number
 *                         needingAttention:
 *                           type: number
 *                   endpoint:
 *                     type: object
 *                     properties:
 *                         endpointAvailable:
 *                           type: boolean
 *                         totalDetections:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         totalSuspiciousActivity:
 *                           type: object
 *                           properties:
 *                               count:
 *                                 type: number
 *                               assetsCount:
 *                                 type: number
 *                         restartRequiredAssetsCount:
 *                           type: number
 *                         remediationRequiredAssetsCount:
 *                           type: number
 *                         scanNeededAssetsCount:
 *                           type: number
 *                         endpointIsolatedAssetsCount:
 *                           type: number
 *
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/assets/overview",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW, "view"),
  ],
  assetsOverview
);

// Partner Current users route
/**
 * @swagger
 * /partner/current-users:
 *   get:
 *     summary: Returns list of partner's current users
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/current-users",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_CURRENT_USERS, "view"),
  ],
  getPartnerCurrentUsers
);

// User Update Details
/**
 * @swagger
 * /partner/user/update-status/{id}:
 *   post:
 *     summary: This API will update the user status
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                is_active:
 *                  type: Object
 *                  example: true
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/log'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/user/update-status/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_CURRENT_USERS, "update_status"),
  ],
  // userController.updateUserStatus
  partnerUserUpdateStatus
);

// update user details
/**
 * @swagger
 * /partner/user/update:
 *   post:
 *     summary: Update partner user and return updated partner user data
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                approved_by_customer_admin:
 *                  type: boolean
 *                  example: true
 *                auth0_id:
 *                  type: string
 *                  example: email|63eb6ce3dce7a1aa1263b61e
 *                company:
 *                  type: object
 *                  example: {company_name: "mailinator.com", company_domain: "mailinator.com"}
 *                company_id:
 *                  type: string
 *                  example: 840b5d60-b9e0-4e97-ba90-e39ce7fafcb9
 *                createdAt:
 *                  type: string
 *                  example: 2023-02-14T11:13:40.000Z
 *                email:
 *                  type: string
 *                  example: ankssaduh@yopmail.com
 *                full_name:
 *                  type: string
 *                  example: ankush
 *                id:
 *                  type: string
 *                  example: 8b8292ce-0752-4e56-8a60-84895ce4fca1
 *                is_active:
 *                  type: boolean
 *                  example: false
 *                last_active:
 *                  type: string
 *                  example: 2023-02-14T11:14:02.000Z
 *                name:
 *                  type: string
 *                  example: ankush1
 *                phone_number:
 *                  type: string
 *                  example: +91
 *                prefer_contact:
 *                  type: string
 *                  example: email
 *                role:
 *                  type: string
 *                  example: mynewrole
 *                updatedAt:
 *                  type: string
 *                  example: 2023-03-09T07:35:50.000Z
 *                role_permissions:
 *                  type: string
 *                  example: []
 *                user_has_permissions:
 *                  type: string
 *                  example: []
 *                user_roles:
 *                  type: string
 *                  example: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/signup'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.post(
  "/user/update",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_CURRENT_USERS, "edit"),
  ],
  partnerUpdateUserDetails
);

// Partner delete user route
/**
 * @swagger
 * /partner/delete/user/{id}:
 *   delete:
 *     summary: Returns delete user response
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.delete(
  "/delete/user/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_CURRENT_USERS, "delete"),
  ],
  partnerDeleteUser
);

// Partner Get Invited Companies route
/**
 * @swagger
 * /partner/invite/companies:
 *   get:
 *     summary: Returns list of invited companies
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/invite/companies",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_COMPANY_MANAGEMENT_INVITED_COMPANIES, "view"),
  ],
  getPartnerInvitedCompanies
);

// // Partner Delete Company Invitation route
// /**
//  * @swagger
//  * /partner/cancel-invitation/{id}:
//  *   delete:
//  *     summary: Returns delete company invitation response
//  *     tags: ["Partner"]
//  *     security:
//  *      - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Lo
//  *         content:
//  *           application/json:
//  *             schema:
//  *                 $ref: '#/components/schemas/userList'
//  *       401:
//  *         description: Not authenticated
//  *       default:
//  *          description: Something went wrong
//  */
// partnerRouter.delete(
//   "/cancel-invitation/:id",
//   [
//     userAuth,
//     checkUserRole(roles.Partner),
//     checkPermission(permissionSlug.PARTNER_ADMINISTRATION_COMPANY_MANAGEMENT_INVITED_COMPANIES, "cancel_invite"),
//   ],
//   // invitationController.cancelInvitation
//   partnerCompanyCancelInvitation
// );

// Partner Delete Company Invitation route
/**
 * @swagger
 * /partner/company/cancel-invitation/{id}:
 *   delete:
 *     summary: Returns delete company invitation response
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.delete(
  "/company/cancel-invitation/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_COMPANY_MANAGEMENT_INVITED_COMPANIES, "cancel_invite"),
  ],
  partnerCompanyCancelInvitation
);

// Partner Delete User Invitation route
/**
 * @swagger
 * /partner/user/cancel-invitation/{id}:
 *   delete:
 *     summary: Returns delete user invitation response
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.delete(
  "/user/cancel-invitation/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_INVITED_USERS, "cancel_invite"),
  ],
  partnerCompanyCancelInvitation
);

// Partner Delete Company User Invitation route
/**
 * @swagger
 * /partner/company/user/cancel-invitation/{id}:
 *   delete:
 *     summary: Returns delete company user invitation response
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.delete(
  "/company/user/cancel-invitation/:id",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_INVITED_USERS, "cancel_invite"),
  ],
  partnerCompanyCancelInvitation
);

// Get Partner Users Invited route
/**
 * @swagger
 * /partner/users/invite:
 *   get:
 *     summary: Returns list of partner users invited 
 *     tags: ["Partner"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *            type: integer
 *            example: 1
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Lo
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/userList'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
partnerRouter.get(
  "/users/invite",
  [
    userAuth,
    checkUserRole(roles.Partner),
    checkPermission(permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_INVITED_USERS, "view"),
  ],
  getPartnerUsersInvited
);




export default partnerRouter;
