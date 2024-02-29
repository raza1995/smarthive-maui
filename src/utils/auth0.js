import auth0 from "auth0";
import { sendMagicLinkActivity } from "../Mysql/Logs/ActivitiesType/authActivities";
import { addEventLog } from "../Mysql/Logs/eventLogs/eventLogs.controller";
import { errorHandler } from "./errorHandler";

export const webAuth = new auth0.AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN_NAME,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
export const webAuthManagement = new auth0.ManagementClient({
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN_NAME,
  audience: process.env.AUTH0_MANAGEMENT_AUDIENCE,
});

export const sendMagicLink = async (
  email,
  redirect_uri = 'http://localhost:3000',
  client
) =>
  webAuth
    .requestMagicLink({
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      authParams: {
        scope: "openid email profile",
        redirect_uri: `${redirect_uri}/login`,
      },
    })
    .then((res) => {
      if (client) {
        addEventLog(
          client,
          sendMagicLinkActivity.status.MagicLinkSentSuccessfully.code,
          null
        );
      }
      return res;
    })
    .catch((err) => {
      if (client) {
        addEventLog(
          client,
          sendMagicLinkActivity.status.MagicLinkSendingFailed.code,
          null,
          err.message
        );
      }
      throw Error(err);
    });

export const createUserOnAuth0 = async (signUpDetails, partner = false, superAdmin = false) => {
  try {
    const data = {
      connection:
        signUpDetails.prefer_contact === "phone_number" ? "sms" : "email",
      email: signUpDetails.email,
      email_verified: false,
      given_name: signUpDetails.full_name,
      name: signUpDetails.full_name,
      nickname: signUpDetails.full_name,
      user_metadata: {
        company_id: signUpDetails.company_id,
        companyName: signUpDetails.company_name,
        industry: signUpDetails.industry_name,
      },
    };
    if (signUpDetails.prefer_contact === "phone_number") {
      data.phone_number = signUpDetails.phone_number;
      data.phone_verified = false;
    }
    // await this.authorize();
    // const response = await this.instance.request({
    //     url: `${process.env.AUTH0_DOMAIN}/api/v2/users`,
    //     method: 'post',
    //     data,
    //     headers: {
    //         Authorization: this.authorization
    //     }
    // });
    const response = await webAuthManagement.createUser(data).then((res) => {
      if (partner && signUpDetails.prefer_contact !== "phone_number" ) {
        
        sendMagicLink(res.email, process.env.PARTNER_APP_URL).then((resp) => {
          // console.log("resp ========== ", resp);
        });
      }
      return res;
    });
    return Promise.resolve(response);
  } catch (err) {
    errorHandler(err)
    return Promise.reject(err);
  }
};
