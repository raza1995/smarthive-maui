
import { getDruvaBackupsOfCompany } from "../../../mongo/Druva/Backups/DruvaBackups.Controller";
import { getDruvaDeviceOfCompany } from "../../../mongo/Druva/Devices/DruvaDevice.Controller";
import { saveAssetsOfCompany } from "../../../Mysql/Assets/asset.controller";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";

export const druvaCronOfCompany = async (company) => {
  try {
    await getDruvaDeviceOfCompany(company);
    await getDruvaBackupsOfCompany(company)
    await saveAssetsOfCompany(company);
  } catch (err) {
    errorHandler(err);
  }
};

/** ***************Automox cron function ************** */
export const druvaCronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.DRUVA
  );
  if (Companies) {
    for await (const company of Companies) {
      await druvaCronOfCompany(company);
    }
  }
};
