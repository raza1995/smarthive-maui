import { errorHandler } from "../../utils/errorHandler";
import { getOpenCVEs } from "./CVEs/CVEs.service";
import { getOpenCWEs } from "./CWEs/CWEs.service";
import { getOpenCVEsVendors } from "./Vendors/Vendors.service";

export const OpenCVECronFunction = async () => {
  try {
    await getOpenCVEs();
    await getOpenCWEs();
    await getOpenCVEsVendors();
  } catch (err) {
    errorHandler(err);
  }
};
