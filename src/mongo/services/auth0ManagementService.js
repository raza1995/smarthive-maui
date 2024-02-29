/* eslint-disable prefer-promise-reject-errors */
import axios from "axios";
import { generateManagementToken } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";

export class Auth0ManagementService {
  instance;

  authorization;

  constructor() {
    delete axios.defaults.headers.common.authorization;
    delete axios.defaults.headers.common.Authorization;
  }

  async authorize() {
    try {
      delete axios.defaults.headers.common.authorization;
      delete axios.defaults.headers.common.Authorization;
      this.instance = axios.create();
      const tokenResponse = await this.instance.request(
        generateManagementToken()
      );
      // console.log('Token response', tokenResponse);
      this.authorization = `Bearer ${tokenResponse.data.access_token}`;

      return Promise.resolve({ data: tokenResponse.data, context: this });
    } catch (err) {
      return Promise.reject({ error: err, context: this });
    }
  }

  async getRoles() {
    try {
      await this.authorize();
      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/roles`,
        method: "get",
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve({ data: response.data, context: this });
    } catch (err) {
      return Promise.reject({ error: err, context: this });
    }
  }

  async setUserRoles(auth0UserId, rolesList) {
    try {
      const data = {
        roles: rolesList,
      };
      await this.authorize();
      await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0UserId}/roles`,
        method: "post",
        data,
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve({
        data: "Roles updated successfully",
        context: this,
      });
    } catch (error) {
      return Promise.reject({ error, context: this });
    }
  }

  async removeUserFromRole(auth0UserId, rolesList) {
    try {
      const data = {
        roles: rolesList,
      };
      await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0UserId}/roles`,
        method: "delete",
        data,
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve({
        data: "Roles updated successfully",
        context: this,
      });
    } catch (error) {
      return Promise.reject({ error, context: this });
    }
  }

  async createUser(signUpDetails) {
    try {
      // console.log("herer is signUpDetails in authh beofre ->>>", signUpDetails);

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
      // console.log("herer is data in authh beofre ->>>", data);
      if (signUpDetails.prefer_contact === "phone_number") {
        data.phone_number = signUpDetails.phone_number;
        data.phone_verified = false;
      }
      await this.authorize();
      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users`,
        method: "post",
        data,
        headers: {
          Authorization: this.authorization,
        },
      });
      // console.log("here is response data in auth 0 ->> ", response.data);
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deleteUser(auth0UserId) {
    try {
      await this.authorize();
      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0UserId}`,
        method: "delete",
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getUser(auth0Id) {
    try {
      // await this.authorize();
      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}`,
        method: "get",
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateUserAtRegistration(auth0Id, userDetails) {
    try {
      // await this.authorize();

      const data = {
        phone_number: userDetails.phone_number,
      };
      await this.authorize();
      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}`,
        method: "patch",
        data,
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve(response);
    } catch (error) {
      errorHandler(error);
      return Promise.reject(error);
    }
  }

  async updateUser(userDetails) {
    try {
      // await this.authorize();

      const response = await this.instance.request({
        url: `${process.env.AUTH0_DOMAIN}/api/v2/users/${userDetails.user_id}`,
        method: "patch",
        data: userDetails,
        headers: {
          Authorization: this.authorization,
        },
      });

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
