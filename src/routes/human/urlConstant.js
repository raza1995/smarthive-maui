import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const HUMAN_URL = {
    LIST: {
        URL: "/human/list",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view"
    },
    UPDATE: {
        URL: "/human/update/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "edit"
    },
    DETAIL: {
        URL: "/human/details/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view_detail"
    },
    ASSET_LINKED: {
        URL: "/human/assets_linked/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view_detail"
    },
    ADD_ASSET_LINKED: {
        URL: "/human/add/assets/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "add_asset_linked"
    },
    DELETE_ASSET_LINKED: {
        URL: "/human/remove/assets/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "delete_asset_linked"
    },
    APPLICATION_LINKED: {
        URL: "/human/applications_linked/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view_detail"
    },
    ACTIVITY_LOGS: {
        URL: "/human/activity_logs/:id",
        SLUG: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
        ACTION: "view_detail"
    },
}