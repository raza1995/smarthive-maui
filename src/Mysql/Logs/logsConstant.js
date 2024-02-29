import assetsActivities from "./ActivitiesType/assetsactivities";
import assetsInfoActivities from "./ActivitiesType/assetsInfoActivities";
import assetSoftwareActivities from "./ActivitiesType/assetSoftwareActivities";
import assetsScoreActivities from "./ActivitiesType/assetsScoreActivities";
import automoxActivities from "./ActivitiesType/automoxActivities";
import auvikActivities from "./ActivitiesType/auvikActivities";
import policyActivity from "./ActivitiesType/policyActivityType";
import EndpointActivity from "./ActivitiesType/EndpointActivityType";
import AssetPatchingInformationActivity from "./ActivitiesType/AssetPatchingInformationActivityType";
import assetsScoreImpactActivities from "./ActivitiesType/assetsScoreImpactActivities";
import integrationActivity from "./ActivitiesType/integrationActivity";
import userActivities from "./ActivitiesType/userActivities";
import authActivities from "./ActivitiesType/authActivities";
import LifecycleActivityCategory from "./ActivitiesType/LifecycleActivity";
import RealtimeActivityCategory from "./ActivitiesType/RealtimeActivity";
import BackupActivityCategory from "./ActivitiesType/BackupActivity";
import SecretsActivityCategory from "./ActivitiesType/SecretsActivityType";
import ApplicationActivityCategory from "./ActivitiesType/ApplicationActivites";
import MicrosoftActivityCategory from "./ActivitiesType/MicrosoftActivities";
import Knowb4ActivityCategory from "./ActivitiesType/Knowb4Activities";
import HumanActivityCategory from "./ActivitiesType/humanActivities";
import CostFactorActivities from "./ActivitiesType/RiskCostFactorActivities";
import DowntimeProbabilityActivities from "./ActivitiesType/DowntimeProbabilityActivities";
import RiskToleranceActivities from "./ActivitiesType/RiskToleranceActivities";

export const PatchingActivity = {
  label: "Patching activities",
  code: 6000,
  activities: {
    ...AssetPatchingInformationActivity,
  },
};
export const EndpointActivityCategory = {
  label: "Endpoint activities",
  code: 5000,
  activities: {
    ...EndpointActivity,
  },
};
export const activitiesData = {
  AuthenticationActivity: {
    label: "Authentication activities",
    code: 1000,
    activities: authActivities,
  },
  UserActivity: {
    label: "User activities",
    code: 2000,
    activities: {
      ...userActivities,
      ...integrationActivity,
    },
  },
  AuditActivity: {
    label: "Audit activities",
    code: 3000,
    activities: {
      ...assetsActivities,
      ...policyActivity,
      ...assetsScoreActivities,
      ...assetsInfoActivities,
      ...assetSoftwareActivities,
      ...assetsScoreImpactActivities,
    },
  },
  cronActivity: {
    label: "Cron activities",
    code: 4000,
    activities: {
      ...auvikActivities,
      ...automoxActivities,
    },
  },
  EndpointActivity: EndpointActivityCategory,
  PatchingActivity,
  LifecycleActivityCategory,
  RealtimeActivityCategory,
  BackupActivityCategory,
  ApplicationActivityCategory,
  SecretsActivityCategory,
  MicrosoftActivityCategory,
  Knowb4ActivityCategory,
  HumanActivityCategory,
  CostFactorActivities,
  DowntimeProbabilityActivities,
  RiskToleranceActivities,
};
