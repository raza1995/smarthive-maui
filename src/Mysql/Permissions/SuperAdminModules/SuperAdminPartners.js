import { roles } from "../../../utils/constants";
import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const SuperAdminPartnersSeed = async() => {

    // await permissionsSQLModel.bulkCreate([
    //     {   
    //         id:"61dd2f52-7e82-4299-9146-07a3a8356be5",
    //         module_name: "Info",
    //         parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
    //         slug: permissionSlug.SUPER_ADMIN_PARTNER_INFO,
    //         actions: ["view", "delete"],
    //         type: roles.SuperAdmin
    //     },{   
    //         id:"bc094a5e-bec9-4255-8cb7-5738ea2480ea",
    //         module_name: "Companies",
    //         parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
    //         slug: permissionSlug.SUPER_ADMIN_PARTNER_COMPANIES,
    //         actions: ["view", "add", "delete"],
    //         type: roles.SuperAdmin
    //     },{   
    //         id:"d0edb063-d749-4c80-98c4-bb4b10a01837",
    //         module_name: "Activity Logs",
    //         parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
    //         slug: permissionSlug.SUPER_ADMIN_PARTNER_ACTIVITY_LOGS,
    //         actions: ["view"],
    //         type: roles.SuperAdmin
    //     },
    // ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });

    await permissionsSQLModel.bulkCreate([
        {   
            id:"61dd2f52-7e82-4299-9146-07a3a8356be5",
            module_name: "Current Partners",
            parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
            slug: permissionSlug.SUPER_ADMIN_PARTNERS_CURRENT_PARTNERS,
            actions: ["view", "add", "delete"],
            type: roles.SuperAdmin
        },{   
            id:"bc094a5e-bec9-4255-8cb7-5738ea2480ea",
            module_name: "Invited Partners",
            parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
            slug: permissionSlug.SUPER_ADMIN_PARTNERS_INVITED_PARTNERS,
            actions: ["view", "cancel_invite"],
            type: roles.SuperAdmin
        },{   
            id:"d0edb063-d749-4c80-98c4-bb4b10a01837",
            module_name: "Invite Partner",
            parent_id: "b0bf962e-7e56-4200-8bb6-a3b8143af5e9",
            slug: permissionSlug.SUPER_ADMIN_PARTNERS_INVITE_PARTNER,
            actions: ["view"],
            type: roles.SuperAdmin
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });


}