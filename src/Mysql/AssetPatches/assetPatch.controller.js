import assetPatchSQLModel from "./assetPatch.model";
import assetSoftwareSQLModel from "../AssetSoftwares/assetSoftware.model";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import { errorHandler } from "../../utils/errorHandler";

export const updateOrCreateAssetPatching = async (
  automoxAssetReport,
  asset_id,
  company_id,
  device_id,
  patch_id,
  software,
  item,
  packageId = null
) => {
  try {
    let assetSoftware = await assetSoftwareSQLModel.findOne({
      where: {
        software_id: software.id,
        asset_id,
      },
      raw: true,
      nest: true,
    });

    if (!assetSoftware?.id) {
      console.log("new ASSet software created for", software.name);
      let package_id = software?.software_packages?.[0]?.dataValues.id;
      if (!package_id) {
        delete item.id;
        const softwarePackages = await softwarePackagesQLModel.create({
          ...item,
          version: null,
          software_id: software.id,
        });
        package_id = softwarePackages.id;
      }
      assetSoftware = await assetSoftwareSQLModel.create({
        asset_id,
        company_id,
        software_id: software.id,
        package_id,
      });
    }
    if (assetSoftware) {
      const data = {
        patch_id,
        asset_id,
        company_id,
        software_id: software.id,
        package_id: assetSoftware?.package_id,
        severity: automoxAssetReport?.patch_severity || item?.severity,
      };

      const oldPatch = await assetPatchSQLModel.findOne({
        where: {
          patch_id,
          // asset_id: asset_id,
          company_id,
          // software_id: software.id,
          // package_id: assetSoftware?.package_id
        },
      });

      if(packageId !== null) {
        data.package_id = packageId;
      }

      if (oldPatch) {
        await assetPatchSQLModel.update(data, {
          where: {
            id: oldPatch.id,
          },
        });
        patch_id = oldPatch.id;
      } else {
        await assetPatchSQLModel.create(data).then((res) => {
          patch_id = res.id;
        });
      }
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
