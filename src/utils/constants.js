import {
  assetCreateActivity,
  getAssetActivity,
} from "../Mysql/Logs/ActivitiesType/assetsactivities";
import {
  getResilenceDashboard,
  getSoftwares,
  getUserActivity,
  getUserInvitationActivity,
  getAssetDetail,
} from "../Mysql/Logs/ActivitiesType/userActivities";
import {
  getAutomoxDeviceReportsActivity,
  getAutomoxDeviceSoftwareActivity,
  getAutomoxDeviceActivity,
  getAutomoxDevicePoliciesActivity,
} from "../Mysql/Logs/ActivitiesType/automoxActivities";
import {
  getAuvikDeviceActivity,
  getAuvikDeviceDetailsActivity,
  getAuvikDeviceLifeCycleActivity,
  getAuvikDeviceWarrantyActivity,
} from "../Mysql/Logs/ActivitiesType/auvikActivities";
import { getAssetsbyTag } from "../Mysql/Logs/ActivitiesType/RiskCostFactorActivities";
import { getAssetInfoActivity } from "../Mysql/Logs/ActivitiesType/assetsInfoActivities";
import { getAssetSoftwareActivity } from "../Mysql/Logs/ActivitiesType/assetSoftwareActivities";
import { downtimeProbabilityListing } from "../Mysql/Logs/ActivitiesType/DowntimeProbabilityActivities";
import { endPointOverview, GetEndpointAsset } from "../Mysql/Logs/ActivitiesType/EndpointActivityType";

const qs = require("qs");
require("dotenv").config();

export const sentinelOneApiEndpoint = "https://usea1-pax8-exsp.sentinelone.net";
export const endPoints = "https://auvikapi.us1.my.auvik.com/v1/";
export const malwareBytesEndPoints = "https://api.malwarebytes.com/oneview";
export const crowdStrikeEndpoints = "https://api.us-2.crowdstrike.com";
export const knowBe4ApiBaseUrl = "https://us.api.knowbe4.com/v1";
export const microsoftBaseUrl = "https://graph.microsoft.com/v1.0/";
export const microsoftBetaBaseUrl = "https://graph.microsoft.com/beta/";
export const microsoftAccessTokenBaseUrl = "https://login.microsoftonline.com/";
export const druvaApiBaseUrl = "https://apis-us0.druva.com/token";
export const auvikId = "624d657a9a01e46d1699fa07";
export const riskCostBaseUrl = process.env.RISK_COST_API_URL;

export const secretUserRoles = {
  Admin: "Admin",
  Viewer: "viewer",
};
export const integrationsNames = {
  AUVIK: "auvik",
  MALWAREBYTES: "malwareBytes",
  AUTOMOX: "automox",
  CROWDSTRIKE: "crowdStrike",
  SENTINELONE: "sentinelOne",
  KNOWBE4: "knowbe4",
  MICROSOFT: "microsoft",
  DRUVA: "druva",
};

export const severitiesTypes = {
  high: "High",
  low: "Low",
  medium: "Medium",
};

export const humansRiskTypes = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const nonNetworkSubTypes =  [
  "server",
  "Server",
  "workstation",
  "Workstation",
  "storage",
  "virtualMachine",
  "laptop"
]
export const humanRiskWeightages = {
  security_awareness: 20,
  pishing: 20,
  asset: 30,
  mfa: 30,
};

export const applicationRiskWeightages = {
  human: 40,
  asset: 60,
};

export const scoreTitles = {
  lifecycle_score: "Lifecycle Score",
  endpoint_score: "Endpoint Score",
  backup_score: "Backup Score",
  patching_score: "Patching Score",
  real_time_score: "Real Time Score",
  risk_score: "Risk Score",
};
export const assetType = {
  network: "network",
  nonNetwork: "non-network",
  unknown: "unknown",
};
export const malwareByteApiUrls = {
  users: "v1/users",
  endPoints: "v1/endpoints",
  sites: "v1/sites",
  detections: "v1/detections",
  jobs: "v1/jobs/search",
  groups: "v1/accounts",
  policies: "v1/policies",
  osPatches: "v1/os-patches",
  cve: "v1/cve",
};

export const automoxApiUrls = {
  zones: "/accounts",
};

export const integrationCategoryType = {
  backup: "Backup",
  discovery: "Discovery",
  patching: "Patching",
  endpoint: "Endpoint",
  lifecycle: "Lifecycle",
};
export const inventory = {
  DEVICE: "inventory/device/",
  NETWORK: "inventory/network/",
  INTERFACE: "inventory/interface/",
  COMPONENT: "inventory/component/",
  ENTITY: "inventory/entity/",
  CONFIGURATION: "inventory/configuration/",
};
export const integrationsIds = {
  auvik: "624d657a9a01e46d1699fa07",
  malwareByte: "619f87409021a677fc20cfab",
  automox: "6253d20fbde7683d5f2e9f22",
};

