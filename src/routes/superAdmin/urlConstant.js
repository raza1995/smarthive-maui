import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const SUPER_ADMIN_URL = {
    PARTNER_LIST: {
        URL: "/partner/list",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_CURRENT_PARTNERS,
        ACTION: "view"
    },
    PARTNER_COMPANY_LIST: {
        URL: "/partner/:partner_id/company/list",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_CURRENT_PARTNERS,
        ACTION: "view"
    },
    COMPANY_LIST: {
        URL: "/company/list",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMERS,
        ACTION: "view"
    },
    DASHBOARD: {
        URL: "/dashboard",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMERS,
        ACTION: "view"
    },
    COMPANY_DETAIL: {
        URL: "/company/details/:company_id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_MANAGE_COMPANY,
        ACTION: "view"
    },
    COMPANY_DEVICE_TYPE: {
        URL: "/company/:id/device/type/:device",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_OVERVIEW,
        ACTION: "view"
    },
    COMPANY_OVERVIEW: {
        URL: "/company/overview/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_OVERVIEW,
        ACTION: "view"
    },
    COMPANY_ASSET_LIST: {
        URL: "/company/:id/asset-list",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_OVERVIEW,
        ACTION: "view"
    },
    COMPANY_LOGS: {
        URL: "/company/logs/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_ACTIVITY_LOG,
        ACTION: "view"
    },
    COMPANY_LOG_STATICS: {
        URL: "/company/logs-statics/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_ACTIVITY_LOG,
        ACTION: "view"
    },
    COMPANY_USER_CURRENT_USERS: {
        URL: "/companies/:company_id/user/current-users",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
        ACTION: "view"
    },
    COMPANY_USER_PENDING_USERS: {
        URL: "/companies/:company_id/user/pending-users",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_PENDING_USERS,
        ACTION: "view"
    },
    INVITED_COMPANIES: {
        URL: "/invited/:company_id",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_INVITED_PARTNERS,
        ACTION: "view"
    },
    COMPANY_USER_INVITED_USERS: {
        URL: "/companies/:company_id/user/invited",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_INVITED_USERS,
        ACTION: "view"
    },
    ALL_COMPANY_LOGS: {
        URL: "/all/company/logs",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMERS,
        ACTION: "view"
    }, 
    ALL_COMPANY_LOG_STATS: {
        URL: "/all/company/log-stats",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMERS,
        ACTION: "view"
    }, 
    COMPANY_LOGIN_LINK: {
        URL: "/company/login-link/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_LOGIN_TO_COMPANY,
        ACTION: "view"
    }, 
    PERMISSIONS: {
        URL: "/permissions",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view"
    }, 
    ROLES: {
        URL: "/roles",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view"
    }, 
    USER_SEND_INVITE: {
        URL: "/user/send-invite",
        SLUG: permissionSlug.SUPER_ADMIN_ONBOARD_CLIENT,
        ACTION: "view"
    }, 
    PARTNER_SEND_INVITE: {
        URL: "/partner/send-invite",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_INVITE_PARTNER,
        ACTION: "view"
    }, 
    PARTNER_COMPANY_SEND_INVITE: {
        URL: "/partner/company/send-invite",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_CURRENT_PARTNERS,
        ACTION: "add"
    }, 
    COMPANY_USER_SEND_INVITE: {
        URL: "/company/user/send-invite",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT,
        ACTION: "invite_user"
    }, 
    CANCEL_INVITATION: {
        URL: "/cancel-invitation/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view"
    }, 
    COMPANY_USER_CANCEL_INVITATION: {
        URL: "/company/user/cancel-invitation/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_INVITED_USERS,
        ACTION: "cancel_invite"
    }, 
    PARTNER_CANCEL_INVITATION: {
        URL: "/partner/cancel-invitation/:id",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_INVITED_PARTNERS,
        ACTION: "cancel_invite"
    }, 
    PARTNER_COMPANY_DELETE: {
        URL: "/partner/company/delete/:id",
        SLUG: permissionSlug.SUPER_ADMIN_PARTNERS_CURRENT_PARTNERS,
        ACTION: "delete"
    }, 
    COMPANY_USER_UPDATE_STATUS: {
        URL: "/company/user/update-status/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
        ACTION: "update_status"
    }, 
    COMPANY_USER_UPDATE: {
        URL: "/company/user/update",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
        ACTION: "edit"
    }, 
    COMPANY_USER_DELETE: {
        URL: "/companies/:company_id/user/delete/:id",
        SLUG: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
        ACTION: "delete"
    }, 
    ASSETS_OVERVIEW: {
        URL: "/assets/overview",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view"
    },
}