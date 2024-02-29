import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import riskCostFactorSelectedAssetsModel from "./riskCostFactorSelectedAssets.model";

export const addAssetsToRiskCostFactor = async (
  assetIds,
  riskCostFactorId,
  company_id,
  clientDetails,
  transactionObj
) => {
  // try {
    if (assetIds.length > 0) {
      for await (const item of assetIds) {
        const payload = {
          asset_id: item,
          risk_cost_factor_id: riskCostFactorId,
          company_id,
        };
        const riskCostFactorAssetResponse =
          await riskCostFactorSelectedAssetsModel
            .create(payload, transactionObj)
            .then(async (res) => {
              console.log("res");
            })
            // .catch((err) => {
            //   errorHandler(err);
            // });
      }
    }
    return true;
  // } catch (err) {
  //   errorHandler(err);
  //   return err.message;
  // }
};

export const deleteRiskCostFactorAssets = async (
  riskCostFactorId,
  clientDetails,
  res
) => {
  await riskCostFactorSelectedAssetsModel.destroy({
    where: { id: riskCostFactorId },
  });
  return true;
};

export const getAllRiskCostFactorSelectedAssets = async (
  risk_cost_factor_id,
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

  const riskCostFactorSelectedAssetsData = await riskCostFactorSelectedAssetsModel.findAll({
    where: {
      risk_cost_factor_id,
    },
    include: [
      {
        model: assetSQLModel,
      },
    ],
    // include: [
    //   {
    //     model: riskCostFactorSelectedAssetsModel,
    //     include: [
    //       {
    //         model: assetSQLModel,
    //       },
    //     ],
    //   },
    //   {
    //     model: riskCostFactorSelectedTagsModel,
    //     include: [
    //       {
    //         model: TagsModel,
    //         where: filterObj,
    //         required: filterRequired,
    //       },
    //     ],
    //   },
    // ],
    order: [[sortColumn, sort]],
    offset: (page - 1) * size,
    limit: +size,
  });

  const totalCount = await riskCostFactorSelectedAssetsModel
    .findAndCountAll({
      where: {
        risk_cost_factor_id,
      },
      include: [
        {
          model: assetSQLModel,
        },
      ],
      // include: [
      //   {
      //     model: riskCostFactorSelectedTagsModel,
      //     required: true,
      //     include: [
      //       {
      //         model: TagsModel,
      //         where: filterObj,
      //         required: filterRequired,
      //       },
      //     ],
      //   },
      // ],
    })
    .then((resp) => resp.rows.length);

  return { riskCostFactorSelectedAssetsData, totalCount };
};


export const updateRiskCostFactorsSelectedAsset = async (filterObj, payload) => {
  try {
    await riskCostFactorSelectedAssetsModel.update(payload, {
      where: filterObj
    });
    return true;
  } catch (error) {
    errorHandler(error);
    return false;
  }
};