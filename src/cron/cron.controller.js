import { getAutomoxDataExtractsOfCompany } from "../mongo/controllers/Automox/automoxDataExtracts.controller";
import { fetchAllAutomoxDevicesOfCompany } from "../mongo/controllers/Automox/automoxDevice.controller";
import { getAutomoxDeviceSoftwareOfCompany } from "../mongo/controllers/Automox/automoxSoftware.controller";
import { getMalwareBytesDetectionsOfCompany } from "../mongo/malwareBytes/Detections/detections.controller";
import { getEndpointAgentInfoOfCompany } from "../mongo/malwareBytes/EndpointAgentInfo/endpointAgentInfo.controller";
import { getEndpointsOfCompany } from "../mongo/malwareBytes/Endpoints/endpoints.controller";
import { getMalwareBytesEventsOfCompany } from "../mongo/malwareBytes/Events/events.controller";
import { getMalwareBytesQuarantineOfCompany } from "../mongo/malwareBytes/Quaratines/quarantines.controller";
import { getMalwareBytesSuspiciousActivityOfCompany } from "../mongo/malwareBytes/SuspiciousActivity/suspiciousActivity.controller";
import {
  saveAssets,
  saveAssetsOfCompany,
} from "../Mysql/Assets/asset.controller";
import { transferMalwareByteDataMongoToMysqlOfCompany } from "../Mysql/Common/common.controller";
import { getAllCompaniesHaveIntegration } from "../Mysql/Companies/company.service";
import { integrationCategoryType, integrationsNames } from "../utils/constants";
import deviceWarrantyController from "../mongo/controllers/auvik/deviceWarrantyController";
import deviceLifecycleController from "../mongo/controllers/auvik/deviceLifecycleController";
import deviceDetailsController from "../mongo/controllers/auvik/deviceDetailsController";
import deviceController from "../mongo/controllers/auvik/deviceController";
import { saveSoftwaresToMySqlOfCompany } from "../Mysql/AssetSoftwares/assetSoftware.controller";
import { saveImpactOnScore } from "../Mysql/AssetRiskScoreImpact/assetRiskScoreImpact.controller";
import { getMalwareBytesCvesOfCompany } from "../mongo/malwareBytes/Cves/cves.controller";
import {
  CrowdStrikeCronFunction,
  CrowdStrikeCronOfCompany,
} from "./IntgrationsCron/CrowdStrikeCrons.service";
import {
  SentinelOneCronFunction,
  SentinelOneCronOfCompany,
} from "./IntgrationsCron/SentinelOneCrons.service";
// eslint-disable-next-line import/no-cycle

import {
  microsoftCronFunction,
  microsoftCronFunctionMain,
} from "./IntgrationsCron/MicrosoftCrons.service";
import {
  knowb4CronFunction,
  knowBe4CronFunction,
} from "./IntgrationsCron/Knowb4Crons.service";
import { OpenCVECronFunction } from "../mongo/OpenCVE/OpenCVECron";
import { druvaCronFunction, druvaCronOfCompany } from "./IntgrationsCron/IntegrationCrons.service.js/druva.service";

export const malwareByteCronOfCompany = async (company) => {
  console.log(
    `*************************** crone start malware ${company.integrations.integration_category_type} data  *****************************************`
  );
  await getEndpointsOfCompany(company);
  await getEndpointAgentInfoOfCompany(company);
  await saveAssetsOfCompany(company);
  if (
    company.integrations.integration_category_type ===
    integrationCategoryType.endpoint
  ) {
    console.log("saving malware endpoints data");
    await getMalwareBytesDetectionsOfCompany(company);
    await getMalwareBytesEventsOfCompany(company);
    await getMalwareBytesQuarantineOfCompany(company);
    await getMalwareBytesSuspiciousActivityOfCompany(company);
    await transferMalwareByteDataMongoToMysqlOfCompany(company);
  }
  if (
    company.integrations.integration_category_type ===
    integrationCategoryType.patching
  ) {
    console.log(
      "**************************************** saving malware patching data  ****************************************************************************"
    );
    await getMalwareBytesCvesOfCompany(company);
    await saveSoftwaresToMySqlOfCompany(company);
  }
  await saveImpactOnScore(company.id);
};

