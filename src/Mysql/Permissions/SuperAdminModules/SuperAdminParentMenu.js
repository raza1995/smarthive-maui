import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const SuperAdminParentMenuSeed = async () => {
    // Parent Permissions Created 
    await permissionsSQLModel.bulkCreate([
        {   
            id:"2ddee5af-6666-46c0-9d9f-302aaef30150",
            module_name: "Customers",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMERS,
            actions: ["view"],
            type: roles.SuperAdmin
        },
        {   
            id:"b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
            module_name: "Partners",
            slug: permissionSlug.SUPER_ADMIN_PARTNERS,
            actions: ["view"],
            type: roles.SuperAdmin
        },
        {   
            id:"0506b18c-97a6-420a-9baf-8aeac660f3a3",
            module_name: "Onboard Client",
            slug: permissionSlug.SUPER_ADMIN_ONBOARD_CLIENT,
            actions: ["view"],
            type: roles.SuperAdmin
        },
        {   
            id:"213c5595-7302-48ec-b890-39fc357964d4",
            module_name: "Profile",
            slug: permissionSlug.SUPER_ADMIN_PROFILE,
            actions: ["view"],
            type: roles.SuperAdmin
        }
    ],
    { updateOnDuplicate: ["module_name", "actions", "slug", "type"] });
}