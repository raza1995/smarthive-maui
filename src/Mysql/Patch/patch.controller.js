import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";
import patchSQLModel from "./patch.model";
import automoxPatchingReportModel from "../../mongo/models/Automox/automoxDataExtacts.model";
import { updateOrCreateAssetPatching } from "../AssetPatches/assetPatch.controller";
import assetSQLModel from "../Assets/assets.model";
import assetSoftwareSQLModel from "../AssetSoftwares/assetSoftware.model";
import { updateOrCreateAssetSoftware } from "../AssetSoftwares/assetSoftware.service";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import { errorHandler } from "../../utils/errorHandler";
import { updateOrCreatePatchCVEs } from "../PatchCVEs/PatchCVEs.service";
import { findOrCreateVendor } from "../Vendors/Vendors.service";

export const updateOrCreateSoftwarePatching = async (
  item,
  asset_id,
  company_id,
  device_id
) => {
  try {
    let software = await softwareSQLModel.findOne({
      where: { name: item.name },
      raw: true,
      nest: true,
    });
    if (!software?.id) {
      const vendor = await findOrCreateVendor(item.vendor_name || "unknown");
      software = await softwareSQLModel.create(
        {
          name: item.name,
          vendor_id: vendor.id,
          vendor_name: item.vendor_name || "unknown",
          is_uninstallable: item.is_uninstallable,
          software_packages: [{ ...item, version: null }],
        },
        { include: [{ model: softwarePackagesQLModel }] }
      );
    }

    const automoxAssetReport = await automoxPatchingReportModel.findOne({
      company_id,
      device_id,
      patch_name: item.display_name,
    });
    let osFamily = automoxAssetReport?.operating_system_family;
    if (!osFamily) {
      const asset = await assetSQLModel.findOne({
        where: { id: asset_id },
        include: [{ model: AssetPatchingInformationModel }],
        raw: true,
        nest: true,
      });
      osFamily = asset?.asset_patching_informations?.os_family;
      console.log("asset in patch osFamily", osFamily);
    }

    const assetSoftwareFind = await assetSoftwareSQLModel.findOne({
      where: { asset_id, software_id: software.id },
    });
    // // softwarePackagesQLModel.findOne({ where: { software_id: software.id}})
    if (!assetSoftwareFind) {
      await updateOrCreateAssetSoftware(
        { ...item, vendor_name: item?.vendor_name || "unknown", version: null },
        asset_id,
        company_id
      );
    } else {
      await updateOrCreateAssetSoftware(
        { ...item, vendor_name: item?.vendor_name || "unknown" },
        asset_id,
        company_id
      );
    }
    const assetSoftware = await assetSoftwareSQLModel.findOne({
      where: { asset_id, software_id: software.id },
    });
    const data = {
      package_id: assetSoftware?.package_id,
      software_id: software.id,
      patch_name: automoxAssetReport?.patch_name || [item?.display_name],
      os_family: osFamily,
      os_name: automoxAssetReport?.operating_system_name || item?.os_name,
      os_version:
        automoxAssetReport?.operating_system_version || item?.os_version,
      patch_available_timestamp:
        automoxAssetReport?.patch_available_timestamp || item?.create_time,
      patch_knowledge_base: automoxAssetReport?.patch_knowledge_base,
      patch_version: automoxAssetReport?.patch_version,
      requires_reboot:
        automoxAssetReport?.requires_reboot || item?.requires_reboot,
      severity: automoxAssetReport?.patch_severity || item?.severity,
    };
    const oldPatch = await patchSQLModel.findOne({
      where: {
        software_id: software.id,
        package_id: assetSoftware?.package_id,
        // patch_name: { [Op.like]: `%${data.patch_name}%` },
        // patch_name:data.patch_name
      },
    });
    let patch_id = 0;

    if (oldPatch) {
      // console.log('item', item);
      await patchSQLModel.update(data, {
        where: {
          id: oldPatch.id,
        },
      });
      patch_id = oldPatch.id;
    } else {
      if (asset_id === 3433) {
        console.log("itemdisplay_name else", item.display_name);
      }
      await patchSQLModel.create(data).then((res) => {
        patch_id = res.id;
      });
    }

    // create asset patch table entry
    await updateOrCreateAssetPatching(
      automoxAssetReport,
      asset_id,
      company_id,
      device_id,
      patch_id,
      software,
      item
    );
    await updateOrCreatePatchCVEs(automoxAssetReport?.cves, patch_id);
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const updateOrCreateMalwarePatching = async (
  item,
  asset_id,
  company_id,
  device_id
) => {
  try {
    const software = await softwareSQLModel.findOne({
      where: { name: item.name },
      raw: true,
      nest: true,
    });
    // if (!software?.id) {
    //   software = await softwareSQLModel.create(
    //     {
    //       name: item.name,
    //       is_uninstallable: item.is_uninstallable,
    //       software_packages: [{ ...item, version: null }],
    //     },
    //     { include: [{ model: softwarePackagesQLModel }] }
    //   );
    // }
    if (software) {
      const assetSoftware = await assetSoftwareSQLModel.findOne({
        where: { asset_id, software_id: software.id },
      });
      if (assetSoftware) {
        const data = {
          package_id: assetSoftware?.package_id,
          software_id: software.id,
          patch_name: item?.name,
          os_family: item?.os_family,
          os_name: item?.os_name,
          os_version: item?.os_version,
          patch_available_timestamp: item?.patch_available_timestamp,
          patch_knowledge_base: null,
          patch_version: item?.version,
          requires_reboot: item?.requires_reboot,
          severity: item?.severity,
        };

        const oldPatch = await patchSQLModel.findOne({
          where: {
            software_id: software.id,
            package_id: assetSoftware?.package_id,
          },
        });
        let patch_id = 0;

        if (oldPatch) {
          // console.log('item', item);
          await patchSQLModel.update(data, {
            where: {
              id: oldPatch.id,
            },
          });
          patch_id = oldPatch.id;
        } else {
          await patchSQLModel.create(data).then((res) => {
            patch_id = res.id;
          });
        }

        const packageCreate = await softwarePackagesQLModel.create({
          ...item,
          software_id: software.id,
        });

        // create asset patch table entry
        await updateOrCreateAssetPatching(
          {},
          asset_id,
          company_id,
          device_id,
          patch_id,
          software,
          item,
          packageCreate.id
        );
        await updateOrCreatePatchCVEs(item?.cves, patch_id);
      }
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
