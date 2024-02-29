import { errorHandler } from "../../utils/errorHandler";
import sequelize from "../db";
import { getAllDowntimeProbabilities, updateDowntimeProbability } from "./downtimeProbability.service";


export const downtimeProbabilityList = async (req, res) => {
  try {
    const { query } = req;
    const { filter, size, page } = query;
    const { user } = req;
    const riskCostFactors = await getAllDowntimeProbabilities(
      user.company_id,
      filter,
      page,
      size
    );
    res.status(200).json({
      message: "Downtime Probability fetched successfully",
      ...riskCostFactors,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const editDowntimeProbability = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const transactionObj = { transaction: t };
      const { user, body } = req;
      const { id } = req.params;
      // For logs
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Update Downtime Probability",
        company_id: user.company_id,
      };
      const payload = {
        modified_downtime_probability_time: body.modified_downtime_probability_time,
        modified_downtime_probability_year: body.modified_downtime_probability_year,
      };
      await updateDowntimeProbability(payload, id, clientDetails, transactionObj);
      res.status(200).json({
        message: "Downtime probability updated successfully",
        valid: true,
      });
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

