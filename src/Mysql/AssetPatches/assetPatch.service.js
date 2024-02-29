import { Op } from "sequelize";
import { issueAJobMalwarebyte } from "../../api/malwareBytes";
import {
  integrationCategoryType,
  integrationsNames,
} from "../../utils/constants";
import AssetEndpointInformationModel from "../AssetEndpointInformation/assetEndpointInformation.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";
import assetSQLModel from "../Assets/assets.model";
import assetSourcesModel from "../AssetSources/assetSources.model";
import AssetTagModel from "../AssetTags/assetTags.model";
import GroupAssetsSQLModel from "../GroupsAssets/GroupsAsset.model";
import IntegrationModel from "../Integration/integration.model";
import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import PolicyGroupsSQLModel from "../PolicyGroups/PolicyGroups.model";
import TagsModel from "../Tags/tags.model";
import assetPatchSQLModel from "./assetPatch.model";
import { getMalwareBytesAccessToken } from "../../mongo/services/MalwareBytes/malwareByteServices";
import { issueAutomoxDeviceCommand } from "../../api/automox";
import { PatchedJobAssignActivity } from "../Logs/ActivitiesType/AssetPatchingInformationActivityType";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import IntegrationBaseUrlsModel from "../IntegrationBaseUrls/IntegrationBaseUrls.model";

export const getPolicyDevices = async (policyId) => {
  const policyData = await patchingPoliciesSQLModel.findOne({
    where: {
      id: policyId,
    },
    raw: true,
    nest: true,
  });
  if (
    (policyData?.configuration?.device_filters_enabled &&
      policyData?.configuration?.device_filters.length > 0) ||
    policyData?.server_groups?.length > 0
  ) {
    const tagsObj = {
      required: false,
      filter: {
        company_id: policyData.company_id,
      },
    };
    const assetObj = {
      required: true,
      filter: {
        company_id: policyData.company_id,
      },
    };
    const assetPatchingObj = {
      required: true,
      filter: {},
    };

    const patchingGroupId = await PolicyGroupsSQLModel.findAll({
      where: {
        patching_policy_id: policyData.id,
        company_id: policyData.company_id,
      },
      attributes: ["patching_group_id"],
    }).then((groups) => groups.map((group) => group.patching_group_id));
    const patchingGroupObjRequired = patchingGroupId.length > 0;
    policyData?.configuration?.device_filters?.forEach(async (filter) => {
      const valueArray = filter.value;
      const filterOption = filter?.op;
      if (filter?.field === "tag") {
        const label = {};
        if (filterOption === "in") {
          label[Op.in] = valueArray?.map((item) => item.label) || [];
        } else if (filterOption === "not_in") {
          label[Op.notIn] = valueArray?.map((item) => item.label) || [];
        }
        tagsObj.filter.label = label;
        tagsObj.required = true;
      } else if (filter?.field === "ip_addr") {
        if (filterOption === "in") {
          assetObj.ipaddress[Op.in] = [valueArray];
        } else if (filterOption === "not_in") {
          assetObj.ipaddress[Op.notIn] = [valueArray];
        }
      } else if (filter?.field === "hostname") {
        if (filterOption === "in") {
          assetObj.asset_name[Op.in] = [valueArray];
        } else if (filterOption === "not_in") {
          assetObj.asset_name[Op.notIn] = [valueArray];
        }
      } else if (filter?.field === "os_family") {
        if (filterOption === "in") {
          assetPatchingObj.os_family[Op.in] = [valueArray];
        } else if (filterOption === "not_in") {
          assetPatchingObj.os_family[Op.notIn] = [valueArray];
        }
        assetPatchingObj.required = true;
      } else if (filter?.field === "os_version_id") {
        if (filterOption === "in") {
          assetPatchingObj.os_family[Op.in] = [valueArray];
        } else if (filterOption === "not_in") {
          assetPatchingObj.os_family[Op.notIn] = [valueArray];
        }
        assetPatchingObj.required = true;
      }
    });
    const assets = await assetSQLModel.findAll({
      where: assetObj.filter,
      include: [
        {
          model: AssetPatchingInformationModel,
          where: assetPatchingObj.filter,
          required: assetPatchingObj.required,
        },
        {
          model: AssetTagModel,
          include: [
            {
              model: TagsModel,
              where: tagsObj.filter,
              required: tagsObj.required,
              attributes: [],
            },
          ],
          required: tagsObj.required,
          attributes: [],
        },
        {
          model: GroupAssetsSQLModel,
          where: { patching_group_id: { [Op.in]: patchingGroupId } },
          required: patchingGroupObjRequired,
          attributes: [],
        },
      ],
    });
    return assets;
  }
  return [];
};