export const automoxCredentials = {
  account_id: process.env.AUTOMOX_ACCOUNT_ID,
  api_key: process.env.AUTOMOX_API_KEY,
};
export const userRole = {
  CUSTOMER_ADMIN: "customer_admin",
  SUPER_ADMIN: "super_admin",
  CUSTOMER_EDITOR: "customer_editor",
  CUSTOMER_VIEWER: "customer_viewer",
};
export const alert = {
  HISTORY: "alert/history/",
  DISMISS: "alert/dismiss/",
};

export const other = {
  VERIFY: "authentication/verify/",
};

export const tenant = {
  TENANTS: "tenants",
  DETAILS: "tenants/detail",
};

export const auth = {
  LOGIN: "auth/login/",
};

export const riskCostApiUrls = {
  toleranceScore: "/tolerance_score",
  financialLoss: "/financial_loss",
};

export const authOptions = (username, password) => {
  const data = qs.stringify({
    grant_type: "password",
    username, // "test@mailinator.com",
    password, // "P@ssword1",
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE,
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
  });
  const options = {
    method: "post",
    url: process.env.AUTH0_TOKEN_URL,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };

  return options;
};

export const passwordSignUp = (signUpDetails) => {
  const data = {
    client_id: process.env.AUTH0_CLIENT_ID,
    email: signUpDetails.email,
    password: signUpDetails.password,
    connection: "Username-Password-Authentication",
    given_name: signUpDetails.firstName,
    family_name: signUpDetails.lastName,
    name: `${signUpDetails.firstName} ${signUpDetails.lastName}`,
    nickname: signUpDetails.firstName,
    user_metadata: {
      companyName: signUpDetails.companyName,
      industry: signUpDetails.industry,
    },
  };
  return {
    url: process.env.AUTH0_SIGNUP_URL,
    method: "post",
    data,
  };
};

export const passwordLessSignup = (signUpDetails) => {
  const data = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    connection: "email",
    email: signUpDetails.email,
    send: "link",
    authParams: {
      scope: "openid email profile",
    },
  };

  return {
    url: process.env.AUTH0_PASSWORDLESS_SIGNUP_START_URL,
    method: "post",
    data,
  };
};
export const secretsTypes = ["Server", "Database", "Firewall", "Router"];
export const getTokenWithOTP = (request) => {
  const data = {
    grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    otp: request.otp,
    realm: "email",
    username: request.email,
    scope: "openid",
  };

  return {
    url: process.env.AUTH0_PASSWORDLESS_TOKEN_URL,
    method: "post",
    data,
  };
};

export const generateManagementToken = () => {
  const data = {
    grant_type: "client_credentials",
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_MANAGEMENT_AUDIENCE,
  };
  return {
    url: process.env.AUTH0_TOKEN_URL,
    method: "post",
    data,
  };
};
export const roles = {
  SuperAdmin: "super_admin",
  CustomerAdmin: "customer_admin",
  CustomerAuditor: "customer_auditor",
  CustomerAnalyst: "customer_analyst",
  CustomerEditor: "customer_editor",
  CustomerViewer: "customer_viewer",
  Partner: "partner",
  Admin: "admin",
};
export const NotificationType = {
  acceptUser: "ACCEPT_USER",
  secretsShared: "SECRETS_SHARED",
};

export const superAdminId1 = "99999999-9999-9999-9999-999999999999";
export const superAdminId2 = "88888888-8888-8888-8888-888888888888";

