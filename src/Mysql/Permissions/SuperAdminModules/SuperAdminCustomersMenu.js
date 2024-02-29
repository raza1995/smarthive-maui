import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const SuperAdminCustomersSeed = async () => {
    // Manage Company
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"997fe7ee-7d77-4ff7-aac6-bf981e4db5f9",
            module_name: "Manage Client",
            parent_id: "2ddee5af-6666-46c0-9d9f-302aaef30150",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_MANAGE_COMPANY,
            actions: ["view"],
            type: roles.SuperAdmin
        }
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // Manage company child permissions
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"a820fca9-a2e1-436c-a2d3-2f7ac6a9c0bc",
            module_name: "Overview",
            parent_id: "997fe7ee-7d77-4ff7-aac6-bf981e4db5f9",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_OVERVIEW,
            actions: ["view"],
            type: roles.SuperAdmin
        },
        {   
            id:"9cb9bd84-a1ab-4a94-8744-df3562644c1e",
            module_name: "Activity Log",
            parent_id: "997fe7ee-7d77-4ff7-aac6-bf981e4db5f9",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_ACTIVITY_LOG,
            actions: ["view"],
            type: roles.SuperAdmin
        },
        {   
            id:"a71a18e9-f91c-49d1-9ad4-0f0cfe246826",
            module_name: "User Management",
            parent_id: "997fe7ee-7d77-4ff7-aac6-bf981e4db5f9",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT,
            actions: ["view", "invite_user"],
            type: roles.SuperAdmin
        },
        {   
            id:"9fcd0a2c-4147-49b1-b29b-9dcbf8ae6e3c",
            module_name: "Login to Client",
            parent_id: "997fe7ee-7d77-4ff7-aac6-bf981e4db5f9",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_LOGIN_TO_COMPANY,
            actions: ["view"],
            type: roles.SuperAdmin
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // User Management child Permissions
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"728b3da9-7f82-4424-9325-214274ec0ae8",
            module_name: "Current Users",
            parent_id: "a71a18e9-f91c-49d1-9ad4-0f0cfe246826",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_CURRENT_USERS,
            actions: ["view", "update_status", "edit", "delete"],
            type: roles.SuperAdmin
        },
        {   
            id:"fc8a6da9-60df-423d-92fb-dd9fd4d329d5",
            module_name: "Pending Users",
            parent_id: "a71a18e9-f91c-49d1-9ad4-0f0cfe246826",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_PENDING_USERS,
            actions: ["view", "accept_request", "reject_request"],
            type: roles.SuperAdmin
        },
        {   
            id:"a7571e54-5185-4e1f-94eb-93463c576aa5",
            module_name: "Invited Users",
            parent_id: "a71a18e9-f91c-49d1-9ad4-0f0cfe246826",
            slug: permissionSlug.SUPER_ADMIN_CUSTOMER_COMPANY_USER_MANAGEMENT_INVITED_USERS,
            actions: ["view", "cancel_invite"],
            type: roles.SuperAdmin
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

}