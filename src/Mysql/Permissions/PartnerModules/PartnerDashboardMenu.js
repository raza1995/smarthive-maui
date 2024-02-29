import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const PartnerDashboardSeed = async () => {
    // Manage Compnay
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"9ea3e489-de36-4be6-97bf-b60737c7a21b",
            module_name: "Manage Client",
            parent_id: "0c7933fe-29e4-49e8-a2a8-9080d6d51f9a",
            slug: permissionSlug.PARTNER_DASHBOARD_MANAGE_COMPANY,
            actions: ["view"],
            type: roles.Partner
        }
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // Manage company child permissions
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"5e11c789-f728-4615-910b-593306c16b1d",
            module_name: "Overview",
            parent_id: "9ea3e489-de36-4be6-97bf-b60737c7a21b",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_OVERVIEW,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"431fc304-eade-4a2e-93c9-7ef9fdbbf086",
            module_name: "Activity Log",
            parent_id: "9ea3e489-de36-4be6-97bf-b60737c7a21b",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_ACTIVITY_LOG,
            actions: ["view"],
            type: roles.Partner
        },
        {   
            id:"9b60659f-6ed2-44fa-abd2-ad79f85fd258",
            module_name: "User Management",
            parent_id: "9ea3e489-de36-4be6-97bf-b60737c7a21b",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT,
            actions: ["view", "invite_user"],
            type: roles.Partner
        },
        {   
            id:"72b42eb5-bb83-42cf-8dca-a9bd1110b8cb",
            module_name: "Login to Client",
            parent_id: "9ea3e489-de36-4be6-97bf-b60737c7a21b",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_LOGIN_TO_COMPANY,
            actions: ["view"],
            type: roles.Partner
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // User Management child Permissions
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"e0083094-f136-4d8e-ae97-e7836ab9fbe2",
            module_name: "Current Users",
            parent_id: "9b60659f-6ed2-44fa-abd2-ad79f85fd258",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
            actions: ["view", "update_status", "edit", "delete"],
            type: roles.Partner
        },
        {   
            id:"9ed1ce07-6410-42c8-9d15-db9278948e32",
            module_name: "Pending Users",
            parent_id: "9b60659f-6ed2-44fa-abd2-ad79f85fd258",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_PENDING_USERS,
            actions: ["view", "accept_request", "reject_request"],
            type: roles.Partner
        },
        {   
            id:"0d4c6300-34bb-4db3-8c96-c68d1ac7f1d8",
            module_name: "Invite Users",
            parent_id: "9b60659f-6ed2-44fa-abd2-ad79f85fd258",
            slug: permissionSlug.PARTNER_DASHBOARD_COMPANY_USER_MANAGEMENT_INVITED_USERS,
            actions: ["view", "cancel_invite"],
            type: roles.Partner
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

}