export const automoxCronOfCompany = async (company) => {
  await fetchAllAutomoxDevicesOfCompany(company);
  await saveAssetsOfCompany(company);
  await getAutomoxDeviceSoftwareOfCompany(company.id);
  await getAutomoxDataExtractsOfCompany(company);
  await saveSoftwaresToMySqlOfCompany(company);
  // await createCompanyAutomoxGroup(company);
  // await getAutomoxPoliciesOfCompany(company);
  // await saveGroupsToMySqlOfCompany(company);
  // await SaveAutomoxPoliciesForCompany(company);
  await saveAssetsOfCompany(company);
  await saveImpactOnScore(company.id);
};

/** ***************Automox cron function ************** */
export const automoxCronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.AUTOMOX
  );
  if (Companies) {
    for await (const company of Companies) {
      await automoxCronOfCompany(company);
    }
  }
};

export const malwareByteCronFunction = async () => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.MALWAREBYTES
  );
  if (Companies) {
    for await (const company of Companies) {
      await malwareByteCronOfCompany(company);
    }
  }
};

export const auvikCronFUnction = async () => {
  await deviceController.import();
  await deviceWarrantyController.import();
  await deviceLifecycleController.import();
  await deviceDetailsController.import();
  await saveAssets(integrationsNames.AUVIK);
};

export const runCronOfCompanyIntegration = async (company) => {
  switch (company.integrations.integration_name) {
    case integrationsNames.MALWAREBYTES:
      await malwareByteCronOfCompany(company);
      break;
    case integrationsNames.AUTOMOX:
      await automoxCronOfCompany(company);
      break;
    case integrationsNames.AUVIK:
      await auvikCronFUnction();
      break;
    case integrationsNames.CROWDSTRIKE:
      await CrowdStrikeCronOfCompany(company);
      break;
    case integrationsNames.SENTINELONE:
      await SentinelOneCronOfCompany(company);
      break;
    case integrationsNames.KNOWBE4:
      await knowBe4CronFunction(company);
      break;
    case integrationsNames.MICROSOFT:
      await microsoftCronFunction(company);
      break;
    case integrationsNames.DRUVA:
      await druvaCronOfCompany(company);
      break;
    default:
      break;
  }
  // if (
  //   company.integrations.integration_name === integrationsNames.MALWAREBYTES
  // ) {
  //   await malwareByteCronOfCompany(company);
  // } else if (
  //   company.integrations.integration_name === integrationsNames.AUTOMOX
  // ) {
  //   await automoxCronOfCompany(company);
  // }
};

export const runCron = async (req, res) => {
  const { type } = req.params;
  switch (type) {
    case integrationsNames.MALWAREBYTES:
      await malwareByteCronFunction();
      break;
    case integrationsNames.AUTOMOX:
      await automoxCronFunction();
      break;
    case integrationsNames.AUVIK:
      await auvikCronFUnction();
      break;
    case integrationsNames.CROWDSTRIKE:
      await CrowdStrikeCronFunction();
      break;
    case integrationsNames.SENTINELONE:
      await SentinelOneCronFunction();
      break;
    case integrationsNames.KNOWBE4:
      await knowb4CronFunction();
      break;
    case integrationsNames.MICROSOFT:
      await microsoftCronFunctionMain();
      break;
    case integrationsNames.DRUVA:
      await druvaCronFunction();
      break;
    case "opencve":
      await OpenCVECronFunction();
      break;
    default:
      break;
  }

  res.status(200).json({ message: "Cron started successfully" });
};
