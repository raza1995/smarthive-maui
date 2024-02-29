import { errorHandler } from "../../utils/errorHandler";
import endpointQuarantineModel from "./endpointQuarantines.model";

export const updateOrCreateEndpointQuarantine = async (
  company_id,
  asset_id,
  item
) => {
  try {
    item.source_quarantine_id = item.id;
    delete item.id;
    const suspiciousActivity = await endpointQuarantineModel.findOne({
      where: {
        asset_id,
        company_id,
        source_quarantine_id: item.source_quarantine_id,
      },
    });

    if (suspiciousActivity) {
      await endpointQuarantineModel.update(
        { asset_id, company_id, ...item },
        {
          where: {
            id: suspiciousActivity.id,
          },
        }
      );
    } else {
      await endpointQuarantineModel.create({ asset_id, company_id, ...item });
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
