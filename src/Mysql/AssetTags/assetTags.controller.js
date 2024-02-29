import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { isArray } from "../../utils/commonFunctions";
import { errorHandler } from "../../utils/errorHandler";
import { assetsScoreWeightagesScoresUpdateTrigger } from "../AssetsScoreManagements/Triggers/TriggerFunctions";
import { TagUnAssignToAsset } from "../Logs/ActivitiesType/assetsactivities";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { updateRiskCostFactorsAssetsCount, updateRiskCostFactorsTolerance } from "../RiskCostFactor/riskCostFactor.service";
import TagsModel from "../Tags/tags.model";
import { findUserOAuthId } from "../Users/users.service";
import AssetTagModel from "./assetTags.model";
import { updateOrCreateAssetTags } from "./assetTags.service";
import { updateRiskTolencesAssetsCount } from "../RiskTolerance/riskTolerance.service";

export const updateDowntimecostTrigger = async (company_id) => {
  await updateRiskTolencesAssetsCount(company_id);
  await updateRiskCostFactorsAssetsCount(company_id);
  await assetsScoreWeightagesScoresUpdateTrigger(company_id);
  await updateRiskCostFactorsTolerance(company_id);
}
export const updateDeviceTags = async (req, res) => {
  try {
    const {user} = req;

    const { id } = req.params;
    if (isArray(req.body.tags)) {
      const {tags} = req.body ;
      const oldAssets = await AssetTagModel.findAll({
        where: {
          asset_id: id,
        },
        limit: 2,
        order: [["updatedAt", "DESC"]],
      }).then((resp) => resp);
      const lastUpdatedAtDate = oldAssets?.[0]?.updatedAt;
      const assetData = await updateOrCreateAssetTags(tags, user.company_id, id,{
        client_id: user?.id,
        client_email: user?.email,
        ipAddress: req.socket.remoteAddress,
        company_id: user.company_id,
      });
      if (oldAssets.length > 0) {
        const deleteAssets = await AssetTagModel.findAll({
          where: {
            asset_id: id,
            updatedAt: {
              [Op.lte]: lastUpdatedAtDate,
            },
          },
          include:{
            model:TagsModel,
            attributes:["label"]
          }
        });
        deleteAssets.forEach(assetTag=>{             
           AssetTagModel.destroy({
            where: {
              id: assetTag.id,
            },
          });
          addEventLog(
            {
              id: user?.id,
              email: user?.email,
              ipAddress: req.socket.remoteAddress,
              company_id: user.company_id,
              process: `"${assetTag.tag.label}" tag unassigned successfully`,
              user_id: null,
              asset_id: assetTag.asset_id,
              isSystemLog: false,
            },
            TagUnAssignToAsset.status.TagUnassignToAssetSuccessfully.code,
            null
          );
        })
      
        console.log("delete assets", deleteAssets?.length);
      }
      updateDowntimecostTrigger(user.company_id);
      res.status(StatusCodes.OK).json({ message: "success" });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "tags field must be array in body" });
    }
    //  tags
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ err, message: err.message });
  }
};
