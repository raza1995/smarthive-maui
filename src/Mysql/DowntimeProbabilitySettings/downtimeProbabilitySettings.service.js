import { Op } from "sequelize";
import downtimeProbabilitySQLModel from "../DowntimeProbability/downtimeProbability.model";


export const getAllDowntimeProbabilities = async (
  company_id,
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

  const downtimeProbabilityData = await downtimeProbabilitySQLModel.findAll({
    // where: {
    //   company_id,
    // },
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

  const totalCount = await downtimeProbabilitySQLModel
    .findAndCountAll({
      // where: {
      //   company_id,
      // },
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

  return { downtimeProbabilityData, totalCount };
};

// export const findRiskCostFactorById = async (body) => {
//   const riskCostFactorData = await riskCostFactorSQLModel.findOne({
//     where: {
//       id: body.id,
//     },
//     include: [
//       {
//         model: riskCostFactorSelectedAssetsModel,
//       },
//       {
//         model: riskCostFactorSelectedTagsModel,
//       },
//     ],
//   });
//   return riskCostFactorData;
// };

// export const deleteRiskCostFactorByID = async (
//   riskCostFactorData,
//   clientDetails,
//   res
// ) => {
//   try {
//     await riskCostFactorSQLModel.destroy({
//       where: { id: riskCostFactorData?.dataValues?.id },
//     });

//     await addEventLog(
//       { ...clientDetails, user_id: clientDetails.id },
//       deletecostFactor.status.deleteCostFactorSuccessfully.code,
//       null
//     );
//     return res.status(StatusCodes.ACCEPTED).json({
//       valid: true,
//       message: "Cost Factor deleted successfully",
//     });
//   } catch (error) {
//     errorHandler(error);
//     await addEventLog(
//       { ...clientDetails, user_id: clientDetails.id },
//       deletecostFactor.status.deleteCostFactorSuccessfully.code,
//       null,
//       error.message
//     );
//   }
// };

// export const updateRiskCostFactor = async (payload, body, clientDetails) => {
//   try {
//     await riskCostFactorSQLModel.update(payload, {
//       where: { id: body.id },
//     });
//     const riskCostFactorData = riskCostFactorSQLModel.findOne({
//       where: {
//         id: body.id,
//       },
//     });
//     clientDetails.target_id = body.id;
//     clientDetails.effected_table = riskCostFactorSQLModel.tableName;
//     // Event Logs Handler
//     await addEventLog(
//       { ...clientDetails },
//       UpdateRiskCostFactor.status.updateRiskCostFactorSuccessfully.code,
//       createEventPayload(
//         {},
//         JSON.parse(JSON.stringify(payload)),
//         riskCostFactorSQLModel.tableName
//       )
//     );
//     return riskCostFactorData;
//   } catch (error) {
//     // Event Logs Handler
//     await addEventLog(
//       { ...clientDetails, user_id: null },
//       UpdateRiskCostFactor.status.updateRiskCostFactorFailed.code,
//       null,
//       error.message
//     );
//     return error.message;
//   }
// };

// export const updateRiskCostFactorsAssetsCount = async (company_id) => {
//   try {
//     const riskCostFactorsData = await riskCostFactorSQLModel.findAll({
//       where: {
//         company_id,
//       },
//       include: [
//         {
//           model: riskCostFactorSelectedTagsModel,
//           attributes: ["tag_id"]
//         },
//       ],
//     });

//     if(riskCostFactorsData.length > 0){
//       riskCostFactorsData.forEach(async riskCostFactorData=>{             
//         const tag_ids = [];
//         if(riskCostFactorData.risk_cost_factor_selected_tags.length > 0){
//           await riskCostFactorData.risk_cost_factor_selected_tags.map(async (u) => {
//             tag_ids.push(u.dataValues.tag_id);
//           })
//         }
//         const AssetTags = await AssetTagModel.findAll({
//           where: {
//             tag_id: {
//               [Op.in]: tag_ids,
//             },
//           },
//           attributes: ["asset_id"],
//           group: ["asset_id"],
//         });

//         await riskCostFactorSelectedAssetsModel.destroy({
//           where: { risk_cost_factor_id: riskCostFactorData.id },
//         });
        
//         const assetTagIds = [];
//         if (AssetTags.length) {
//           for (const AssetTag of AssetTags) {
//             const tagIds = [];
//             for (const tagId of tag_ids) {
//               const assetTagData = await AssetTagModel.findOne({
//                 where: {
//                   tag_id: tagId,
//                   asset_id: AssetTag.dataValues.asset_id,
//                 },
//               });
//               if (assetTagData) {
//                 tagIds.push(tagId);
//               }
//             }

//             if (tagIds.length === tag_ids.length) {
//               const payload = {
//                 asset_id: AssetTag.dataValues.asset_id,
//                 risk_cost_factor_id: riskCostFactorData.id,
//                 company_id,
//               };
//               await riskCostFactorSelectedAssetsModel
//                   .create(payload)
//                   .then(async (res) => {
//                     console.log("res");
//                   })
//                   .catch((err) => {
//                     errorHandler(err);
//                   });
//             }
//           }
//         }
//       })
//     }
//     // return riskCostFactorData;
//   } catch (error) {
//     errorHandler(error);
//   }
// };
