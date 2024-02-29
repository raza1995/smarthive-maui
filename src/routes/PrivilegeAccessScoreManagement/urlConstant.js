import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const PRIVILEGE_ACCESS_MANAGEMENT__URL = {
    createPrivilegeAccessScoreWeightage: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_PRIVILEGE_ACCESS,
        ACTION: "create"
    },
    updatePrivilegeAccessScoreWeightagePriority: {
        URL: "/weightage/priority",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_PRIVILEGE_ACCESS,
        ACTION: "edit_priority"
    },
    getPrivilegeAccessScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_PRIVILEGE_ACCESS,
        ACTION: "view"
    },
    deletePrivilegeAccessScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_PRIVILEGE_ACCESS,
        ACTION: "delete"
    },
 }
 export default PRIVILEGE_ACCESS_MANAGEMENT__URL