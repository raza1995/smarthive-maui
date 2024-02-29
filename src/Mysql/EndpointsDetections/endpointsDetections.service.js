import { errorHandler } from "../../utils/errorHandler";
import endpointDetectionsModel from "./endpointsDetections.model";

export const updateOrCreateEndpointDetection = async (
  company_id,
  asset_id,
  item
) => {
  try {
    item.source_detection_id = item.id;
    delete item.id;
    const detection = await endpointDetectionsModel.findOne({
      where: {
        asset_id,
        company_id,
        source_detection_id: item.source_detection_id,
      },
    });

    if (detection) {
      await endpointDetectionsModel.update(
        { asset_id, company_id, ...item },
        {
          where: {
            id: detection.id,
          },
        }
      );
    } else {
      await endpointDetectionsModel.create({ asset_id, company_id, ...item });
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
