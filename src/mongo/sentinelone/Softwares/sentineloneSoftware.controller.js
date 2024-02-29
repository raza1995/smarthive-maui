import { sentinelOneApiGet } from "../../../api/sentinelOneApi";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import sentineloneSoftwareModel from "./sentineloneSoftware.model";
import { updateOrCreate } from "./sentineloneSoftware.service";

const fetchAll = async (api_token, cursor, company_id, baseUrl) => {
  // servers/${id}/packages?${query}
  const url = `${baseUrl}/installed-applications?limit=1000${
    cursor ? `&cursor=${cursor}` : ""
  }`;
  return sentinelOneApiGet(url, api_token)
    .catch((error) => {
      console.log("error.message", error.message);
      return error.message;
    })
    .then(async (response) => {
      if (response?.data?.data.length > 0) {
        if (await updateOrCreate(response.data.data, company_id)) {
          return response.data;
        }
        throw Error("Error occured");
      } else {
        return response.data;
      }
    });
};

export const getSentinelOneSoftwareForCompany = async (company) => {
  console.log(company);
  const sentinelOneIntegration = company.integrations.integration_values;
  const baseUrl = company.integrations?.integrations_base_url?.base_url;
  if (sentinelOneIntegration?.api_token) {
    const oldData = await sentineloneSoftwareModel
      .find({ company_id: company.id })
      .sort({ updatedAt: -1 });
    const lastUpdatedAtDate = oldData?.updatedAt;
    console.log("lastUpdatedAtDate", lastUpdatedAtDate);
    let cursor = null;
    do {
      const resp = await fetchAll(
        sentinelOneIntegration.api_token,
        cursor,
        company.id,
        baseUrl
      );
      cursor = resp.pagination.nextCursor;
      console.log("Number of software", resp?.data.length);
    } while (cursor != null);

    if (oldData?.length > 0) {
      const deleteAssets = await sentineloneSoftwareModel
        .deleteMany({
          company_id: company.id,
          updatedAt: { $lte: lastUpdatedAtDate },
        })
        .sort({ updatedAt: 1 });
      console.log("delete assets", deleteAssets.deletedCount);
    }
  }
};
const getSentinelOneSoftware = async (req, res) => {
  try {
    if (res) {
      res.send("sentinelOne data start successfully");
    }
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.SENTINELONE
    );
    if (Companies) {
      console.log({ Companies });
      for await (const company of Companies) {
        getSentinelOneSoftwareForCompany(company);
      }
    }
  } catch (error) {
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default getSentinelOneSoftware;
