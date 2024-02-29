import {
    DataTypes, Sequelize
} from "sequelize";
import { roles } from "../../utils/constants";
import { createUserRole } from "../UserRoles/userRoles.service";
import rolesSQLModel from "./roles.model";
import {createRolePermissions} from '../Permissions/permission.service';

export const superAdminRoleSeed = async (company_id, user_id, role_id) => {
    // const role_id = "1076562e-75b7-4fa3-9523-a0a626e47ae0";
    await rolesSQLModel.bulkCreate([
        {
            id: role_id,
            company_id,
            name: "Admin",
            slug: "admin",
            description: "This user can edit, view and delete.",
            type: roles.SuperAdmin
        },
    ],{ updateOnDuplicate: ["id","company_id","name","slug", "description", "type"] }); 

    // Create User Role
    await createUserRole(role_id, company_id, user_id)

    // Update permissions for super admin role

    const fyndSuperAdminRoles = await rolesSQLModel.count({
        where: {
            company_id,
            type: "company",
        }
    });
    if(fyndSuperAdminRoles === 0) {
        await rolesSQLModel.bulkCreate([
            {
                // id: Sequelize.UUIDV4,
                company_id,
                name: "Admin",
                slug: "admin",
                description: "This is partner role.",
                type: roles.Partner
            },
            {
                // id: Sequelize.UUIDV4,
                company_id,
                name: "Admin",
                slug: "admin",
                description: "This user can edit and view.",
                type: "company"
            },
            {
                // id: Sequelize.UUIDV4,
                company_id,
                name: "Compliance",
                slug: "compliance",
                description: "This user can edit and view.",
                type: "company"
            },
            {
                // id: Sequelize.UUIDV4,
                company_id,
                name: "Analyst",
                slug: "analyst",
                description: "This user can edit and view.",
                type: "company"
            },
        ],{ updateOnDuplicate: ["name", "slug", "description", "type"] });   
    } 
    // create role permissions
    await createRolePermissions(company_id, roles.Partner)
    await createRolePermissions(company_id, "company")
    await createRolePermissions(company_id, roles.SuperAdmin)

}