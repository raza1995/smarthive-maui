import { Op } from "sequelize";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import { updateOrCreateAssetRiskScoreImpact } from "./assetRiskScoreImpact.service";
import { assetType } from "../../utils/constants";
import assetSQLModel from "../Assets/assets.model";
import assetRiskScoreImpactModel from "./assetRiskScoreImpact.model";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import { riskScoreSourceWeight } from "../../utils/AssetRiskScore.constants";
import { getSourceValidation } from "../Assets/assets.service";

const calculateImpactScoreScore = (score, weightage, totalWeight) =>
  (850 - score) * (weightage / totalWeight);

export const saveImpactOnScore = async (company_id) => {
  const SourceValidation = await getSourceValidation(company_id, []);
  const assets = await assetSQLModel.findAll({
    where: {
      company_id,
      // "$asset_score.risk_score$": { [Op.lt]: 700 },
    },
    include: [
      AssetScoreSQLModel,
      AssetEndpointInformationModel,
      AssetPatchingInformationModel,
      SourceValidation,
    ],
  });
  console.log("no of assets in this company", assets.length);
  for await (const asset of assets) {
    const isPatchingAvailable = asset?.asset_patching_informations?.length;
    const isEndpointAvailable = asset?.asset_endpoint_informations?.length;

    const scores =
      asset.asset_type === assetType.network
        ? [
            {
              title: "lifecycle_score",
              score: asset?.asset_score?.lifecycle_score,
              is_score_pure: isPatchingAvailable,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.lifecycle_score,
                riskScoreSourceWeight.lifecycle,
                45
              ),
            },
            {
              title: "patching_score",
              score: asset?.asset_score?.patching_score,
              is_score_pure: isPatchingAvailable,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.patching_score,
                riskScoreSourceWeight.patching_score,
                45
              ),
            },
          ]
        : [
            {
              title: "lifecycle_score",
              score: asset?.asset_score?.lifecycle_score,
              is_score_pure: isEndpointAvailable || isPatchingAvailable,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.lifecycle_score,
                riskScoreSourceWeight.lifecycle,
                100
              ),
            },
            {
              title: "endpoint_score",
              score: asset?.asset_score?.endpoint_score,
              is_score_pure: isEndpointAvailable,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.endpoint_score,
                riskScoreSourceWeight.endpoint_score,
                100
              ),
            },
            {
              title: "backup_score",
              score: asset?.asset_score?.backup_score,
              is_score_pure: 0,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.backup_score,
                riskScoreSourceWeight.backup_score,
                100
              ),
            },
            {
              title: "patching_score",
              score: asset?.asset_score?.patching_score,
              is_score_pure: isPatchingAvailable,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.patching_score,
                riskScoreSourceWeight.patching_score,
                100
              ),
            },
            {
              title: "real_time_score",
              score: asset?.asset_score?.real_time_score,
              is_score_pure: 1,
              impact_score: calculateImpactScoreScore(
                asset?.asset_score?.real_time_score,
                riskScoreSourceWeight.real_time_score,
                100
              ),
            },
          ];

    const commonData = {
      company_id: asset.company_id,
      asset_id: asset.id,
      total_risk_score: asset?.asset_score?.risk_score,
    };

    const oldAssets = await assetRiskScoreImpactModel.findAll({
      where: {
        company_id: asset.company_id,
        asset_id: asset.id,
      },
      limit: 2,
      order: [["updatedAt", "DESC"]],
    });
    const lastUpdatedAtDate = oldAssets?.[0]?.updatedAt;

    for await (const riskItem of scores) {
      await updateOrCreateAssetRiskScoreImpact({
        ...commonData,
        impact_by_source: riskItem.title,
        source_risk_score: riskItem.score,
        impact_score: riskItem.impact_score,
        is_score_pure: riskItem.is_score_pure,
      });
    }

    if (oldAssets.length > 0) {
      const deleteAssets = await assetRiskScoreImpactModel.destroy({
        where: {
          company_id: asset.company_id,
          asset_id: asset.id,
          updatedAt: {
            [Op.lt]: lastUpdatedAtDate,
          },
        },
      });
      console.log("delete assets impact", deleteAssets);
    }
  }
};
