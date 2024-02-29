
import { Op } from "sequelize";
import { getCompanyAssetsBySource } from "../Assets/assets.service";
import { integrationsNames } from "../../utils/constants";
import { updateOrCreateEndpointsSuspiciousActivity } from "./endpointSuspiciousActivity.service";
import endpointSuspiciousActivityModel from "./endpointSuspiciousActivity.model";
import malwareBytesSuspiciousActivityModel from "../../mongo/malwareBytes/SuspiciousActivity/suspiciousActivity.model";
import  { findUserOAuthId } from "../Users/users.service";
import { errorHandler } from "../../utils/errorHandler";

export const saveMalwareBytesSuspiciousActivityToSql = async (company_id) => {
  try {
    if (company_id) {
      const malwareBytesSuspiciousActivity =
        await malwareBytesSuspiciousActivityModel.find({ company_id });
      const oldDetections = await endpointSuspiciousActivityModel.findAll({
        where: { company_id },
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      console.log(
        "Saving MalwareBytes Suspicious Activity To Sql.....",
        malwareBytesSuspiciousActivity?.length
      );
      const lastUpdatedAtDate = oldDetections?.[0]?.updatedAt;
      for await (const item of malwareBytesSuspiciousActivity) {
        const asset = await getCompanyAssetsBySource(
          company_id,
          integrationsNames.MALWAREBYTES,
          `/api/v2/machines/${item.machine_id}`
        );
        if (asset) {
          await updateOrCreateEndpointsSuspiciousActivity(
            company_id,
            asset.id,
            JSON.parse(JSON.stringify(item))
          );
        }
      }
      if (oldDetections.length > 0) {
        const deleteDetections = await endpointSuspiciousActivityModel.destroy({
          where: {
            company_id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
        });
        console.log("delete assets", deleteDetections);
      }
    } else {
      console.log("Company Id is not available");
    }
  } catch (error) {
    errorHandler(error);
  }
};

export const getSuspiciousActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const {user} = req;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const tableData = await endpointSuspiciousActivityModel.findAll({
      where: {
        asset_id: id,
      },
      offset: (page - 1) * size,
      limit: +size,
      attributes: ["status", "path", "timestamp", "id"],
    });
    const totalCount = await endpointSuspiciousActivityModel.count({
      where: {
        asset_id: id,
      },
    });

    res.status(200).json({
      valid: true,
      message: "",
      page,
      size,
      totalCount,
      tableData,
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ valid: false, message: err.message });
  }
};
