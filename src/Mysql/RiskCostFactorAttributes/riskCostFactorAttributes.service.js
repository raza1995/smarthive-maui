import { createCostFactorAttribute } from "../Logs/ActivitiesType/RiskCostFactorActivities";
import { addEventLog, createEventPayload } from "../Logs/eventLogs/eventLogs.controller";
import riskCostFactorAttributesModel from "./riskCostFactorAttributes.model";

export const getAllRiskCostFactorAttributes = async (
  company_id
) => {
  const sort = "ASC";
  const sortColumn = "createdAt";
  const riskCostFactorAttributesData = await riskCostFactorAttributesModel.findAll({
    where: {
      company_id,
    },
    order: [[sortColumn, sort]],
  });

  return { riskCostFactorAttributesData };
};

export const createRiskCostFactorAttribute = async (payload, clientDetails, transactionObj) => {
  try {
    const riskCostFactorAttributeData = await riskCostFactorAttributesModel.create(payload, transactionObj);
    clientDetails.target_id = riskCostFactorAttributeData.id;
    clientDetails.effected_table = riskCostFactorAttributesModel.tableName;
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createCostFactorAttribute.status.createCostFactorAttributeSuccessfully.code,
        createEventPayload(
          {},
          JSON.parse(JSON.stringify(payload)),
          riskCostFactorAttributesModel.tableName
        )
      );
    }
    return riskCostFactorAttributeData;
  } catch (error) {
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createCostFactorAttribute.status.createCostFactorAttributeFailed.code,
        null,
        error.message
      );
    }
    return error.message;
  }
};

export const findRiskCostFactorAttribute = async (payload) => {

  const riskCostFactorAttributeData = await riskCostFactorAttributesModel.findOne({
    where: payload,
  });

  return riskCostFactorAttributeData;
};
