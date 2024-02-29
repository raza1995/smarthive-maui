import { errorHandler } from "../../utils/errorHandler";
import AssetDetailModel from "./assetDetail.model";

export const updateOrCreateAssetScore = async (data) => {
    try {
      if (data?.asset_id) {
        const asset = await AssetDetailModel.findOne({
          where: {
            asset_id: data.asset_id,
            company_id: data.company_id,
          },
        });
  
        if (asset) {
          await AssetDetailModel.update(data, {
            where: {
              id: asset.id,
            },
          });
          console.log(`asset score updated for asset id ${asset.id}`,);
        } else {
          const newAssetsEndpointInfo = await AssetDetailModel.create(data);
          console.log(`new asset score created for asset id ${newAssetsEndpointInfo.id}`,);
        }
      }
      return true;
    } catch (err) {
      errorHandler(err);
      return false;
    }
  };