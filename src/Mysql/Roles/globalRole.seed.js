import { roles } from "../../utils/constants";
import { createRolePermissions } from "../Permissions/permission.service";
import rolesSQLModel from "./roles.model"

export const globalRolesSeed = async (company_id) => {
    console.log("globalRolesSeed ======== ", company_id)
    await rolesSQLModel.bulkCreate([
        {
             id: "a8ca40f2-8cd3-4a2d-ba39-072e1a32b267",
            company_id,
            name: "Admin",
            slug: "admin",
            description: "This is partner role.",
            type: roles.Partner
        },
        {
             id: "00000000-0000-0000-0000-000000000001",
            company_id,
            name: "Admin",
            slug: "admin",
            description: "This user can edit and view.",
            type: "company"
        },
        {
             id: "00000000-0000-0000-0000-000000000002",
            company_id,
            name: "Compliance",
            slug: "compliance",
            description: "This user can edit and view.",
            type: "company"
        },
        {
            id: "00000000-0000-0000-0000-000000000003",
            company_id,
            name: "Analyst",
            slug: "analyst",
            description: "This user can edit and view.",
            type: "company"
        },
    ],{ updateOnDuplicate: ["name", "slug", "description", "type"] });
    // Create Default Permissions
    await createRolePermissions(company_id, roles.Partner)
    await createRolePermissions(company_id, "company");

}