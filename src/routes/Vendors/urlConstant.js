import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const VENDORS__URL = {
  getVendorsList: {
    URL: "/lists",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
};
export default VENDORS__URL;
