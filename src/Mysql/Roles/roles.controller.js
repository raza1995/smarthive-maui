import { errorHandler } from "../../utils/errorHandler";
import { createNewRolePermissions } from "../RoleHasPermissions/roleHasPermissions.service";
import { createUserPermissions } from "../UserHasPermissions/userHasPermissions.service";
import { createUserRole } from "../UserRoles/userRoles.service";
import rolesSQLModel from "./roles.model";
import { findRoleBySlug, getRoles } from "./roles.service";

export const roleList = async (req, res) => {
  try {
    const {user} = req;
    const { query } = req;
    const { company_id } = query
    const { type, invite_to } = query
    console.log('query', query)
    let companyId = user.company_id;
    if(company_id) {
      companyId = company_id;       
    } 
    const sort = 'asc';
    const sortColumn = 'name';  
    const slug = type === "company" && invite_to === "company" ? ['admin', 'analyst', 'compliance'] : [];  
    const roles = await getRoles(companyId, type, sortColumn, sort, slug);
    return res.status(200).json({
      message: "Roles fetched successfully",
      roles,
    });
  } catch (err) {
    errorHandler(err);
    res.status(503).json(err.message);
  }
};
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");

export const addRole = async (slug, permissions, companyId, userId, type, oldData = false) => {
  try {
    let fyndRole = await findRoleBySlug(slugify(slug), companyId, type);
    if (!fyndRole) {
      const object = {
        name: slug,
        company_id: companyId,
        slug: slugify(slug),
        description: slug,
        type
      };
      fyndRole = await rolesSQLModel.create(object);
      if (slugify(slug) !== "custom") {
        // Create Role Permissions
        await createNewRolePermissions(fyndRole.id, companyId, permissions);
      }
    }
    // Create User Role Table Entry
    await createUserRole(fyndRole.id, companyId, userId, oldData);
    if (slugify(slug) === "custom") {
      // Create User Permissions
      await createUserPermissions(userId, companyId, permissions);
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return err.message;
  }
};
