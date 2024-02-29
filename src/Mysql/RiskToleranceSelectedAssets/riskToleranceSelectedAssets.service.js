import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import riskToleranceSelectedAssetsModel from "./riskToleranceSelectedAssets.model";

export const addAssetsToRiskTolerance = async (
  assetIds,
  riskToleranceId,
  company_id,
  clientDetails,
  transactionObj
) => {
  if (assetIds.length > 0) {
    for await (const item of assetIds) {
      const payload = {
        asset_id: item,
        risk_tolerance_id: riskToleranceId,
        company_id,
      };
      const riskToleranceAssetResponse =
        await riskToleranceSelectedAssetsModel
          .create(payload, transactionObj)
          .then(async (res) => {
            console.log("res");
          })
    }
  }
  return true;
};

export const deleteRiskToleranceAssets = async (riskToleranceId) => {
  await riskToleranceSelectedAssetsModel.destroy({
    where: { risk_tolerance_id: riskToleranceId },
  });
  return true;
};

export const getAllRiskToleranceSelectedAssets = async (
  risk_tolerance_id,
  queryFilter,
  page = 1,
  size = 10
) => {
  let filter = {};
  const filterObj = {};
  let filterRequired = false;
  const sort = "DESC";
  const sortColumn = "createdAt";

  if (queryFilter) {
    filter = JSON.parse(queryFilter);
  }

  if (filter?.search) {
    filterObj.label = { [Op.like]: `%${filter?.search}%` };
    filterRequired = true;
  }

  const riskToleranceSelectedAssetsData = await riskToleranceSelectedAssetsModel.findAll({
    where: {
      risk_tolerance_id,
    },
    include: [
      {
        model: assetSQLModel,
      },
    ],
    order: [[sortColumn, sort]],
    offset: (page - 1) * size,
    limit: +size,
  });

  const totalCount = await riskToleranceSelectedAssetsModel
    .findAndCountAll({
      where: {
        risk_tolerance_id,
      },
      include: [
        {
          model: assetSQLModel,
        },
      ],
    })
    .then((resp) => resp.rows.length);

  return { riskToleranceSelectedAssetsData, totalCount };
};