const updateAssetPatch = async (assetId, patches, company_id) => {
  const patchIds = patches?.map((item) => item?.software_package?.patch?.id);
  console.log(
    "assetId",
    assetId,
    "patchIds",
    patchIds,
    "company_id",
    company_id
  );
  await assetPatchSQLModel.update(
    { applied: true },
    {
      where: {
        asset_id: assetId,
        company_id,
        patch_id: { [Op.in]: patchIds },
      },
    }
  );
  return true;
};

const issueMalwareBytePatchService = async (
  patches,
  assetId,
  assetSource,
  client
) => {
  const payload = [];
  patches.forEach(async (item) => {
    const patch = {};
    patch.application_name = item?.software?.name;
    patch.current_version = item?.software_package?.version;
    patch.new_version = item?.software_package?.patch?.patch_version;
    patch.product = item?.software?.name;
    // patch.vendor = item?.software?.vendor_name
    //   patch.architecture = item.
    //   patch.language = item.
    payload.push(patch);
  });
  const endpointInfo = await AssetEndpointInformationModel.findOne({
    where: {
      asset_id: assetId,
    },
  });
  const client_secret =
    assetSource?.integration?.integration_values?.client_secret;
  const client_id = assetSource?.integration?.integration_values?.client_id;
  const baseURL = assetSource.integrations?.integrations_base_url?.base_url;
  const AccessData = await getMalwareBytesAccessToken(
    client_id,
    client_secret,
    baseURL,
    "execute"
  );
  if (AccessData.status === 200) {
    const link = assetSource?.device_id.split("/");
    const deviceId = link[link.length - 1];

    const mainPayload = {
      machine_ids: [deviceId],
      command: "command.asset.updatesoftware",
      data: {
        patches: payload,
      },
    };
    await issueAJobMalwarebyte(
      baseURL,
      AccessData.data.access_token,
      endpointInfo.account_id,
      mainPayload
    )
      .catch((error) => {
        console.log("errore", error);
      })
      .then(async (response) => {
        console.log("response", response);
        payload.forEach(async (item) => {
          await addEventLog(
            {
              id: client?.client_id,
              email: client?.client_email,
              ipAddress: client.ipAddress,
              process: `Job assign for  ${item.application_name} software patch`,
              user_id: null,
              company_id: client.company_id,
              asset_id: assetId,
              isSystemLog: client?.isSystemLog,
            },
            PatchedJobAssignActivity.status.PatchedJobAssignSuccessfully.code,
            null
          );
        });
        await updateAssetPatch(assetId, patches, client?.company_id);
      });
  }
  //   console.log("AccessData", AccessData.data.errors)
};

const issueAutomoxPatchService = async (
  patches,
  assetId,
  assetSource,
  client
) => {
  for await (const patch of patches) {
    await issueAutomoxDeviceCommand(
      assetSource.device_id,
      assetSource.integration.integration_values.organization_id,
      {
        command_type_name: "InstallUpdate",
        args: patch.software?.name,
      }
    );
    await addEventLog(
      {
        client_id: client?.client_id,
        client_email: client?.client_email,
        process: `Job assign for  ${patch.software?.name} software patch`,
        user_id: null,
        company_id: client?.company_id,
        asset_id: assetId,
        isSystemLog: client?.isSystemLog,
      },
      PatchedJobAssignActivity.status.PatchedJobAssignSuccessfully.code,
      null
    );
  }

  await updateAssetPatch(assetId, patches, client?.company_id);
};

export const applyPatchesByAssetId = async (assetId, patches = [], client) => {
  const assetSource = await assetSourcesModel.findOne({
    where: {
      asset_id: assetId,
    },
    include: [
      {
        model: IntegrationModel,
        where: {
          integration_category_type: integrationCategoryType.patching,
        },
        include: [IntegrationBaseUrlsModel],
        required: true,
      },
    ],
    raw: true,
    nest: true,
  });

  //   console.log("assetSource", assetSource)
  console.log(
    "assetSource?.integration?.integration_name",
    assetId,
    assetSource?.integration?.integration_name
  );

  if (assetSource) {
    if (
      assetSource?.integration?.integration_name ===
      integrationsNames.MALWAREBYTES
    ) {
      await issueMalwareBytePatchService(patches, assetId, assetSource, client);
    } else if (
      assetSource?.integration?.integration_name === integrationsNames.AUTOMOX
    ) {
      issueAutomoxPatchService(patches, assetId, assetSource, client);
    }
  }
};
