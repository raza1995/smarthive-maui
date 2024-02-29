import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const ResilienceSeed = async () => {
    await permissionsSQLModel.bulkCreate([ 
        {   
            id:"e4bcd4b2-f4ba-4eca-9e47-1ebf9a749cba",
            module_name: "Overview",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_OVERVIEW,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"2a0a147f-b710-4165-b17b-cd8e1113fa37",
            module_name: "All Asset",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_ALL_ASSETS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"43bc80da-2f37-4543-a1db-a83ab022da1e",
            module_name: "Endpoint",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_ENDPOINTS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"dcb70524-14ea-43d5-92a5-59df7de7d970",
            module_name: "Patching",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_PATCHING,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"652d8483-aafc-47f1-8150-a7355c9edc3a",
            module_name: "Lifecycle",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_LIFECYCLE,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"7f414129-7336-439b-86c8-ad9f178cf369",
            module_name: "Backup",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_BACKUP,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"49cbf81c-85f4-4ab2-9560-6db1d7ee7e62",
            module_name: "Softwares",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_SOFTWARES,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"49cbf81c-85f4-4ab2-9560-6db1d7dd7e65",
            module_name: "cves",
            parent_id: "480a8713-64c1-4bef-bc06-4c4207884f2b",
            slug: permissionSlug.RESILIENCE_CVES,
            actions: ["view"],
            type: 'company',
        },
    ], { updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    // Third Parent created
    await permissionsSQLModel.bulkCreate([                       
        {   
            id:"4e5cee33-7dee-49d0-a234-8179c73cc50e",
            module_name: "Asset Detail View",
            parent_id: "2a0a147f-b710-4165-b17b-cd8e1113fa37",
            slug: permissionSlug.RESILIENCE_ALL_ASSETS_DETAIL_VIEW,
            actions: ["view", "edit_name", "edit_location", "add_tags", "view_activity_logs"],
            type: 'company',
        },

        {   
            id:"c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            module_name: "All Endpoints",
            parent_id: "43bc80da-2f37-4543-a1db-a83ab022da1e",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"9a1ace1c-fd12-4b12-a5a3-652d5edf02b4",
            module_name: "Policies",
            parent_id: "43bc80da-2f37-4543-a1db-a83ab022da1e",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_POLICIES,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"7951683c-512a-4217-9c30-9357c0c68872",
            module_name: "Groups",
            parent_id: "43bc80da-2f37-4543-a1db-a83ab022da1e",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_GROUPS,
            actions: ["view"],
            type: 'company',
        },

        {   
            id:"c2bbfe20-a327-42f5-8da4-bf273a3fc418",
            module_name: "Overview",
            parent_id: "dcb70524-14ea-43d5-92a5-59df7de7d970",
            slug: permissionSlug.RESILIENCE_PATCHING_OVERVIEW,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"1bc5145f-3f2f-41f5-8205-e0b7ab6156ba",
            module_name: "Devices",
            parent_id: "dcb70524-14ea-43d5-92a5-59df7de7d970",
            slug: permissionSlug.RESILIENCE_PATCHING_DEVICES,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"104078ce-1b57-4d49-862d-5601227f77ea",
            module_name: "Policies",
            parent_id: "dcb70524-14ea-43d5-92a5-59df7de7d970",
            slug: permissionSlug.RESILIENCE_PATCHING_POLICIES,
            actions: ["view","add", "edit", "delete"],
            type: 'company',
        },
        {   
            id:"00d8d2aa-4819-45c9-a135-cd0ed6ef88c1",
            module_name: "Groups",
            parent_id: "dcb70524-14ea-43d5-92a5-59df7de7d970",
            slug: permissionSlug.RESILIENCE_PATCHING_GROUPS,
            actions: ["view","add", "edit", "delete"],
            type: 'company',
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });

    await permissionsSQLModel.bulkCreate([           
        {   
            id:"341e18f7-afa4-481e-bf84-960d4fd9141c",
            module_name: "Overview",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_OVERVIEW,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"0c9635ec-5b01-4f05-b572-236ba37c25ad",
            module_name: "Detections",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_DETECTIONS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"a50988bb-3c1d-4bb8-a69a-791e0f6a934f",
            module_name: "Suspicious Activity",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_SUSPICIOUS_ACTIVITY,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"18376f37-af35-470c-b65b-239885f90eb0",
            module_name: "Remediation Required",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_REMEDIATION_REQUIRED,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"d94f42a7-3756-44c3-9391-d3a6a4be4b4b",
            module_name: "Quarantine",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_QUARANTINE,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"12c9dad7-b5e3-41ef-9beb-8a82cf71185a",
            module_name: "Events",
            parent_id: "c5b4bb4d-cf3e-4bad-92a8-2ce074c119d3",
            slug: permissionSlug.RESILIENCE_ENDPOINTS_ALL_ENDPOINTS_EVENTS,
            actions: ["view"],
            type: 'company',
        },
        {   
            id:"2cfac3ff-2753-4297-a270-34baca74d1d6",
            module_name: "View Info",
            parent_id: "1bc5145f-3f2f-41f5-8205-e0b7ab6156ba",
            slug: permissionSlug.RESILIENCE_PATCHING_DEVICES_VIEW_INFO,
            actions: ["view","add_tags", "restart_device", "scan_device", "delete_device"],
            type: 'company',
        },
        {   
            id:"382b26f8-5b72-4314-8647-1d547f8df21d",
            module_name: "View Softwares",
            parent_id: "1bc5145f-3f2f-41f5-8205-e0b7ab6156ba",
            slug: permissionSlug.RESILIENCE_PATCHING_DEVICES_VIEW_SOFTWARES,
            actions: ["view","add_tags", "patch_software"],
            type: 'company',
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] })

}
