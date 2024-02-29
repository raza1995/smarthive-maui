import permissionsSQLModel from "../permissions.model";
import { permissionSlug } from "../permissionSlugs";

export const PrivilageAccessSeed = async () => {
    await permissionsSQLModel.bulkCreate([        
        {   
            id:"7817ca16-931c-11ed-a1eb-0242ac120002",
            module_name: "Secrets",
            parent_id: "4b71953a-8685-11ed-a1eb-0242ac120002",
            slug: permissionSlug.PRIVILAGE_ACCESS_SECRET,
            actions: ["view","add","share"],
            type: 'company',
        },
    ],{ updateOnDuplicate: ["module_name", "actions", "parent_id", "slug", "type"] });
}