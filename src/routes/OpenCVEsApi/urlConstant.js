import { permissionSlug } from "../../Mysql/Permissions/permissionSlugs";

const OPENCVES__URL = {
  getCVESList: {
    URL: "/cves",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getCVEsDetail: {
    URL: "/cves/:cve_id",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getVendorsList: {
    URL: "/vendors",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getProductsList: {
    URL: "/products",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
  getProductCVEs: {
    URL: "/soft/:product_id",
    SLUG: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
    ACTION: "view",
  },
};
export default OPENCVES__URL;
