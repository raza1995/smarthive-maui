import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const ParentMenuSeed = async () => {
    // Parent Permissions Created 
    await permissionsSQLModel.bulkCreate([
        {   
            id:"484bb719-48e8-4f53-b442-8235be71b282",
            module_name: "Administration",
            slug: permissionSlug.ADMINISTRATION,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            module_name: "Risk View",
            slug: permissionSlug.RISK_VIEW,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"480a8713-64c1-4bef-bc06-4c4207884f2b",
            module_name: "Resilience",
            slug: permissionSlug.RESILIENCE,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"3b5c0e5a-8685-11ed-a1eb-0242ac120002",
            module_name: "Dashboard",
            slug: permissionSlug.DASHBOARD,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"457598a2-8685-11ed-a1eb-0242ac120002",
            module_name: "Hive",
            slug: permissionSlug.HIVE,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"4b71953a-8685-11ed-a1eb-0242ac120002",
            module_name: "Privilage Access",
            slug: permissionSlug.PRIVILAGE_ACCESS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"515e38ae-8685-11ed-a1eb-0242ac120002",
            module_name: "Compliance",
            slug: permissionSlug.COMPLIANCE,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"55d2b7c0-8685-11ed-a1eb-0242ac120002",
            module_name: "Event Logs",
            slug: permissionSlug.EVENT_LOGS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"d0ca8c22-cf2d-4ef6-b2eb-533b60f2bfe3",
            module_name: "Profile",
            slug: permissionSlug.PROFILE,
            actions: ["view"],
            type: 'company',
        },
    ],
    { updateOnDuplicate: ["module_name", "actions", "slug", "type"] });
}