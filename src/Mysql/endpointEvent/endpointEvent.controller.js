import { Op } from "sequelize";
import { updateOrCreateEndPointEvent } from "./endpointEvent.service";
import { getCompanyAssetsBySource } from "../Assets/assets.service";
import {  integrationsNames } from "../../utils/constants";
import malwareBytesEventsModel from "../../mongo/malwareBytes/Events/events.model";
import endpointEventModel from "./endpointEvent.model";
import { errorHandler } from "../../utils/errorHandler";

export const saveMalwareBytesEndpointEvents = async (company_id) => {
  try {
    if (company_id) {
      const malwareBytesEvent = await malwareBytesEventsModel.find({
        company_id,
      });
      const oldEndpointEvent = await endpointEventModel.findAll({
        where: { company_id },
        order: [["updatedAt", "DESC"]],
        limit: 2,
      });
      console.log(
        "Saving MalwareBytes events To Sql.....",
        malwareBytesEvent?.length
      );
      const lastUpdatedAtDate = oldEndpointEvent?.[0]?.updatedAt;
      for await (const item of malwareBytesEvent) {
        const asset = await getCompanyAssetsBySource(
          company_id,
          integrationsNames.MALWAREBYTES,
          `/api/v2/machines/${item.machine_id}`
        );
        if (asset) {
          // console.log(item)

          await updateOrCreateEndPointEvent(
            company_id,
            asset.id,
            JSON.parse(JSON.stringify(item))
          );
        }
      }
      if (oldEndpointEvent.length > 0) {
        const deleteEndPointEvent = await endpointEventModel.destroy({
          where: {
            company_id,
            updatedAt: { [Op.lte]: lastUpdatedAtDate },
          },
        });
        console.log("delete assets", deleteEndPointEvent);
      }
    } else {
      console.log("Company Id is not available");
    }
  } catch (error) {
    errorHandler(error);
  }
};

export const getEndpointEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req;
    const { page } = query;
    const { size } = query;
    const tableData = await endpointEventModel.findAll({
      where: {
        asset_id: id,
      },
      offset: (page - 1) * size,
      limit: +size,
      attributes: [
        "timestamp",
        "severity",
        "severity_name",
        "source_name",
        "type",
        "type_name",
      ],
    });
    const totalCount = await endpointEventModel.count({
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
    res.status(400).json({ valid: false, message: err.message });
  }
};
