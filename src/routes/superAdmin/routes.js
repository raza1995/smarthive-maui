import { Router } from "express";
import { checkPermission } from "../../middlewares/auth.checkPermission";
import { userAuth } from "../../middlewares/auth.middleware";
import { checkUserRole } from "../../middlewares/auth.role.partner";
import { getAllCompanies } from "../../Mysql/Companies/company.controller";
import { companyUserDelete, companyUserUpdateDetails, companyUserUpdateStatus, dashboard, deleteCompany, getAllCompanyLogs, getAllCompanyLogStats, getCompanyDetails, getCompanyInvitedUsers, getCompanyLoginLink, getCompanyLogs, getCompanyLogStatics, getCompanyOverview, getCompanyPendingUsers, getSuperAdminCompanyCurrentUsers } from "../../Mysql/Admin/superAdmin.controller";
import { getAllPartners, getPartnerCompaniesById } from "../../Mysql/PartnerCompanies/partnerCompanies.controller";
import { roles } from "../../utils/constants";
import { SUPER_ADMIN_URL } from "./urlConstant";
import { assertByRisk, getAssetByType } from "../../Mysql/GetAssets/getAssets.controller";
import invitationController from "../../Mysql/Invitations/invitation.controller";
import { permissionList } from "../../Mysql/Permissions/permission.controller";
import { roleList } from "../../Mysql/Roles/roles.controller";
import validateRequestPayload from "../../middlewares/validateRequestPayload";
import { companyUserSendInviteApiPayload, companyUserUpdateApiPayload, companyUserUpdateStatusApiPayload, partnerCompanySendInviteApiPayload, partnerSendInviteApiPayload, userSendInviteApiPayload } from "../../Mysql/Admin/superAdmin.dto";

const adminRouter = Router();

