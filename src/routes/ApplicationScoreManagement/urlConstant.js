import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const APPLICATION_MANAGEMENT__URL = {
    createApplicationScoreWeightage: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "create"
    },
    updateApplicationScoreWeightagePriority: {
        URL: "/weightage/priority",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "edit_priority"
    },
    getApplicationScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "view"
    },
    deleteApplicationScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "delete"
    },
 }
 export default APPLICATION_MANAGEMENT__URL