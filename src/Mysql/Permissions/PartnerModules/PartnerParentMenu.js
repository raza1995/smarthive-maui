import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const PartnerParentMenuSeed = async () => {
    // Parent Permissions Created 
    await permissionsSQLModel.bulkCreate([
        {   
            id:"0c7933fe-29e4-49e8-a2a8-9080d6d51f9a",
            module_name: "Dashboard",
            slug: permissionSlug.PARTNER_DASHBOARD,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"b77f149f-fa80-45aa-bd16-703aa9ae90c2",
            module_name: "Administration",
            slug: permissionSlug.PARTNER_ADMINISTRATION,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"735a28d8-d441-4f2d-b245-76bceae9e3bf",
            module_name: "My Hive",
            slug: permissionSlug.PARTNER_MY_HIVE,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"b3f6554a-4113-4b63-8d65-c0b5be4cd6b7",
            module_name: "Onboard Client",
            slug: permissionSlug.PARTNER_ONBOARD_CLIENT,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"e5b5c673-e8b4-4b0b-837e-3a2d6ef88f1a",
            module_name: "Profile",
            slug: permissionSlug.PARTNER_PROFILE,
            actions: ["view"],
            type: roles.Partner
        }
    ],
    { updateOnDuplicate: ["module_name", "actions", "slug", "type"] });
}