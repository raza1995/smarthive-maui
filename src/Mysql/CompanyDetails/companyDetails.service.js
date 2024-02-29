import { errorHandler } from "../../utils/errorHandler";
import companyDetailsModel from "./companyDetails.model";


export const createCompanyDetail = async (data) => {
  try {
    const companyDetails = await companyDetailsModel.create(data);
    return companyDetails;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

const companyDetailsService = {
    createCompanyDetail,
};
export default companyDetailsService;
