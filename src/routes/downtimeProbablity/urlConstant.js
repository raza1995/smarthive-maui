import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

export const DOWNTIME_PROBABILITY_URL = {
    LIST: {
        URL: "/list",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_DOWNTIME_PROBABILITY,
        ACTION: "view"
    },
    UPDATE: {
        URL: "/edit/:id",
        SLUG: permissionSlug.RISK_VIEW_RISK_COST_DOWNTIME_PROBABILITY,
        ACTION: "edit"
    },
}