/* eslint-disable no-console */
import patchingtGroupsSQLModel from "./PatchingGroups/patchingGroups.model";
import assetPatchSQLModel from "./AssetPatches/assetPatch.model";
import patchingPoliciesSQLModel from "./PatchingPolicy/patchingPolicy.model";
import assetSQLModel from "./Assets/assets.model";
import AssetScoreLogsModel from "./AssetScoreLogs/assetScoreLogs.model";
import assetSoftwareSQLModel from "./AssetSoftwares/assetSoftware.model";
import assetSourcesModel from "./AssetSources/assetSources.model";
import companyModel from "./Companies/company.model";
import endpointEventModel from "./endpointEvent/endpointEvent.model";
import endpointJobsModel from "./EndPointJobs/endpointJobs.model";
import endpointDetectionsModel from "./EndpointsDetections/endpointsDetections.model";
import endpointQuarantineModel from "./EndpointsQuaratines/endpointQuarantines.model";
import endpointSuspiciousActivityModel from "./EndpointsSuspiciousActivity/endpointSuspiciousActivity.model";
import IntegrationModel from "./Integration/integration.model";
import invitationModel from "./Invitations/invitations.model";
import NotificationModel from "./Notification/notification.model";
import patchSQLModel from "./Patch/patch.model";
import softwarePackagesQLModel from "./SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "./Softwares/softwares.model";
import userModel from "./Users/users.model";
import GroupAssetsSQLModel from "./GroupsAssets/GroupsAsset.model";
import PolicyGroupsSQLModel from "./PolicyGroups/PolicyGroups.model";
import AssetEndpointInformationModel from "./AssetEndpointInformation/assetEndpointInformation.model";
import AssetPatchingInformationModel from "./AssetPatchingInformation/assetPatchingInformation.model";
import AssetDetailModel from "./AssetDetails/assetDetail.model";
import AssetScoreSQLModel from "./AssetScores/assetScore.model";
import assetRiskScoreImpactModel from "./AssetRiskScoreImpact/assetRiskScoreImpact.model";
import TagsModel from "./Tags/tags.model";
import AssetTagModel from "./AssetTags/assetTags.model";
import humanSourcesModel from "./HumanSource/humanSources.model";
import humanSQLModel from "./Human/human.model";
import ApplicationSQLModel from "./Applications/application.model";
import ApplicationAssetsSQLModel from "./ApplicationAssets/applicationAssets.model";
import ApplicationHumansSQLModel from "./ApplicationHumans/applicationHumans.model";
import ApplicationServicesSQLModel from "./ApplicationServices/applicationServices.model";
import ApplicationRiskScoreHistorySQLModel from "./ApplicationRiskScoreHistory/applicationRiskScoreHistory.model";
import rolesSQLModel from "./Roles/roles.model";
import permissionsSQLModel from "./Permissions/permissions.model";
import { permissionsSeeding } from "./Permissions/permissions.seed";
import userHasPermissionsSQLModel from "./UserHasPermissions/userHasPermissions.model";
import roleHasPermissionsSQLModel from "./RoleHasPermissions/roleHasPermissions.model";
import userRolesSQLModel from "./UserRoles/userRoles.model";
import secretsModel from "./secrets/secret.model";
import secretTagsModel from "./SecretTags/secretTags.model";
import UserSecretsModel from "./UserSecrets/UserSecrets.model";
import humanAssetsSQLModel from "./HumanAssets/humanAssets.model";
import humanRiskScoreModel from "./HumanRiskScores/humanRiskScore.model";
import humanRiskScoreHistoryModel from "./HumanRiskScoreHistory/humanRiskScoreHistory.model";
import userDetailsModel from "./Users/userDetail.model";
import companyDetailsModel from "./CompanyDetails/companyDetails.model";
import partnerCompanySQLModel from "./PartnerCompanies/partnerCompanies.model";
import assetsScoreWeightageModel from "./AssetsScoreManagements/assetsScoreWeightage/assetsScoreWeightage.model";
import assetsCustomWeightageScoreModel from "./AssetsScoreManagements/assetsCustomWeightageScore/assetsCustomWeightageScore.model";
import privilegeAccessScoreWeightageModel from "./PrivilegeAccessScoreManagements/privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";
import secretsCustomWeightageScoreModel from "./PrivilegeAccessScoreManagements/privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.model";
import ApplicationScoreWeightageModel from "./ApplicationScoreManagements/ApplicationScoreWeightage/ApplicationScoreWeightage.model";
import ApplicationCustomWeightageScoreModel from "./ApplicationScoreManagements/ApplicationCustomWeightageScore/ApplicationCustomWeightageScore.model";
import HumanScoreWeightageModel from "./HumanScoreManagements/HumanScoreWeightage/HumanScoreWeightage.model";
import HumanCustomWeightageScoreModel from "./HumanScoreManagements/HumanCustomWeightageScore/HumanCustomWeightageScore.model";
import companyScoreHistoryModel from "./CompanyScoreHistory/companyScoreHistory.model";
import { companySeed } from "./Companies/company.seed";
import AssetSecretsModel from "./AssetsSecrets/AssetsSecrets.model";
import riskCostFactorSQLModel from "./RiskCostFactor/riskCostFactor.model";
import riskCostFactorSelectedAssetsModel from "./RiskCostFactorSelectedAssets/riskCostFactorSelectedAssets.model";
import riskCostFactorSelectedTagsModel from "./RiskCostFactorSelectedTags/riskCostFactorSelectedTags.model";
import CVEsModel from "./Cves/Cves.model";
import PatchCVEsModel from "./PatchCVEs/PatchCVEs.model";
import CompaniesPeerScoreHistoryModel from "./CompaniesPeerScoreHistory/CompaniesPeerScoreHistory.model";
import CompaniesAverageScoreHistoryModel from "./CompaniesAverageScoreHistory/CompaniesAverageScoreHistory.model";
import privilegeAccessScoreWeightageTagsModel from "./PrivilegeAccessScoreManagements/privilegeAccessScoreWeightageTags/privilegeAccessScoreWeightageTags.model";
import SecretsTypesModel from "./SecretsTypes/SecretsTypes.model";
import { createSecretsTypes } from "./SecretsTypes/SecretsTypes.service";
import privilegeAccessScoreWeightageModelTypesModel from "./PrivilegeAccessScoreManagements/privilegeAccessScoreWeightageTypes/privilegeAccessScoreWeightageTypes.model";
import downtimeProbabilitySQLModel from "./DowntimeProbability/downtimeProbability.model";
import { DowntimeProbabilitySeed } from "./DowntimeProbability/DowntimeProbabilitySeed";
import VendorsModel from "./Vendors/Vendors.model";
import riskCostFactorAttributesModel from "./RiskCostFactorAttributes/riskCostFactorAttributes.model";
import { RiskCostFactorAttributesSeed } from "./RiskCostFactorAttributes/RiskCostFactorAttributesSeed";
import riskCostFactorOtherCostsModel from "./RiskCostFactorOtherCosts/riskCostFactorOtherCosts.model";
import riskToleranceSQLModel from "./RiskTolerance/riskTolerance.model";
import riskToleranceSelectedAssetsModel from "./RiskToleranceSelectedAssets/riskToleranceSelectedAssets.model";
import riskToleranceSelectedTagsModel from "./RiskToleranceSelectedTags/riskToleranceSelectedTags.model";
import riskToleranceSettingsModel from "./RiskToleranceSettings/riskToleranceSettings.model";
import AssetLifecycleInformationModel from "./AssetLifecycleInformation/assetLifecycleInformation.model";
import IntegrationBaseUrlsModel from "./IntegrationBaseUrls/IntegrationBaseUrls.model";
import { integrationUrlsSeeding } from "./IntegrationBaseUrls/IntegrationBaseUrls.service";
import AssetBackupInformationModel from "./AssetBackupInformation/assetBackupInformation.model";

