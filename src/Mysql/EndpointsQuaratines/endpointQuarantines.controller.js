
import { Op } from "sequelize";
import { getCompanyAssetsBySource } from "../Assets/assets.service";
import { integrationsNames } from "../../utils/constants";
import endpointQuarantineModel from "./endpointQuarantines.model";
import malwareBytesQuarantinesModel from "../../mongo/malwareBytes/Quaratines/quarantines.model";
import { updateOrCreateEndpointQuarantine } from "./endpointQuarantines.service";
import  { findUserOAuthId } from "../Users/users.service";
import { errorHandler } from "../../utils/errorHandler";

export const saveMalwareBytesQuarantineToSql = async (company_id) => {
  try {
    if (company_id) {
      const malwareBytesQuarantine = await malwareBytesQuarantinesModel.find({
        company_id,
      });
      const oldDetections = await endpointQuarantineModel.findAll({
        where: { company_id },
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      console.log(
        "Saving MalwareBytes Quarantine To Sql.....",
        malwareBytesQuarantine?.length
      );
      const lastUpdatedAtDate = oldDetections?.[0]?.updatedAt;
      for await (const item of malwareBytesQuarantine) {
        const asset = await getCompanyAssetsBySource(
          company_id,
          integrationsNames.MALWAREBYTES,
          `/api/v2/machines/${item.machine_id}`
        );
        if (asset) {
          await updateOrCreateEndpointQuarantine(
            company_id,
            asset.id,
            JSON.parse(JSON.stringify(item))
          );
        }
      }
      if (oldDetections.length > 0) {
        const deleteDetections = await endpointQuarantineModel.destroy({
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

export const getQuarantinesById = async (req, res) => {
  try {
    const { id } = req.params;
    const {user} = req;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const tableData = await endpointQuarantineModel.findAll({
      where: {
        asset_id: id,
      },
      offset: (page - 1) * size,
      limit: +size,
      attributes: [
        "threat_name",
        "category",
        "type",
        "path",
        "scanned_at",
        "scanned_at_local",
      ],
    });
    const totalCount = await endpointQuarantineModel.count({
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
