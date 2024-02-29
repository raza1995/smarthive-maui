import { Op } from "sequelize"
import { errorHandler } from "../../utils/errorHandler"
import ApplicationSQLModel from "../Applications/application.model"
import { AssetAssignToApplication } from "../Logs/ActivitiesType/assetsactivities"
import {
  addEventLog,
} from "../Logs/eventLogs/eventLogs.controller"
import ApplicationAssetsSQLModel from "./applicationAssets.model"

export const addAssetsToApplication = async (
  assetIds,
  applicationData,
  company_id,
  clientDetails
) => {
  try {
    const assetApplicationIds = await ApplicationAssetsSQLModel.findAll({
      where: {
        application_id: applicationData.id,
        company_id,
        asset_id: { [Op.in]: assetIds },
      },
      raw: true,
      nest: true
    })
    .then((assetsData) => assetsData.map((asset) => asset.asset_id))
    await ApplicationAssetsSQLModel.destroy({
      where: {
        company_id,
        application_id: applicationData.id,
        asset_id: { [Op.notIn]: assetApplicationIds },
      },
    }).then(async (response) => {
      if (assetIds.length > 0) {
        for await (const item of assetIds) {
            
          if (!assetApplicationIds.includes(item)) {
            const payload = {
              asset_id: item,
              application_id: applicationData.id,
              company_id,
            }
            const applicationAssetResponse =
              await ApplicationAssetsSQLModel.create(payload)
                .then(async (res) => {
                  console.log("res")
                })
                .catch((err) => {
                  errorHandler(err)
                })

            clientDetails.target_id = applicationData.id
            clientDetails.asset_id = item
            clientDetails.company_id = company_id
            clientDetails.process = `Asset Assign To Application ${applicationData.name}`
            clientDetails.effected_table = ApplicationSQLModel.tableName
            await addEventLog(
              { ...clientDetails},
              AssetAssignToApplication.status
                .AssetAssignToApplicationSuccessfully.code,
              null
            )
          }
        }
      }            
      return true
    })
  } catch (err) {
    errorHandler(err)
    return err.message
  }
}
