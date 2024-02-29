import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const APPLICATION_URL = {
    LIST: {
        URL: "/list",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "view"
    },
    UPDATE: {
        URL: "/edit/:id",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "edit"
    },
    CREATE: {
        URL: "/create",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "add"
    },
    DELETE: {
        URL: "/delete/:id",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "delete"
    },
    VIEW: {
        URL: "/view/:id",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "view_detail"
    },
    SHARED_LIST: {
        URL: "/shared/list",
        SLUG: permissionSlug.RISK_VIEW_APPLICATION,
        ACTION: "add"
    },
}