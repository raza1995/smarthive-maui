import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const ASSET_MANAGEMENT__URL = {
    getFilterAssetsList: {
        URL: "/assets",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
        ACTION: "view"
    },
    createAssetsScoreWeightage: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
        ACTION: "create"
    },
    updateAssetsScoreWeightagePriority: {
        URL: "/weightage/priority",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
        ACTION: "edit_priority"
    },
    getAssetsScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
        ACTION: "view"
    },
    deleteAssetsScoreWeightages: {
        URL: "/weightage",
        SLUG: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
        ACTION: "delete"
    },
 }
 export default ASSET_MANAGEMENT__URL