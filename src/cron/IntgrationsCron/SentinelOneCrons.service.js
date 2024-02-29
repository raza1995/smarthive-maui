import { getSentinelOneAgentForCompany } from "../../mongo/sentinelone/Agents/agents.controller";
import { saveAssetsOfCompany } from "../../Mysql/Assets/asset.controller";
import { getAllCompaniesHaveIntegration } from "../../Mysql/Companies/company.service";
import { integrationsNames } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";

export const SentinelOneCronOfCompany = async (company) => {
  try {
    await getSentinelOneAgentForCompany(company);
    await saveAssetsOfCompany(company);
  } catch (err) {
    errorHandler(err);
  }
};

/** ***************SentinelOne cron function ************** */
export const SentinelOneCronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.SENTINELONE
  );
  if (Companies) {
    for await (const company of Companies) {
      console.log(company);
      await SentinelOneCronOfCompany(company);
    }
  }
};
