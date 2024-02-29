import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

 const ASSET_URL = {
    LIST: {
        URL: "/assets",
        SLUG: permissionSlug.RESILIENCE_BACKUP,
        ACTION: "view"
    },
    ASSETS_OVERVIEW: {
        URL: "/overview",
        SLUG: permissionSlug.RESILIENCE_BACKUP,
        ACTION: "view"
    },
}
export default ASSET_URL