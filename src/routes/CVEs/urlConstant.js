import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const CVES__URL = {
  getCVESList: {
    URL: "/lists",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getAllCVES: {
    URL: "/all",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getCVEsOverviewDetails: {
    URL: "/overview",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getVendorsList: {
    URL: "/vendors",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getSoftwareCVEs: {
    URL: "/soft/:software_id",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getProductsList: {
    URL: "/products",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
};
export default CVES__URL;
