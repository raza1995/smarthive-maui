import { errorHandler } from "../../utils/errorHandler"
import assetSourcesModel from "./assetSources.model"

export const updateOrCreateAssetSources = async (asset_id, items) => {
  try {
    let i = 0
    for await (const item of items) {
      const assetSource = await assetSourcesModel.findOne({
        where: {
          asset_id,
          sources_type: item.sources_type,
          integration_id: item.integration_id,
        },
      })
      i++
      if (assetSource) {
        await assetSourcesModel.update(item, {
          where: {
            id: assetSource.id,
          },
        })
      } else {
        await assetSourcesModel.create({ asset_id, ...item })
      }
      const percentage = (i * 100) / items.length
      // console.log("Asset source save to db", percentage, "%done...");
    }

    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
