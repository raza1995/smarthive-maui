import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const HUMAN_MANAGEMENT__URL = {
    createHumanScoreWeightage: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "create"
    },
    updateHumanScoreWeightagePriority: {
        URL: "/weightage/priority",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "edit_priority"
    },
    getHumanScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "view"
    },
    deleteHumanScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
        ACTION: "delete"
    },
 }
 export default HUMAN_MANAGEMENT__URL