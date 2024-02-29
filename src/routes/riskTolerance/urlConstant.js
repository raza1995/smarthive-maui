import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const RISK_TOLERANCE_URL = {
    ASSET_TYPES: {
        URL: "/asset-types",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "create"
    },
    ASSET_SUB_TYPES: {
        URL: "/asset-sub-types/:asset_type",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "create"
    },
    ASSET_TAGS: {
        URL: "/asset-tags/:asset_type",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "create"
    },
    COMPARED_TAG_ASSETS: {
        URL: "/compared-tag-assets",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "create"
    },
    CREATE: {
        URL: "/create",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "create"
    },
    LIST: {
        URL: "/list",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "view"
    },
    DELETE: {
        URL: "/delete/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "delete"
    },
    UPDATE: {
        URL: "/edit/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
        ACTION: "edit"
    },
    PRIORITY_UPDATE: {
        URL: "/priority/update",
        SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE_PRIORITY,
        ACTION: "edit"
    },
    // VIEW: {
    //     URL: "/view/:id",
    //     SLUG: permissionSlug.RISK_VIEW_RISK_TOLERANCE,
    //     ACTION: "view"
    // },
}