export const restrictedActivityCodes = [
  getAssetActivity.status.assetGetSuccessfully.code,
  getAssetDetail.status.assetGetSuccessfully.code,
  getAssetInfoActivity.status.assetInfoGetSuccessfully.code,
  getAssetsbyTag.status.getAssetsByTagSuccessfully.code,
  getAssetSoftwareActivity.status.assetSoftwareGetSuccessfully.code,
  getSoftwares.status.softwareGetSuccessfully.code,
  getAutomoxDeviceActivity.status.getAutomoxDeviceSuccessfully.code,
  getAutomoxDeviceReportsActivity.status.getAutomoxDeviceReportsSuccessfully
    .code,
  getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareSuccessfully
    .code,
  getAutomoxDeviceActivity.status.getAutomoxDeviceSuccessfully.code,
  getAutomoxDevicePoliciesActivity.status.getAutomoxDevicePoliciesSuccessfully
    .status,
  getAuvikDeviceActivity.status.getAuvikDeviceSuccessfully.code,
  getAuvikDeviceDetailsActivity.status.getAuvikDeviceDetailsSuccessfully.code,
  getAuvikDeviceLifeCycleActivity.status.getAuvikDeviceLifeCycleSuccessfully
    .code,
  getAuvikDeviceWarrantyActivity.status.getAuvikDeviceLifeCycleSuccessfully
    .code,
  downtimeProbabilityListing.status.downtimeProbabilityListingSuccessfully.code,
  GetEndpointAsset.status.getEndpointAssetSuccess.code,
  endPointOverview.status.getEndpointOverviewSuccess.code,
  assetCreateActivity.status.assetCreatedSuccessfully.code,
  getResilenceDashboard.status.resilenceDashboardGetSuccessfully.code,
  getUserActivity.status.userGetSuccessfully.code,
  getUserInvitationActivity.status.getUserInvitationSuccessfully.code,
];

// eslint-disable-next-line consistent-return
export const NotificationMessage = (user, messageType) => {
  // eslint-disable-next-line default-case
  switch (messageType) {
    case NotificationType.acceptUser:
      return {
        heading: "New user registered",
        message: `${user.full_name} is registered in your company. Please review his account.`,
      };
    case NotificationType.secretsShared:
      return {
        heading: "New secrets shared",
        message: `${user.full_name} has shares secrets with you.`,
      };
  }
};
export const NotificationRedirectLink = {
  [NotificationType.acceptUser]: "/profile",
};

export const welcomeEmailTemplate = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style type="text/css">.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td,img{line-height:100%}#outlook a{padding:0}.ExternalClass,.ReadMsgBody{width:100%}a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic;border:0;height:auto;outline:0;text-decoration:none}table{border-collapse:collapse!important}#bodyCell,#bodyTable,body{height:100%!important;margin:0;padding:0;font-family:ProximaNova,sans-serif}#bodyCell{padding:20px}#bodyTable{width:600px}@font-face{font-family:ProximaNova;src:url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot);src:url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot?#iefix) format('embedded-opentype'),url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.woff) format('woff');font-weight:400;font-style:normal}@font-face{font-family:ProximaNova;src:url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.eot);src:url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.eot?#iefix) format('embedded-opentype'),url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.woff) format('woff');font-weight:600;font-style:normal}@media only screen and (max-width:480px){#bodyTable,body{width:100%!important}a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:none!important}body{min-width:100%!important}#bodyTable{max-width:600px!important}#signIn{max-width:280px!important}}
</style>
  </head>
  <body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;font-family: &quot;ProximaNova&quot;, sans-serif;height: 100% !important;"><center>
  <table style="width: 600px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 0;font-family: &quot;ProximaNova&quot;, sans-serif;border-collapse: collapse !important;height: 100% !important;" align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
    <tr>
      <td align="center" valign="top" id="bodyCell" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 20px;font-family: &quot;ProximaNova&quot;, sans-serif;height: 100% !important;">
      <div class="main">
        <p style="text-align: center;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%; margin-bottom: 30px;">
          <img src="{{application.logo}}"  alt="Your logo goes here" style="-ms-interpolation-mode: bicubic;border: 0;outline: none;text-decoration: none;height: 30px;">
        </p>

            <p style="font-size: 1.2em;line-height: 1.3;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;"></p>
            <p style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">{{content}}</p>
            <p style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;"><a style="font-size: 12px; color: #A9B3BC; text-decoration: none;word-break: break-all;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;" href="{{link}}">{{link}}</a></p>
        <br>
        Thanks!
        <br>
        <strong>{{application.name}}</strong>
        <br><br>
        <hr style="border: 2px solid #EAEEF3; border-bottom: 0; margin: 20px 0;">
        <p style="text-align: center;color: #A9B3BC;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">
          If you did not make this request, please contact us by replying to this mail.
        </p>
      </div>
      </td>
    </tr>
  </table>
</center>
</body>
</html>

`;

// We don't have any way to find a location of assets. So what we decided today, we will fetch the location only for the "PsNet tenants" and for this I have added a condition that if "PsNet tenants" comes then system will look the location.

export const AuvikPsNetId = "875629375448683261"; // This is id of PsNet tenants for spacial case to find location, as we only have data for PsNet so we are using this id to add condition in code. If tenant id of asset will match with this id then only location will add to that asset else location is null.

export const toleranceType = {
  optimal: "Optimal",
  tolerance: "Tolerance",
};
