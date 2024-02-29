import getMicrosoftDevicesController, { getMicrosoftDevicesOfCompany } from "../../mongo/microsoft/devices/microsoftDevices.controller"
import getMicrosoftUsersController, { getMicrosoftUsersOfCompany } from "../../mongo/microsoft/users/microsoftUsers.controller"
import { saveSoftwaresToMySqlOfCompany } from "../../Mysql/AssetSoftwares/assetSoftware.controller";
import { getAllCompaniesHaveIntegration } from "../../Mysql/Companies/company.service";
import { updateCompanyRiskScore } from "../../Mysql/HumanRiskScores/humanRiskScore.service"
import { integrationsNames } from "../../utils/constants";

// export const microsoftCronFunctionMain = async () => {
//   await getMicrosoftUsersController()
//   await getMicrosoftDevicesController()
// }
export const microsoftCronFunction = async (company) => {
    await getMicrosoftUsersOfCompany(company)
    await updateCompanyRiskScore(company)
    await getMicrosoftDevicesOfCompany(company);
    await saveSoftwaresToMySqlOfCompany(company);
}

export const microsoftCronFunctionMain = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.MICROSOFT
  );
  if (Companies) {
    for await (const company of Companies) {
      await microsoftCronFunction(company);
    }
  }
};

