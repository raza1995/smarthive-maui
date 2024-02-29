import { integrationsNames } from "../../utils/constants";
import { getAllCompaniesHaveIntegration } from "../Companies/company.service";
import { saveMalwareBytesEndpointJobs } from "../EndPointJobs/endpointJobs.controller";
import { saveMalwareBytesDetectionsToSql } from "../EndpointsDetections/endpointsDetections.controller";
import { saveMalwareBytesQuarantineToSql } from "../EndpointsQuaratines/endpointQuarantines.controller";
import { saveMalwareBytesSuspiciousActivityToSql } from "../EndpointsSuspiciousActivity/endpointSuspiciousActivity.controller";
import { saveMalwareBytesEndpointEvents } from "../endpointEvent/endpointEvent.controller";
import { errorHandler } from "../../utils/errorHandler";

export const transferMalwareByteDataMongoToMysqlOfCompany = async (company) => {
  try {
    await saveMalwareBytesDetectionsToSql(company.id);
    await saveMalwareBytesSuspiciousActivityToSql(company.id);
    await saveMalwareBytesEndpointJobs(company.id);
    await saveMalwareBytesEndpointEvents(company.id);
    await saveMalwareBytesQuarantineToSql(company.id);
  } catch (error) {
    errorHandler(error);
  }
};
export const transferMalwareByteDataMongoToMysql = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.MALWAREBYTES
    );
    if (Companies.length > 0) {
      if (res) {
        res.send("Malware detections data start fetching successfully");
      }
      for await (const company of Companies) {
        await transferMalwareByteDataMongoToMysqlOfCompany(company);
      }
    } else if (res) {
      res.send("We don't have have companies with malwareBytes Integration");
    }
  } catch (error) {
    errorHandler(error);
    if (res) {
      res.status(500).json(error);
    }
  }
};
