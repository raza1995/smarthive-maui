import { errorHandler } from "../../utils/errorHandler";
import ApplicationServicesSQLModel from "./applicationServices.model";

export const addServicesToApplication = async (
  serviceIds,
  applicationData,
  company_id,
  clientDetails
) => {
  try {
    await ApplicationServicesSQLModel.destroy({
      where: {
        company_id,
        application_id: applicationData.id,
      },
    }).then(async (response) => {
      if (serviceIds?.length > 0) {
        for await (const item of serviceIds) {
          const payload = {
            service_id: item,
            application_id: applicationData.id,
            company_id,
          };
          await ApplicationServicesSQLModel.create(payload)
            .then(async (res) => {
              console.log("res");
            })
            .catch((err) => {
              errorHandler(err);
            });
        }
      }
      return true;
    });
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};
