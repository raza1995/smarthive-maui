import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const RiskViewSeed = async () => {
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"f260fbec-ed58-472a-86d5-2e71fbafb871",
            module_name: "Overview Tab",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_OVERVIEW,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"a1499409-7ff8-4b1c-8c2a-6968a7554323",
            module_name: "Application View",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_APPLICATION,
            actions: ["view","view_detail", "add", "edit", "delete", "add_assets", "remove_assets", "add_humans", "remove_humans", "add_shared_services", "remove_shared_services"],
            type: 'company',
        },
        {   
            id:"57e2a3c0-91ef-436b-9b7f-e30928d9ecb7",
            module_name: "Human Factor",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_HUMAN_FACTOR,
            actions: ["view", "view_detail", "edit", "add_asset_linked", "delete_asset_linked"],
            type: 'company',
        },
        {   
            id:"466bebd1-2368-4388-ba0e-1d2e20db24c5",
            module_name: "Business Risk",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_BUSINESS_RISK,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"40db927f-18f7-4e48-abdb-faa9e98db4a0",
            module_name: "Score Management",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT,
            actions: ["view"],
            type: "company"
        },
        {   
            id:"de242764-e32b-4422-83c9-7e8ce58101fc",
            module_name: "Risk Cost",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_RISK_COST,
            actions: ["view"],
            type: "company"
        },
        {   
            id:"8c40a3fc-e897-458d-96c3-698b0dc3d1a8",
            module_name: "Risk Tolerance",
            parent_id: "b35e2d54-52a9-4191-9309-1a7beaabdd0c",
            slug: permissionSlug.RISK_VIEW_RISK_TOLERANCE,
            actions: ["view"],
            type: "company"
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // Chlid for Score management
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"ebbb6223-256c-407b-9ecf-c9da5348c741",
            module_name: "Assets",
            parent_id: "40db927f-18f7-4e48-abdb-faa9e98db4a0",
            slug: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_ASSETS,
            actions: ["view", "edit_priority", "create", "edit", "delete"],
            type: "company"
        },
        {   
            id:"cbba7ae2-245f-44a6-92f0-dc4c2af69b7f",
            module_name: "Application",
            parent_id: "40db927f-18f7-4e48-abdb-faa9e98db4a0",
            slug: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_APPLICATION,
            actions: ["view", "edit_priority", "create", "edit", "delete"],
            type: "company"
        },
        {   
            id:"6a7ee2b7-7eca-408c-a4fa-4bd0afecbc10",
            module_name: "Human",
            parent_id: "40db927f-18f7-4e48-abdb-faa9e98db4a0",
            slug: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_HUMANS,
            actions: ["view", "edit_priority", "create", "edit", "delete"],
            type: "company"
        },
        {   
            id:"d81ac371-22b3-4d6b-9931-6a94670d543b",
            module_name: "Privilege Access",
            parent_id: "40db927f-18f7-4e48-abdb-faa9e98db4a0",
            slug: permissionSlug.RISK_VIEW_SCORE_MANAGEMENT_PRIVILEGE_ACCESS,
            actions: ["view", "edit_priority", "create", "edit", "delete"],
            type: "company"
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] })

    // Chlid for Risk Cost
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"886772ff-b31e-4e22-b905-5ca9532dfd47",
            module_name: "Cost Factors",
            parent_id: "de242764-e32b-4422-83c9-7e8ce58101fc",
            slug: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTORS,
            actions: ["view", "create", "edit", "delete"],
            type: "company"
        },
        {   
            id:"970cc819-54eb-4eb8-b36a-13d76590addc",
            module_name: "Cost Factor Attributes",
            parent_id: "de242764-e32b-4422-83c9-7e8ce58101fc",
            slug: permissionSlug.RISK_VIEW_RISK_COST_COST_FACTOR_ATTRIBUTES,
            actions: ["create"],
            type: "company"
        },
        {   
            id:"916c9512-6b3d-453c-987a-57ba8cf320c0",
            module_name: "Downtime Probability",
            parent_id: "de242764-e32b-4422-83c9-7e8ce58101fc",
            slug: permissionSlug.RISK_VIEW_RISK_COST_DOWNTIME_PROBABILITY,
            actions: ["view", "edit"],
            type: "company"
        },
        {   
            id:"ffd87779-5d95-4f75-ab93-a6b79333adb8",
            module_name: "Cost Factor Priority",
            parent_id: "de242764-e32b-4422-83c9-7e8ce58101fc",
            slug: permissionSlug.RISK_VIEW_RISK_COST_PRIORITY,
            actions: ["view", "edit"],
            type: "company"
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] })

    // Chlid for Risk Tolerance
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"579b3aad-7b2e-4569-9b97-ac90ffc9a082",
            module_name: "Tolerances",
            parent_id: "8c40a3fc-e897-458d-96c3-698b0dc3d1a8",
            slug: permissionSlug.RISK_VIEW_RISK_TOLERANCE_TOLERANCES,
            actions: ["view", "create", "edit", "delete"],
            type: "company"
        },
        {   
            id:"084f064f-828d-49c6-a44c-da9db059b29b",
            module_name: "Tolerance Priority",
            parent_id: "8c40a3fc-e897-458d-96c3-698b0dc3d1a8",
            slug: permissionSlug.RISK_VIEW_RISK_TOLERANCE_PRIORITY,
            actions: ["view", "edit"],
            type: "company"
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] })
}