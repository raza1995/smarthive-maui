import { errorHandler } from "../../utils/errorHandler";
import endpointEventModel from "./endpointEvent.model";

export const updateOrCreateEndPointEvent = async (
  company_id,
  asset_id,
  item
) => {
  try {
    item.source_event_id = item.id;
    delete item.id;
    const event = await endpointEventModel.findOne({
      where: { asset_id, company_id, source_event_id: item.source_event_id },
    });
    if (event) {
      await endpointEventModel.update(
        { asset_id, company_id, ...item },
        {
          where: {
            id: event.id,
          },
        }
      );
    } else {
      await endpointEventModel.create({ asset_id, company_id, ...item });
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
