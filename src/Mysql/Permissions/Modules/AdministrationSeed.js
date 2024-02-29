import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const AdministrationSeed = async() => {
    await permissionsSQLModel.bulkCreate([
        {   
            id:"c33580b7-4440-48fe-9096-99a830177a03",
            module_name: "Integration Section",
            parent_id: "484bb719-48e8-4f53-b442-8235be71b282",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION,
            actions: ["view", "edit", "delete"],
            type: 'company',
        },
        {   
            id:"449f9259-d652-4223-a9fb-68f41dac1984",
            module_name: "User Management",
            parent_id: "484bb719-48e8-4f53-b442-8235be71b282",
            slug: permissionSlug.ADMINISTRATION_USER_MANAGEMENT,
            actions: ["view"],
            type: 'company',
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });

    await permissionsSQLModel.bulkCreate([
        {   
            id:"e38f2812-ee68-4288-b0fa-fd0af79228a5",
            module_name: "Cloud",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_CLOUD,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {   
            id:"0f36f099-96d9-4438-8b1f-773a4b642ccf",
            module_name: "Network",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_NETWORK,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {   
            id:"5bea3261-1624-48b8-84a8-a7ebd5a92500",
            module_name: "Endpoint",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_ENDPOINT,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {   
            id:"97219df6-af84-48c3-bb92-c4af6b0a768a",
            module_name: "Mail",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_MAIL,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {   
            id:"662f6aeb-5421-4d3c-b39a-d4ca5bb17a28",
            module_name: "Backup",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_BACKUP,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {
            id:"a6b929a8-b18a-49a5-934e-5317c44f46f8",
            module_name: "Patching",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_PATCHING,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {
            id:"a6b929a8-b18a-49a5-934e-5317c44f46f8",
            module_name: "Security Awareness",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_SECURITY_AWARENESS,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {
            id:"a6b929a8-b18a-49a5-934e-5317c44f46f8",
            module_name: "Microsoft",
            parent_id: "c33580b7-4440-48fe-9096-99a830177a03",
            slug: permissionSlug.ADMINISTRATION_INTEGRATION_MICROSOFT,
            actions: ["view", "add", "delete"],
            type: 'company',
        },
        {   
            id:"53134af4-e6a2-4b8d-b36d-7573a69c4974",
            module_name: "Current Users",
            parent_id: "449f9259-d652-4223-a9fb-68f41dac1984",
            slug: permissionSlug.ADMINISTRATION_USER_MANAGEMENT_CURRENT_USER,
            actions: ["view", "invite_user"],
            type: 'company',
        },
        {   
            id:"f7005f0d-647b-4fac-971a-59fab2acb089",
            module_name: "Pending Users",
            parent_id: "449f9259-d652-4223-a9fb-68f41dac1984",
            slug: permissionSlug.ADMINISTRATION_USER_MANAGEMENT_PENDING_USER,
            actions: ["view", "verify_user"],
            type: 'company',
        },
        {   
            id:"fadd38b0-145d-48f3-bb46-e3230de0fd5e",
            module_name: "Invite Users",
            parent_id: "449f9259-d652-4223-a9fb-68f41dac1984",
            slug: permissionSlug.ADMINISTRATION_USER_MANAGEMENT_INVITE_USER,
            actions: ["view", "cancel_invite"],
            type: 'company',
        },   
    ],{ updateOnDuplicate: ["module_name", "actions", "slug", "parent_id", "type"] });



}