import { Op } from "sequelize";
import { updateOrCreateEndpointDetection } from "./endpointsDetections.service";
import { getCompanyAssetsBySource } from "../Assets/assets.service";
import {  integrationsNames } from "../../utils/constants";
import endpointDetectionsModel from "./endpointsDetections.model";
import malwareBytesDetectionsModel from "../../mongo/malwareBytes/Detections/detections.model";
import  { findUserOAuthId } from "../Users/users.service";
import { errorHandler } from "../../utils/errorHandler";

export const saveMalwareBytesDetectionsToSql = async (company_id) => {
  try {
    if (company_id) {
      const malwareBytesDetections = await malwareBytesDetectionsModel.find({
        company_id,
      });
      const oldDetections = await endpointDetectionsModel.findAll({
        where: { company_id },
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });

      const lastUpdatedAtDate = oldDetections?.[0]?.updatedAt;
      console.log(
        "Saving MalwareBytes Detections To Sql.....",
        malwareBytesDetections?.length
      );
      for await (const item of malwareBytesDetections) {
        const asset = await getCompanyAssetsBySource(
          company_id,
          integrationsNames.MALWAREBYTES,
          `/api/v2/machines/${item.machine_id}`
        );
        if (asset) {
          // console.log(item)

          await updateOrCreateEndpointDetection(
            company_id,
            asset.id,
            JSON.parse(JSON.stringify(item))
          );
        }
      }
      if (oldDetections.length > 0) {
        const deleteDetections = await endpointDetectionsModel.destroy({
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

export const getDetectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const {user} = req;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const tableData = await endpointDetectionsModel.findAll({
      where: {
        asset_id: id,
      },
      attributes: [
        "threat_name",
        "process_name",
        "category",
        "type",
        "source_location",
        "status",
        "destination_location",
        "reported_at",
        "scanned_at",
        "path",
      ],
      offset: (page - 1) * size,
      limit: +size,
    });
    const totalCount = await endpointDetectionsModel.count({
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
