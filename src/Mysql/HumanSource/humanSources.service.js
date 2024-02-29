import { errorHandler } from "../../utils/errorHandler"
import humanSourcesModel from "./humanSources.model"

export const updateOrCreateHumanSources = async (human_id, items) => {
  try {
    let i = 0
    for await (const item of items) {
      const asset = await humanSourcesModel.findOne({
        where: { human_id, sources_type: item.sources_type },
      })
      i++
      if (asset) {
        await humanSourcesModel.update(item, {
          where: {
            human_id,
            sources_type: item.sources_type,
          },
        })
      } else {
        await humanSourcesModel.create({ human_id, ...item })
      }
      const percentage = (i * 100) / items.length
      // console.log("Human source save to db", percentage, "%done...");
    }

    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
