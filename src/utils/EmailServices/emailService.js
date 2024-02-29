import { roles } from "../constants";
import { errorHandler } from "../errorHandler";
import { SecretsShareTemplate, welcomeEmailTemplate } from "./EmailTamplates";

require("dotenv").config();

const sgMail = require("@sendgrid/mail");

const application = {
  name: process.env.APP_NAME,
  logo: process.env.APP_LOGO,
};

export default {
  // customer_admin the admin name sending invite to customer
  // to send to email
  // medium of login phone or email
  //
  // async sendInvite(customer_admin, to, invite_code, invited_to = 'company') {
  //   try {
  //     sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
  //     const msg = {
  //       to, // Change to your recipient
  //       from: "oahu@smarthive.io", // Change to your verified sender
  //       subject: `You have been invited to join Smart Hive.`,
  //       text: "You have been invited to join Smart Hive, Plesae find the invite link below",
  //       html: "",
  //     };

  //     let url = process.env.APP_INVITATION_REDIRECT;
  //     if(invited_to === roles.Partner) {
  //       url = process.env.PARTNER_INVITATION_REDIRECT
  //     }

  //     const query = `code=${invite_code}`;
  //     const link = `${url}?${query}`;
  //     const template = welcomeEmailTemplate
  //       .replace("{{application.logo}}", process.env.APP_LOGO)
  //       .replace("{{application.name}}", process.env.APP_NAME)
  //       .replace("{{content}}", msg.text)
  //       .replace("{{customer_admin_name}}", customer_admin)
  //       .replace("{{link}}", link)
  //       .replace("{{link}}", link);
  //     msg.html = template;
  //     console.log("Message", msg);
  //     const response = await sgMail.send(msg);
  //     console.log(response);
  //     return Promise.resolve(response);
  //   } catch (err) {
  //     errorHandler(err);

  //     return Promise.reject(err);
  //   }
  // },
  async sendShareSecretsEmail(to, user) {
    try {
      sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
      const msg = {
        to, // Change to your recipient
        from: "oahu@smarthive.io", // Change to your verified sender
        subject: `New secrets share with you.`,
        text: `${user.full_name} has share secrets with you`,
        html: "",
      };

      const template = SecretsShareTemplate(application, msg.text);
      msg.html = template;
      const response = await sgMail.send(msg);
      return Promise.resolve(response);
    } catch (err) {
      errorHandler(err);
      return Promise.reject(err);
    }
  },
  async sendInvite(
    invitedByName,
    to,
    invite_code,
    invitedTo = "company",
    invitedToCompany,
    invitedAs
  ) {
    try {
      sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
      let url = process.env.APP_INVITATION_REDIRECT;
      if (invitedTo === roles.Partner) {
        url = process.env.PARTNER_INVITATION_REDIRECT;
      }

      const query = `code=${invite_code}`;
      const link = `${url}?${query}`;
      const msg = {
        
        personalizations: [
          {
          
            to: [
              {
                email: to,
              },
            ],
          
            dynamicTemplateData: {
              serverLink: process.env.SERVER_LINK,
              url: link,
              invitedByName,
              role: invitedAs,
              company_name: invitedToCompany,
              admin_email: process.env.SUPER_ADMIN_EMAIL,
             
              
            }
          },
        ],
        from: {
          email: "welcome@smarthive.io",
          name: "Smart Hive",
        },

        template_id: "d-71c28d56010f45c492093cf2584979d1",
      };

      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (err) {
      errorHandler(err);
    }
  },
};