// Admin APIs to fetch Partners 
/**
 * @swagger
 * /admin/partner/list:
 *   get:
 *     summary: Returns list of Partners
 *     tags: ["SuperAdmin"]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *         required: false
 *         schema:
 *            type: object
 *     responses:
 *       200:
 *         description: success response
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
adminRouter.get(
    SUPER_ADMIN_URL.PARTNER_LIST.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_LIST.SLUG, SUPER_ADMIN_URL.PARTNER_LIST.ACTION),
    ],
    getAllPartners
);

// Admin APIs to fetch Companies List 
/**
 * @swagger
 * /admin/company/list:
 *   get:
 *     summary: Returns list of Companies
 *     tags: ["SuperAdmin"]
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
 *         required: false
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_LIST.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_LIST.SLUG, SUPER_ADMIN_URL.COMPANY_LIST.ACTION)
    ],
    getAllCompanies
);


// Admin APIs to fetch Partner Companies List 
/**
 * @swagger
 * /admin/partner/{partner_id}/company/list:
 *   get:
 *     summary: Returns list of Partner Companies
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partner_id
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
 *         required: false
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
adminRouter.get(
    SUPER_ADMIN_URL.PARTNER_COMPANY_LIST.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_COMPANY_LIST.SLUG, SUPER_ADMIN_URL.PARTNER_COMPANY_LIST.ACTION)
    ],
    getPartnerCompaniesById
);


// Admin APIs to fetch Dashboard Content 
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Returns Dashboard Content
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
adminRouter.get(
    SUPER_ADMIN_URL.DASHBOARD.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.DASHBOARD.SLUG, SUPER_ADMIN_URL.DASHBOARD.ACTION)
    ],
    dashboard
);

// Get Company Details
/**
 * @swagger
 * /admin/company/details/{company_id}:
 *   get:
 *     summary: Returns company detail
 *     tags: ["SuperAdmin"]
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
// Company Details route
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_DETAIL.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_DETAIL.SLUG, SUPER_ADMIN_URL.COMPANY_DETAIL.ACTION)
    ],
    getCompanyDetails
)

// Get Company Asset List
/**
 * @swagger
 * /admin/company/{id}/device/type/{device}:
 *   post:
 *     summary: Returns list of devices
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
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
// Company Details route
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_DEVICE_TYPE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_DEVICE_TYPE.SLUG, SUPER_ADMIN_URL.COMPANY_DEVICE_TYPE.ACTION)
    ],
    assertByRisk
)

// Get Company Overview
/**
 * @swagger
 * /admin/company/overview/{company_id}:
 *   get:
 *     summary: Returns overview of company Login link token
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_OVERVIEW.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_OVERVIEW.SLUG, SUPER_ADMIN_URL.COMPANY_OVERVIEW.ACTION)
    ],
    getCompanyOverview
)

// Get Company Asset List
/**
 * @swagger
 * /admin/company/{company_id}/asset-list:
 *   get:
 *     summary: Returns list of company assets
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_ASSET_LIST.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_ASSET_LIST.SLUG, SUPER_ADMIN_URL.COMPANY_ASSET_LIST.ACTION)
    ],
    getAssetByType
)

// Get Company Logs
/**
 * @swagger
 * /admin/company/logs/{company_id}:
 *   post:
 *     summary: Returns list of company event logs
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
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
 *                size:
 *                  type: integer
 *                  example: 10
 *                page:
 *                  type: integer
 *                  example: 1
 *                filter:
 *                  type: string
 *                  example: xyz
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
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_LOGS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_LOGS.SLUG, SUPER_ADMIN_URL.COMPANY_LOGS.ACTION)
    ],
    getCompanyLogs
);

// Get Company logs statics
/**
 * @swagger
 * /admin/company/logs-statics/{company_id}:
 *   get:
 *     summary: Returns list of Company logs statics
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_LOG_STATICS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_LOG_STATICS.SLUG, SUPER_ADMIN_URL.COMPANY_LOG_STATICS.ACTION)
    ],
    getCompanyLogStatics
)

// Get Company users
/**
 * @swagger
 * /admin/companies/{company_id}/user/current-users:
 *   get:
 *     summary: Returns list of Company users
 *     tags: ["SuperAdmin"]
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
 *         required: false
 *         schema:
 *            type: true
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_USER_CURRENT_USERS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_CURRENT_USERS.SLUG, SUPER_ADMIN_URL.COMPANY_USER_CURRENT_USERS.ACTION)
    ],
    getSuperAdminCompanyCurrentUsers
);

// Get Pending Company users
/**
 * @swagger
 * /admin/companies/{company_id}/user/pending-users:
 *   get:
 *     summary: Returns list of Pending Company users
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_USER_PENDING_USERS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_PENDING_USERS.SLUG, SUPER_ADMIN_URL.COMPANY_USER_PENDING_USERS.ACTION)
    ],
    getCompanyPendingUsers
);

// Get Invited Companies 
/**
 * @swagger
 * /admin/invited/{company_id}:
 *   get:
 *     summary: Returns list of Invited Company's users
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.INVITED_COMPANIES.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.INVITED_COMPANIES.SLUG, SUPER_ADMIN_URL.INVITED_COMPANIES.ACTION)
    ],
    getCompanyInvitedUsers
);

// Get Company User Invited Companies 
/**
 * @swagger
 * /admin/companies/{company_id}/user/invited:
 *   get:
 *     summary: Returns list of Company User Invited users
 *     tags: ["SuperAdmin"]
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
adminRouter.get(
    SUPER_ADMIN_URL.COMPANY_USER_INVITED_USERS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_INVITED_USERS.SLUG, SUPER_ADMIN_URL.COMPANY_USER_INVITED_USERS.ACTION)
    ],
    getCompanyInvitedUsers
);

// Get All Company Logs
/**
 * @swagger
 * /admin/all/company/logs:
 *   post:
 *     summary: Returns list of all companies event logs
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *         description: Optional description in *Markdown*
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                size:
 *                  type: integer
 *                  example: 10
 *                page:
 *                  type: integer
 *                  example: 1
 *                filter:
 *                  type: string
 *                  example: xyz
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
adminRouter.post(
    SUPER_ADMIN_URL.ALL_COMPANY_LOGS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.ALL_COMPANY_LOGS.SLUG, SUPER_ADMIN_URL.ALL_COMPANY_LOGS.ACTION)
    ],
    getAllCompanyLogs
);

// Get all company logs stats
adminRouter.get(
    SUPER_ADMIN_URL.ALL_COMPANY_LOG_STATS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.ALL_COMPANY_LOG_STATS.SLUG, SUPER_ADMIN_URL.ALL_COMPANY_LOG_STATS.ACTION)
    ],
    getAllCompanyLogStats
);



// Get Login Link for the company
/**
 * @swagger
 * /admin/company/login-link/{company_id}:
 *   post:
 *     summary: Returns list of company Login link token
 *     tags: ["SuperAdmin"]
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
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_LOGIN_LINK.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_LOGIN_LINK.SLUG, SUPER_ADMIN_URL.COMPANY_LOGIN_LINK.ACTION)
    ],
    getCompanyLoginLink
)

// Get Permissions 
/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: Returns list of Permissions
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
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
adminRouter.get(
    SUPER_ADMIN_URL.PERMISSIONS.URL,
    [userAuth, checkUserRole(roles.SuperAdmin)],
    permissionList
);

// Get Roles 
/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Returns list of Roles
 *     tags: ["SuperAdmin"]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *            type: string
 *       - in: query
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
adminRouter.get(
    SUPER_ADMIN_URL.ROLES.URL,
    [userAuth, checkUserRole(roles.SuperAdmin)],
    roleList
);

// Invite User Route
/**
 * @swagger
 * /admin/user/send-invite:
 *   post:
 *     summary: Send invitation to company
 *     tags: ["SuperAdmin"]
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
adminRouter.post(
    SUPER_ADMIN_URL.USER_SEND_INVITE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.USER_SEND_INVITE.SLUG, SUPER_ADMIN_URL.USER_SEND_INVITE.ACTION),
        validateRequestPayload(userSendInviteApiPayload),
    ],
    invitationController.sendInvite
);

// Invite Company User Route
/**
 * @swagger
 * /admin/company/user/send-invite:
 *   post:
 *     summary: Send invitation to company user
 *     tags: ["SuperAdmin"]
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
 *                  example: { company_id: "1071ce04-a4a1-4b38-a397-df35e26b7892", invited_from: "super_admin", inviting_emails: ["xyz@abc.com"], role: "admin", role_permissions: [] }
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
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_USER_SEND_INVITE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_SEND_INVITE.SLUG, SUPER_ADMIN_URL.COMPANY_USER_SEND_INVITE.ACTION),
        validateRequestPayload(companyUserSendInviteApiPayload),
    ],
    invitationController.sendInvite
);

// Invite User Route
/**
 * @swagger
 * /admin/partner/send-invite:
 *   post:
 *     summary: Send invitation to partner company
 *     tags: ["SuperAdmin"]
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
 *                  example: { company_id:"99999999-9999-9999-9999-999999999999", invited_from: "super_admin", invited_to: "partner", inviting_emails: ["xyz@abc.com"], role: "admin", role_permissions: [] }
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
adminRouter.post(
    SUPER_ADMIN_URL.PARTNER_SEND_INVITE.URL,
    // [userAuth, checkUserRole(roles.SuperAdmin)],
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_SEND_INVITE.SLUG, SUPER_ADMIN_URL.PARTNER_SEND_INVITE.ACTION),
        validateRequestPayload(partnerSendInviteApiPayload),
    ],
    invitationController.sendInvite
);

// Invite User Route
/**
 * @swagger
 * /admin/partner/company/send-invite:
 *   post:
 *     summary: Send invitation to company
 *     tags: ["SuperAdmin"]
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
 *                  example: { address: "address", company_id:"99999999-9999-9999-9999-999999999999", company_name: "company", industry: "SLED", invited_from: "super_admin", invited_to: "company", inviting_emails: ["xyz@abc.com"], role: "compliance", role_permissions: [] }
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
adminRouter.post(
    SUPER_ADMIN_URL.PARTNER_COMPANY_SEND_INVITE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_COMPANY_SEND_INVITE.SLUG, SUPER_ADMIN_URL.PARTNER_COMPANY_SEND_INVITE.ACTION),
        validateRequestPayload(partnerCompanySendInviteApiPayload),
    ],
    invitationController.sendInvite
);

// Not in use
// // Admin Cancel Invitation
// /**
//  * @swagger
//  * /admin/cancel-invitation/{invitation_id}:
//  *   delete:
//  *     summary: This API will delete invitation data
//  *     tags: [SuperAdmin]
//  *     security:
//  *      - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: invitation_id
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Login user information
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               items:
//  *                 $ref: '#/components/schemas/user'
//  *       401:
//  *         description: Not authenticated
//  *       default:
//  *          description: Something went wrong
//  */
// adminRouter.delete(
//     SUPER_ADMIN_URL.CANCEL_INVITATION.URL,
//     [userAuth, checkUserRole(roles.SuperAdmin)],
//     invitationController.cancelInvitation
// )

