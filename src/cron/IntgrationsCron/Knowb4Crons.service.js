import { getKnowb4GroupsOfCompany } from "../../mongo/Knowbe4/groups/knowBe4Groups.controller";
import { getKnowB4UsersOfCompany } from "../../mongo/Knowbe4/users/knowBe4Users.controller";
import { getAllCompaniesHaveIntegration } from "../../Mysql/Companies/company.service";
import { updateCompanyRiskScore } from "../../Mysql/HumanRiskScores/humanRiskScore.service";
import { integrationsNames } from "../../utils/constants";

export const knowBe4CronFunction = async (company) => {
  await getKnowB4UsersOfCompany(company)
  // await getKnowb4GroupsOfCompany(company)
  await updateCompanyRiskScore(company)
  // await saveHumans()
}


export const knowb4CronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.KNOWBE4
  );
  if (Companies) {
    for await (const company of Companies) {
      await knowBe4CronFunction(company);
    }
  }
};