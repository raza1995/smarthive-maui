import { errorHandler } from "../../utils/errorHandler";
import endpointSuspiciousActivityModel from "./endpointSuspiciousActivity.model";

export const updateOrCreateEndpointsSuspiciousActivity = async (
  company_id,
  asset_id,
  item
) => {
  try {
    item.source_suspicious_activity_id = item.id;
    delete item.id;
    const suspiciousActivity = await endpointSuspiciousActivityModel.findOne({
      where: {
        asset_id,
        company_id,
        source_suspicious_activity_id: item.source_suspicious_activity_id,
      },
    });

    if (suspiciousActivity) {
      await endpointSuspiciousActivityModel.update(
        { asset_id, company_id, ...item },
        {
          where: {
            id: suspiciousActivity.id,
          },
        }
      );
    } else {
      await endpointSuspiciousActivityModel.create({
        asset_id,
        company_id,
        ...item,
      });
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
