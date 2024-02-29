import { getCrowdStrikeDeviceOfCompany } from "../../mongo/crowdStrike/Devices/crowdStrikeDevice.Controller";
import { saveAssetsOfCompany } from "../../Mysql/Assets/asset.controller";
import { getAllCompaniesHaveIntegration } from "../../Mysql/Companies/company.service";
import { integrationsNames } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";

export const CrowdStrikeCronOfCompany = async (company) => {
  try {
    await getCrowdStrikeDeviceOfCompany(company);
    await saveAssetsOfCompany(company);
  } catch (err) {
    errorHandler(err);
  }
};

/** ***************Automox cron function ************** */
export const CrowdStrikeCronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.CROWDSTRIKE
  );
  if (Companies) {
    for await (const company of Companies) {
      await CrowdStrikeCronOfCompany(company);
    }
  }
};
