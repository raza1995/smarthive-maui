import { errorHandler } from "../../utils/errorHandler";
import { getAllDowntimeProbabilities } from "./downtimeProbabilitySettings.service";


export const downtimeProbabilityList = async (req, res) => {
  try {
    const { query } = req;
    const { filter, size, page } = query;
    const { user } = req;
    const downtimeProbabilityListArray = await getAllDowntimeProbabilities(
      user.company_id,
      filter,
      page,
      size
    );
    res.status(200).json({
      message: "Downtime Probability fetched successfully",
      ...downtimeProbabilityListArray,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

// export const deleteRiskCostFactor = async (req, res) => {
//   try {
//     const { user } = req;
//     const body = req.params;
//     // For logs
//     const clientDetails = {
//       id: user.id,
//       email: user.email,
//       ipAddress: req.socket.remoteAddress,
//       process: "Delete Risk Cost Factor",
//       company_id: user.company_id,
//     };
//     const riskCostFactor = await findRiskCostFactorById(body);
//     deleteRiskCostFactorByID(riskCostFactor, clientDetails, res);
//   } catch (err) {
//     errorHandler(err);
//     res.status(400).json({ err, message: "Something went wrong" });
//   }
// };

// export const editRiskCostFactor = async (req, res) => {
//   try {
//     const { user } = req;
//     const { body } = req;
//     const { id } = req.params;
//     body.id = id;
//     // For logs
//     const clientDetails = {
//       id: user.id,
//       email: user.email,
//       ipAddress: req.socket.remoteAddress,
//       process: "Update Application",
//       company_id: user.company_id,
//     };
//     const payload = {
//       company_id: user.company_id,
//       condition_use: "and",
//       base_range_lower_bound: body.base_range_lower_bound,
//       base_range_upper_bound: body.base_range_upper_bound,
//       has_peak_time: body.has_peak_time,
//       peak_range_lower_bound: body.peak_range_lower_bound,
//       peak_range_upper_bound: body.peak_range_upper_bound,
//       has_peak_all_days: body.has_peak_all_days,
//       peak_range_from_date: body.peak_range_from_date,
//       peak_range_to_date: body.peak_range_to_date,
//     };
//     await updateRiskCostFactor(payload, body, clientDetails);
//     const riskCostFactor = await findRiskCostFactorById(body);
//     // await deleteRiskCostFactorAssets(riskCostFactor.id)
//     // await deleteRiskCostFactorTags(riskCostFactor.id)
//     // await addAssetsToRiskCostFactor(
//     //   body.asset_ids,
//     //   riskCostFactor.id,
//     //   user.company_id,
//     //   clientDetails
//     // );
//     // await addTagsToRiskCostFactor(
//     //   body.tag_ids,
//     //   riskCostFactor.id,
//     //   user.company_id,
//     //   clientDetails
//     // );
//   } catch (err) {
//     errorHandler(err);
//     res.status(400).json({ err, message: "Something went wrong" });
//   }
// };
