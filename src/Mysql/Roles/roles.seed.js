import {
    Sequelize
} from "sequelize";
import { createRolePermissions } from "../Permissions/permission.service";
import rolesSQLModel from "./roles.model"

export const rolesSeed = async (companyId) => {
    await rolesSQLModel.bulkCreate([
        {
            // id: Sequelize.UUIDV4,
            company_id: companyId,
            name: "Admin",
            slug: "admin",
            description: "This user can edit and view.",
            type: "company"
        },
        {
            // id: Sequelize.UUIDV4,
            company_id: companyId,
            name: "Compliance",
            slug: "compliance",
            description: "This user can edit and view.",
            type: "company"
        },
        {
            // id: Sequelize.UUIDV4,
            company_id: companyId,
            name: "Analyst",
            slug: "analyst",
            description: "This user can edit and view.",
            type: "company"
        },
    ],{ updateOnDuplicate: ["name", "slug", "description", "type"] });
    // Create Default Permissions
    await createRolePermissions(companyId, "company");
}