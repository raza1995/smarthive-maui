import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const RISK_COST_FACTOR_URL = {
    COMPARED_TAG_ASSETS: {
        URL: "/compared-tag-assets",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "create"
    },
    CREATE: {
        URL: "/create",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "create"
    },
    LIST: {
        URL: "/list",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "view"
    },
    VIEW: {
        URL: "/view/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "view"
    },
    DELETE: {
        URL: "/delete/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "delete"
    },
    UPDATE: {
        URL: "/edit/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "edit"
    },
    ATTRIBUTES: {
        URL: "/attributes",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "create"
    },
    ATTRIBUTE_CREATE: {
        URL: "/attribute-create",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTOR_ATTRIBUTES,
        ACTION: "create"
    },
    ASSET_LIST: {
        URL: "/:risk_cost_factor_id/selected-assets/list",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
        ACTION: "view"
    },
    DOWNTIME_PROBABILITY_LIST: {
        URL: "/downtime-probability/list",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_DOWNTIME_PROBABILITY,
        ACTION: "view"
    },
    DOWNTIME_PROBABILITY_UPDATE: {
        URL: "/downtime-probability/edit/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_DOWNTIME_PROBABILITY,
        ACTION: "edit"
    },
    PRIORITY_UPDATE: {
        URL: "/priority/update",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_PRIORITY,
        ACTION: "edit"
    },
}