// Admin Cancel Invitation
/**
 * @swagger
 * /admin/company/user/cancel-invitation/{invitation_id}:
 *   delete:
 *     summary: This API will delete invitation data
 *     tags: [SuperAdmin]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitation_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
adminRouter.delete(
    SUPER_ADMIN_URL.COMPANY_USER_CANCEL_INVITATION.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_CANCEL_INVITATION.SLUG, SUPER_ADMIN_URL.COMPANY_USER_CANCEL_INVITATION.ACTION)
    ],
    invitationController.cancelInvitation
)

// Admin Partner Cancel Invitation
/**
 * @swagger
 * /admin/partner/cancel-invitation/{invitation_id}:
 *   delete:
 *     summary: This API will delete invitation data
 *     tags: [SuperAdmin]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitation_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Login user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/user'
 *       401:
 *         description: Not authenticated
 *       default:
 *          description: Something went wrong
 */
adminRouter.delete(
    SUPER_ADMIN_URL.PARTNER_CANCEL_INVITATION.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_CANCEL_INVITATION.SLUG, SUPER_ADMIN_URL.PARTNER_CANCEL_INVITATION.ACTION)
    ],
    invitationController.cancelInvitation
)

// Admin Delete Company
/**
 * @swagger
 * /admin/partner/company/delete/{company_id}:
 *   delete:
 *     summary: This API will delete the company
 *     tags: ["SuperAdmin"]
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
adminRouter.delete(
    SUPER_ADMIN_URL.PARTNER_COMPANY_DELETE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.PARTNER_COMPANY_DELETE.SLUG, SUPER_ADMIN_URL.PARTNER_COMPANY_DELETE.ACTION)
    ],
    deleteCompany
);

// Update Company User Status
/**
 * @swagger
 * /admin/company/user/update-status/{id}:
 *   post:
 *     summary: This API will update the user status
 *     tags: ["SuperAdmin"]
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
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_USER_UPDATE_STATUS.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_UPDATE_STATUS.SLUG, SUPER_ADMIN_URL.COMPANY_USER_UPDATE_STATUS.ACTION),
        validateRequestPayload(companyUserUpdateStatusApiPayload),
    ],
    companyUserUpdateStatus
);

// update Company User Details
/**
 * @swagger
 * /company/user/update:
 *   post:
 *     summary: Update company user and return updated company user data
 *     tags: ["SuperAdmin"]
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
adminRouter.post(
    SUPER_ADMIN_URL.COMPANY_USER_UPDATE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_UPDATE.SLUG, SUPER_ADMIN_URL.COMPANY_USER_UPDATE.ACTION),
        validateRequestPayload(companyUserUpdateApiPayload),
    ],
    companyUserUpdateDetails
);

// Company user delete route
/**
 * @swagger
 * /admin/companies/{company_id}/user/delete/{id}:
 *   delete:
 *     summary: Returns company user delete response
 *     tags: ["SuperAdmin"]
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
adminRouter.delete(
    SUPER_ADMIN_URL.COMPANY_USER_DELETE.URL,
    [
        userAuth, 
        checkUserRole(roles.SuperAdmin),
        checkPermission(SUPER_ADMIN_URL.COMPANY_USER_DELETE.SLUG, SUPER_ADMIN_URL.COMPANY_USER_DELETE.ACTION)
    ],
    companyUserDelete
);

// Not in use
// /**
//  * @swagger
//  * /admin/assets/overview:
//  *   get:
//  *     summary: Get overview detail
//  *     tags: ["SuperAdmin"]
//  *     security:
//  *      - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: filter
//  *         required: true
//  *         schema:
//  *            type: object
//  *     responses:
//  *       200:
//  *         description: Success response
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                   endpointCount:
//  *                     type: number
//  *                   peerScore:
//  *                     type: string
//  *                   unknownAssets:
//  *                     type: number
//  *                   assetsAtRisk:
//  *                     type: number
//  *                   avgScore:
//  *                     type: number
//  *                   companyAvgScore:
//  *                     type: number
//  *                   totalAssetsCount:
//  *                     type: number
//  *                   patching:
//  *                     type: object
//  *                     properties:
//  *                         patchingAvailable:
//  *                           type: boolean
//  *                         updatedAssetsCount:
//  *                           type: number
//  *                         AssetNeedAttention:
//  *                           type: number
//  *                         assetswithoutPatch:
//  *                           type: number
//  *                         totalPatchingAssetsCount:
//  *                           type: number
//  *                         needingAttention:
//  *                           type: number
//  *                   endpoint:
//  *                     type: object
//  *                     properties:
//  *                         endpointAvailable:
//  *                           type: boolean
//  *                         totalDetections:
//  *                           type: object
//  *                           properties:
//  *                               count:
//  *                                 type: number
//  *                               assetsCount:
//  *                                 type: number
//  *                         totalSuspiciousActivity:
//  *                           type: object
//  *                           properties:
//  *                               count:
//  *                                 type: number
//  *                               assetsCount:
//  *                                 type: number
//  *                         restartRequiredAssetsCount:
//  *                           type: number
//  *                         remediationRequiredAssetsCount:
//  *                           type: number
//  *                         scanNeededAssetsCount:
//  *                           type: number
//  *                         endpointIsolatedAssetsCount:
//  *                           type: number
//  *
//  *       401:
//  *         description: Not authenticated
//  *       default:
//  *          description: Something went wrong
//  */

// adminRouter.get(
//     SUPER_ADMIN_URL.ASSETS_OVERVIEW.URL,
//     [userAuth, checkUserRole(roles.SuperAdmin)],
//     assetsOverview
// );



export default adminRouter;