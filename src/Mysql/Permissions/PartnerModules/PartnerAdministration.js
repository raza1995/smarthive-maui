import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const PartnerAdministrationSeed = async() => {
    await permissionsSQLModel.bulkCreate([
        {   
            id:"4d93a3c9-2fb4-4daf-92a4-380df5558d30",
            module_name: "User Management",
            parent_id: "b77f149f-fa80-45aa-bd16-703aa9ae90c2",
            slug: permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT,
            actions: ["view", "invite_user"],
            type: roles.Partner
        },
        {   
            id:"036b71f4-c40f-4226-ab43-424e72a3df97",
            module_name: "Client Management",
            parent_id: "b77f149f-fa80-45aa-bd16-703aa9ae90c2",
            slug: permissionSlug.PARTNER_ADMINISTRATION_COMPANY_MANAGEMENT,
            actions: ["view"],
            type: roles.Partner
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });

    // User Management Child Permissions
    await permissionsSQLModel.bulkCreate([
        {   
            id:"2f8691b9-147f-41d8-89a4-2698dc649957",
            module_name: "Current Users",
            parent_id: "4d93a3c9-2fb4-4daf-92a4-380df5558d30",
            slug: permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_CURRENT_USERS,
            actions: ["view", "update_status", "edit", "delete"],
            type: roles.Partner
        },
        {   
            id:"ad63ce1f-6546-4d80-a7b2-9026917ac867",
            module_name: "Pending Users",
            parent_id: "4d93a3c9-2fb4-4daf-92a4-380df5558d30",
            slug: permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_PENDING_USERS,
            actions: ["view", "accept_request", "reject_request"],
            type: roles.Partner
        },
        {   
            id:"023eae9b-9c38-41d1-a80d-acf577ad57d8",
            module_name: "Invite Users",
            parent_id: "4d93a3c9-2fb4-4daf-92a4-380df5558d30",
            slug: permissionSlug.PARTNER_ADMINISTRATION_USER_MANAGEMENT_INVITED_USERS,
            actions: ["view", "cancel_invite"],
            type: roles.Partner
        },   
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });

    // Company Management Child Permissions
    await permissionsSQLModel.bulkCreate([
        {   
            id:"854bdcb9-7e18-41d3-947d-67341a01cf68",
            module_name: "Invited Clients",
            parent_id: "036b71f4-c40f-4226-ab43-424e72a3df97",
            slug: permissionSlug.PARTNER_ADMINISTRATION_COMPANY_MANAGEMENT_INVITED_COMPANIES,
            actions: ["view", "cancel_invite"],
            type: roles.Partner
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });

}