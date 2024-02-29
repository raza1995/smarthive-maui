import { createUserOnAuth0 } from "../../utils/auth0";
import { superAdminRoleSeed } from "../Roles/superAdminRole.seed";
import userModel from "./users.model";
import { findUserByEmail } from "./users.service";

export const superAdminUserSeed = async (company_id, id, email, role_id, full_name) => {
  // const email = process.env.SUPER_ADMIN_EMAIL;
  // Check if the user exists already otherwise create a new admin user
  const fyndUser = await findUserByEmail(email);
  // const id = "cc31ec85-3db4-433d-b0e6-2bc66bfb124d";
  if (!fyndUser) {
    const user = {
      // full_name: "Super Admin",
      full_name,
      profile_image: null,
      email,
      approved_by_customer_admin: true,
      is_active: true,
      prefer_contact: "email",
    };
    const response = await createUserOnAuth0(user);
    await userModel.bulkCreate(
      [
        {
          id,
          company_id,
          auth0_id: response.user_id,
          ...user,
        },
      ],
      {
        updateOnDuplicate: [
          "id",
          "company_id",
          "auth0_id",
          "full_name",
          "profile_image",
          "email",
          "approved_by_customer_admin",
          "is_active",
          "prefer_contact",
        ],
      }
    );
  }
  // Create A super admin default role
  await superAdminRoleSeed(company_id, id, role_id);
};
