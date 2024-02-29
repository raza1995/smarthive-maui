import { Op, QueryTypes } from "sequelize";
import HttpStatus from "http-status-codes";
import {
  integrationCategoryType,
  integrationsNames,
} from "../../utils/constants";
import { saveAssetLifecycleInfoFromAuvik } from "./AssetLifecycleIntegrationsServices/AuvikLifecycle.service";

export const createAssetLifecycleInfo = async (asset, source) => {
  switch (source.sources_type) {
    // case integrationsNames.MALWAREBYTES:
    //   await getAssetEndpointInfoFormMalwareBytes(asset, source);
    //   break;
    // case integrationsNames.MICROSOFT:
    //   await getAssetEndpointInfoFormMicrosoft(asset, source);
    //   break;
    // case integrationsNames.CROWDSTRIKE:
    //   await CrowdStrikeEndpointInfo(asset, source);
    //   break;
    // case integrationsNames.SENTINELONE:
    //   await SentinelOneEndpointInfo(asset, source);
    //   break;
    case integrationsNames.AUVIK:
      await saveAssetLifecycleInfoFromAuvik(asset, source);
      break;
    default:
    // code block
  }
};

