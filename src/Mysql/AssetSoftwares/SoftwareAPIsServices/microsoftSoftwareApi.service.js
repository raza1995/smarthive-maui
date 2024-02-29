import { Op } from "sequelize";
import microsoftDeviceSoftwaresModel from "../../../mongo/microsoft/softwares/microsoftSoftwares.model";
import { CliProgressBar } from "../../../utils/cliProgressBar";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import AssetEndpointInformationModel from "../../AssetEndpointInformation/assetEndpointInformation.model";
import { getCompanyAssetsForParticularSource } from "../../Assets/assets.service";
import assetSoftwareSQLModel from "../assetSoftware.model";
import { updateOrCreateAssetSoftware } from "../assetSoftware.service";

export const updateOrCreateMicrosoftSOftware = async (
  items,
  asset_id,
  company_id
) => {
  try {
    let i = 0;
    const startTime = new Date();
    const endPointInfo = await AssetEndpointInformationModel.findOne({
        where:{asset_id}
    });
    for await (const item of items) {
        const software = {
            name : item.displayName,
            vendor_name : item.publisher,
            version : item.version || null,
            os_name : endPointInfo?.os_name || null,
            os_version : endPointInfo?.os_current_version || null,
        }
        await updateOrCreateAssetSoftware(
          software,
          asset_id,
          company_id
        );
      CliProgressBar("Microsoft software save to DB", i, items.length, startTime);
      i++;
    }
    // console.log("done...");
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const getAndSaveMicrosoftSoftwareForCompany = async (company) => {
    const oldData = await assetSoftwareSQLModel.findOne({
      where: { company_id: company.id },
      order: [["updatedAt", "DESC"]],
    });
    const lastUpdatedAtDate = oldData?.updatedAt;
    console.log("lastUpdatedAtDate", lastUpdatedAtDate);
    const orgDevices = await getCompanyAssetsForParticularSource(
      company.id,
      integrationsNames.MICROSOFT
    );
    for await (const device of orgDevices) {
        console.log("device.asset_sources[0]", device.asset_sources[0])
        const softwares = await microsoftDeviceSoftwaresModel
          .find({
            company_id: company.id,
            device_id: device.asset_sources[0].device_id,
          })
          .then((resp) => JSON.parse(JSON.stringify(resp)));
        console.log("softwares.length", softwares.length);
        // return false;
        if (softwares.length > 0) {
          await updateOrCreateMicrosoftSOftware(
            softwares,
            device.asset_sources[0].asset_id,
            company.id
          );
        }
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

};