const syncDb = async (options) => {
  await companyModel
    .sync(options)
    .then(() => {
      console.log("company model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await userModel
    .sync(options)
    .then(() => {
      console.log("user model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await userDetailsModel
    .sync(options)
    .then(() => {
      console.log("user details model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await companyDetailsModel
    .sync(options)
    .then(() => {
      console.log("company details model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await invitationModel
    .sync(options)
    .then(() => {
      console.log("invitation model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await NotificationModel.sync(options)
    .then(() => {
      console.log("notification model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await IntegrationBaseUrlsModel.sync(options)
    .then(async () => {
      await integrationUrlsSeeding();
      console.log("integration base Url model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await IntegrationModel.sync(options)
    .then(() => {
      console.log("integration model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await assetSQLModel
    .sync(options)
    .then(() => {
      console.log("asset model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await assetSourcesModel
    .sync(options)
    .then(() => {
      console.log("asset source model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await AssetEndpointInformationModel.sync(options)
    .then(() => {
      console.log("asset endpoint information table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await AssetPatchingInformationModel.sync(options)
    .then(() => {
      console.log("asset patching information table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await AssetDetailModel.sync(options)
    .then(() => {
      console.log("asset detail table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await AssetScoreLogsModel.sync(options)
    .then(() => {
      console.log("asset score log model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await assetRiskScoreImpactModel
    .sync(options)
    .then(() => {
      console.log("asset Risk Score Impact table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await VendorsModel.sync(options)
    .then(() => {
      console.log("Vendors table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await softwareSQLModel
    .sync(options)
    .then(() => {
      console.log("Software table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await softwarePackagesQLModel
    .sync(options)
    .then(() => {
      console.log("Software Package table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await patchingPoliciesSQLModel
    .sync(options)
    .then(() => {
      console.log("Patching Policies table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await assetSoftwareSQLModel
    .sync(options)
    .then(() => {
      console.log("Asset Software table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await patchSQLModel
    .sync(options)
    .then(() => {
      console.log("Patch SQL table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await assetPatchSQLModel
    .sync(options)
    .then(() => {
      console.log("Asset Patch SQL table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await AssetScoreSQLModel.sync(options)
    .then(() => {
      console.log("asset score model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  // await assetGroupsSQLModel.sync(options).then(() => {
  //   console.log("Asset Groups table created");
  // }).catch(err => {
  //   console.log(err.parent);
  // });

  await endpointDetectionsModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Detections table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await patchingtGroupsSQLModel
    .sync(options)
    .then(() => {
      console.log("Patching Groups table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointEventModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Event table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await GroupAssetsSQLModel.sync(options)
    .then(() => {
      console.log("Groups Assets table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointDetectionsModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Detections table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointSuspiciousActivityModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Suspicious Activity table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointEventModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Event table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointJobsModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Jobs table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await endpointQuarantineModel
    .sync(options)
    .then(() => {
      console.log("Endpoint Quarantine table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await humanSQLModel
    .sync(options)
    .then(() => {
      console.log("Humans table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await humanSourcesModel
    .sync(options)
    .then(() => {
      console.log("Humans source modal created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await PolicyGroupsSQLModel.sync(options)
    .then(() => {
      console.log("Policy Groups table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await TagsModel.sync(options)
    .then(() => {
      console.log("Tag table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await AssetTagModel.sync(options)
    .then(() => {
      console.log("Assets tag table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await ApplicationSQLModel.sync(options)
    .then(() => {
      console.log("Applications table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await ApplicationAssetsSQLModel.sync(options)
    .then(() => {
      console.log("Application Assets table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await ApplicationHumansSQLModel.sync(options)
    .then(() => {
      console.log("Application Humans table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await ApplicationServicesSQLModel.sync(options)
    .then(() => {
      console.log("Application Services table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await ApplicationRiskScoreHistorySQLModel.sync(options)
    .then(() => {
      console.log("Application Risk Score History table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await rolesSQLModel
    .sync(options)
    .then(() => {
      console.log("Roles table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await permissionsSQLModel
    .sync(options)
    .then(async () => {
      console.log("permissions table created");
      // if(!options?.alter){
      // await companySeed();
      // return permissionsSeeding();
      // }
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await userHasPermissionsSQLModel
    .sync(options)
    .then(() => {
      console.log("user has permissions table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await roleHasPermissionsSQLModel
    .sync(options)
    .then(() => {
      console.log("role has permissions table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await userRolesSQLModel
    .sync(options)
    .then(async () => {
      console.log("user roles table created");
      await companySeed();
      return permissionsSeeding();
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await secretsModel
    .sync(options)
    .then(() => {
      console.log("secret table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await UserSecretsModel.sync(options)
    .then(() => {
      console.log("user secret table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await secretTagsModel
    .sync(options)
    .then(() => {
      console.log("Secret tag table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await humanAssetsSQLModel
    .sync(options)
    .then(() => {
      console.log("human assets table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await humanRiskScoreModel
    .sync(options)
    .then(() => {
      console.log("human risk score table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await humanRiskScoreHistoryModel
    .sync(options)
    .then(() => {
      console.log("human risk score history table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await partnerCompanySQLModel
    .sync(options)
    .then(() => {
      console.log("partner company table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  // assets score management
  await assetsScoreWeightageModel
    .sync(options)
    .then(() => {
      console.log("assetsScoreWeightage table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await assetsCustomWeightageScoreModel
    .sync(options)
    .then(() => {
      console.log("assets custom weightage score table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  // privilege access score management
  await privilegeAccessScoreWeightageModel
    .sync(options)
    .then(() => {
      console.log("Privilege Access Score Weightage table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await SecretsTypesModel.sync(options)
    .then(() => {
      console.log("Secrets type table created");
      createSecretsTypes();
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await secretsCustomWeightageScoreModel
    .sync(options)
    .then(() => {
      console.log("secrets custom weightage score table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await privilegeAccessScoreWeightageTagsModel
    .sync(options)
    .then(() => {
      console.log("Privilege Access Score Weightage tags table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await privilegeAccessScoreWeightageModelTypesModel
    .sync(options)
    .then(() => {
      console.log("Privilege Access Score Weightage type table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await AssetSecretsModel.sync(options)
    .then(() => {
      console.log("assets secrets table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await companyScoreHistoryModel
    .sync(options)
    .then(() => {
      console.log("company score history table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await CompaniesPeerScoreHistoryModel.sync(options)
    .then(() => {
      console.log("companies peer score history table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await CompaniesAverageScoreHistoryModel.sync(options)
    .then(() => {
      console.log("companies average score history table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  // Applications score management
  await ApplicationScoreWeightageModel.sync(options)
    .then(() => {
      console.log("Applications  Score Weightage table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await ApplicationCustomWeightageScoreModel.sync(options)
    .then(() => {
      console.log("Applications  custom weightage score table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  // Human score management
  await HumanScoreWeightageModel.sync(options)
    .then(() => {
      console.log("Humans Score Weightage table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await HumanCustomWeightageScoreModel.sync(options)
    .then(() => {
      console.log("Humans custom weightage score table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  // cves table

  await CVEsModel.sync(options)
    .then(() => {
      console.log("CVEs table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
  await PatchCVEsModel.sync(options)
    .then(() => {
      console.log("Patch CVES table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskCostFactorSQLModel
    .sync(options)
    .then(() => {
      console.log("risk cost factor model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskCostFactorSelectedAssetsModel
    .sync(options)
    .then(() => {
      console.log("risk cost factor selected assets model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskCostFactorSelectedTagsModel
    .sync(options)
    .then(() => {
      console.log("risk cost factor selected tags model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskCostFactorAttributesModel
    .sync(options)
    .then(() => {
      console.log("risk cost factor attributes model created");
      // return RiskCostFactorAttributesSeed();
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskCostFactorOtherCostsModel
    .sync(options)
    .then(() => {
      console.log("risk cost factor other costs model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await downtimeProbabilitySQLModel
    .sync(options)
    .then(() => {
      console.log("downtime probability model created");
      // return DowntimeProbabilitySeed();
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskToleranceSQLModel
    .sync(options)
    .then(() => {
      console.log("risk tolerance model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskToleranceSelectedAssetsModel
    .sync(options)
    .then(() => {
      console.log("risk tolerance selected assets model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskToleranceSelectedTagsModel
    .sync(options)
    .then(() => {
      console.log("risk tolerance selected tags model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await riskToleranceSettingsModel
    .sync(options)
    .then(() => {
      console.log("risk tolerance settings model created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await AssetLifecycleInformationModel.sync(options)
    .then(() => {
      console.log("asset lifecycle information table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });

  await AssetBackupInformationModel.sync(options)
    .then(() => {
      console.log("asset backup information table created");
    })
    .catch((err) => {
      console.log(err.parent);
    });
};
export default syncDb;
