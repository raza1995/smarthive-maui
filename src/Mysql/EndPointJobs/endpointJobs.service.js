import { errorHandler } from "../../utils/errorHandler";
import endpointJobsModel from "./endpointJobs.model";

export const updateOrCreateEndpointJobs = async (
  company_id,
  asset_id,
  item
) => {
  try {
    item.source_job_id = item.id;
    delete item.id;
    const job = await endpointJobsModel.findOne({
      where: { asset_id, company_id, source_job_id: item.source_job_id },
    });

    if (job) {
      await endpointJobsModel.update(
        { asset_id, company_id, ...item },
        {
          where: {
            id: job.id,
          },
        }
      );
    } else {
      await endpointJobsModel.create({ asset_id, company_id, ...item });
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
