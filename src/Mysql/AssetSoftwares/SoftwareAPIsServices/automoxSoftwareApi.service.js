import { Op } from "sequelize";
import automoxAPI from "../../../api/automox";
import automoxSoftwareModel from "../../../mongo/models/Automox/automoxSoftware.model";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import { getCompanyAssetsForParticularSource } from "../../Assets/assets.service";
import { getAllCompaniesHaveIntegration } from "../../Companies/company.service";
import { updateOrCreateSoftwarePatching } from "../../Patch/patch.controller";
import assetSoftwareSQLModel from "../assetSoftware.model";
import { updateOrCreateAssetSoftware } from "../assetSoftware.service";

export const updateOrCreateAutomoxSOftware = async (
  items,
  asset_id,
  company_id
) => {
  try {
    let i = 0;
    const startTime = new Date();
    for await (const item of items) {
      if (!item.installed) {
        await updateOrCreateSoftwarePatching(
          { ...item, name: item.display_name },
          asset_id,
          company_id
        );
      } else {
        await updateOrCreateAssetSoftware(
          {
            ...item,
            vendor_name: item?.vendor_name || "unknown",
            name: item.display_name,
          },
          asset_id,
          company_id
        );
      }
      // CliProgressBar("Automox software save to DB", i, items.length, startTime);
      i++;
    }
    // console.log("done...");
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getAndSaveAutomoxSoftwareForCompany = async (company) => {
  console.log(company);
  const automoxIntegration = company.integrations.integration_values;

  if (automoxIntegration?.organization_id) {
    const oldData = await assetSoftwareSQLModel.findOne({
      where: { company_id: company.id },
      order: [["updatedAt", "DESC"]],
    });
    const lastUpdatedAtDate = oldData?.updatedAt;
    console.log("lastUpdatedAtDate", lastUpdatedAtDate);
    const orgDevices = await getCompanyAssetsForParticularSource(
      company.id,
      integrationsNames.AUTOMOX
    );
    for await (const device of orgDevices) {
      let page = 0;
      let info;
      do {
        const softwares = await automoxSoftwareModel
          .find({
            company_id: company.id,
            organization_id: automoxIntegration.organization_id,
            server_id: parseInt(device.asset_sources[0].device_id, 10),
          })
          .then((resp) => JSON.parse(JSON.stringify(resp)));
        console.log("softwares.length", softwares.length);
        // return false;
        if (softwares.length > 0) {
          await updateOrCreateAutomoxSOftware(
            softwares,
            device.asset_sources[0].asset_id,
            company.id
          );
        }
        // info = await fetchAll(
        //   device.asset_sources[0],
        //   automoxIntegration.organization_id,
        //   page,
        //   company.id
        // );
        ++page;
        console.log("Number of software", info?.length, "page", page);
      } while (info?.length === 500);
    }
    if (oldData?.length > 0) {
      const deleteAssets = await assetSoftwareSQLModel.destroy({
        where: {
          company_id: company.id,
          updatedAt: { [Op.lte]: lastUpdatedAtDate },
        },
      });
      console.log("delete assets", deleteAssets);
    }
  }
};
const getAutomoxSoftware = async (req, res) => {
  try {
    if (res) {
      res.send("Automox devise data start successfully");
    }
    const pageUrl = null;
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.AUTOMOX
    );
    if (Companies) {
      console.log({ Companies });
      for await (const company of Companies) {
        getAndSaveAutomoxSoftwareForCompany(company);
      }
    }
  } catch (error) {
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

const fetchAll = async (device, orgId, page, company_id) => {
  const url = `servers/${device.device_id}/packages?o=${orgId}&page=${page}&limit=500`;
  return await automoxAPI
    .get(url)
    .catch((error) => {
      console.log("error.message", error.message);
      return error.message;
    })
    .then(async (response) => {
      if (response?.data?.length > 0) {
        if (
          await updateOrCreateAutomoxSOftware(
            response.data,
            device.asset_id,
            company_id
          )
        ) {
          return response.data;
        }
        throw Error("Error occured");
      } else {
        return response.data;
      }
    });
};
