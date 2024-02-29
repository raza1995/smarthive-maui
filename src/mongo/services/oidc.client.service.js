import { Issuer } from "openid-client";
import { errorHandler } from "../../utils/errorHandler";

let i = 0;
export default {
  async checkAuth(token) {
    try {
      const issuer = await Issuer.discover(process.env.AUTH0_DISCOVERY);
      const oidcClient = new issuer.Client({
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        client_id: process.env.AUTH0_CLIENT_ID,
        redirect_uris: [process.env.AUTH0_REDIRECT_URL],
      });
      const userInfo = await oidcClient
        .userinfo(token)
        .then((res) => res)
        .catch((err) => {
          i = 0;
          console.log("Error occured", err);
          return Promise.reject(err);
        });
      i++;
      console.log("User Authenticated ", i, "times");
      return Promise.resolve(userInfo);
    } catch (error) {
      errorHandler(error);
      return Promise.reject(error);
    }
  },
};
