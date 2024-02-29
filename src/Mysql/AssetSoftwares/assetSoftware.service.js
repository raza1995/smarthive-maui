import { Op } from "sequelize";
import { CliProgressBar } from "../../utils/cliProgressBar";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import { assetSoftwareUpdateActivity } from "../Logs/ActivitiesType/assetSoftwareActivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";
import { findOrCreateVendor } from "../Vendors/Vendors.service";
import assetSoftwareSQLModel from "./assetSoftware.model";

const createUpdateSoftware = async (
  asset_id,
  company_id,
  software_id,
  package_id,
  SoftwareName,
  software_number
) => {
  try {
    const assetSoftware = await assetSoftwareSQLModel.findOne({
      where: {
        asset_id,
        company_id,
        software_id,
        software_number,
      },
      include: [
        {
          model: softwarePackagesQLModel,
        },
      ],
    });
    const assetDetail = await assetSQLModel.findOne({
      where: { id: asset_id },
    });
    const data = {
      asset_id,
      company_id,
      software_id,
      package_id,
      software_number,
    };

    if (assetSoftware) {
      await assetSoftwareSQLModel.update(data, {
        where: {
          id: assetSoftware.id,
        },
      });
      const updateAssetSoftware = await assetSoftwareSQLModel.findOne({
        where: {
          id: assetSoftware.id,
          software_number,
        },
        include: [
          {
            model: softwarePackagesQLModel,
          },
        ],
      });
      const eventLogs = await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: `updated "${SoftwareName}" asset ${assetDetail.asset_name}`,
          user_id: null,
          company_id,
          asset_id,
        },
        assetSoftwareUpdateActivity.status.assetSoftwareUpdatedSuccessfully
          .code,
        createEventPayload(
          JSON.parse(JSON.stringify(updateAssetSoftware)),
          JSON.parse(JSON.stringify(assetSoftware)),
          assetSoftwareSQLModel.tableName
        )
      );
    } else {
      const softwareCreated = await assetSoftwareSQLModel.create(data);
      const newAssetSoftware = await assetSoftwareSQLModel.findOne({
        where: {
          id: softwareCreated.id,
        },
        include: [
          {
            model: softwareSQLModel,
          },
          {
            model: softwarePackagesQLModel,
          },
        ],
      });
      await addEventLog(
        {
          client_id: null,
          client_email: "system",
          process: `Add "${SoftwareName}" asset ${assetDetail.asset_name}`,
          user_id: null,
          company_id,
          asset_id,
        },
        assetSoftwareUpdateActivity.status.assetSoftwareUpdatedSuccessfully
          .code,
        createEventPayload(
          JSON.parse(JSON.stringify(newAssetSoftware)),
          {},
          assetSoftwareSQLModel.tableName
        )
      );
    }
  } catch (e) {
    errorHandler(e);
  }
};

export const updateOrCreateAssetSoftware = async (
  item,
  asset_id,
  company_id,
  software_number = 1
) => {
  try {
    const isSoftwareInstall = await softwareSQLModel.findOne({
      where: { name: item.name },
      raw: true,
      nest: true,
    });
    delete item.id;
    if (isSoftwareInstall) {
      const isPackageAvailable = await softwarePackagesQLModel.findOne({
        where: {
          software_id: isSoftwareInstall.id,
          version: item?.version || "N/A",
          os_name: item?.os_name,
          os_version: item?.os_version,
        },
      });
      if (isPackageAvailable) {
        await createUpdateSoftware(
          asset_id,
          company_id,
          isSoftwareInstall.id,
          isPackageAvailable.id,
          isSoftwareInstall?.name,
          software_number
        );
      } else {
        const packageCreate = await softwarePackagesQLModel.create({
          ...item,
          version: item?.version || "N/A",
          software_id: isSoftwareInstall.id,
        });
        await createUpdateSoftware(
          asset_id,
          company_id,
          isSoftwareInstall.id,
          packageCreate.dataValues.id,
          isSoftwareInstall?.name,
          software_number
        );
      }
    } else {

      const vendor = await findOrCreateVendor(
        item.vendor_name === '' || !item.vendor_name  ? "unknown" : item.vendor_name);
      const savedSoftware = await softwareSQLModel.create(
        {
          name: item.name,
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          is_uninstallable: item.is_uninstallable,
          software_packages: [{ ...item }],
        },
        { include: [{ model: softwarePackagesQLModel }] }
      );
      await createUpdateSoftware(
        asset_id,
        company_id,
        savedSoftware.id,
        savedSoftware.software_packages[0].dataValues.id,
        savedSoftware?.name,
        software_number
      );
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const getCvesOfSoftware = async (software_id) => {
  try {
    console.log('object');

  } catch (err) {
    errorHandler(err);
    return false;
  }
}
