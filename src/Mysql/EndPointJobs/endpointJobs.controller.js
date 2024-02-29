import { Op } from "sequelize";
import { getCompanyAssetsBySource } from "../Assets/assets.service";
import {  integrationsNames } from "../../utils/constants";
import malwareBytesJobsModel from "../../mongo/malwareBytes/Jobs/jobs.model";
import endpointJobsModel from "./endpointJobs.model";
import { updateOrCreateEndpointJobs } from "./endpointJobs.service";
import { errorHandler } from "../../utils/errorHandler";

export const saveMalwareBytesEndpointJobs = async (company_id) => {
  try {
    if (company_id) {
      const malwareBytesJobs = await malwareBytesJobsModel.find({ company_id });
      const oldEndpointJobs = await endpointJobsModel.findAll({
        where: { company_id },
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      console.log(
        "Saving MalwareBytes Jobs To Sql.....",
        malwareBytesJobs?.length
      );
      const lastUpdatedAtDate = oldEndpointJobs?.[0]?.updatedAt;
      for await (const item of malwareBytesJobs) {
        const asset = await getCompanyAssetsBySource(
          company_id,
          integrationsNames.MALWAREBYTES,
          `/api/v2/machines/${item.machine_id}`
        );
        if (asset) {
          // console.log(item)

          await updateOrCreateEndpointJobs(
            company_id,
            asset.id,
            JSON.parse(JSON.stringify(item))
          );
        }
      }
      if (oldEndpointJobs.length > 0) {
        const deleteEndPointJobs = await endpointJobsModel.destroy({
          where: {
            company_id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
        });
        console.log("delete assets", deleteEndPointJobs);
      }
    } else {
      console.log("Company Id is not available");
    }
  } catch (error) {
    errorHandler(error);
  }
};
