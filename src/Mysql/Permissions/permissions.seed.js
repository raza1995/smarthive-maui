import { AdministrationSeed } from "./Modules/AdministrationSeed";
import { ParentMenuSeed } from "./Modules/ParentMenu";
import { PrivilageAccessSeed } from "./Modules/PrivilageAccess";
import { ResilienceSeed } from "./Modules/ResilienceSeed";
import { RiskViewSeed } from "./Modules/RiskViewSeed";
import { PartnerAdministrationSeed } from "./PartnerModules/PartnerAdministration";
import { PartnerDashboardSeed } from "./PartnerModules/PartnerDashboardMenu";
import { PartnerParentMenuSeed } from "./PartnerModules/PartnerParentMenu";
import { updateOldPermissions } from "./permission.service";
import permissionsSQLModel from "./permissions.model"
import { SuperAdminCustomersSeed } from "./SuperAdminModules/SuperAdminCustomersMenu";
import { SuperAdminParentMenuSeed } from "./SuperAdminModules/SuperAdminParentMenu";
import { SuperAdminPartnersSeed } from "./SuperAdminModules/SuperAdminPartners";

export const permissionsSeeding = async () => {
    // Oahu (Company) Permissions seeding
    await ParentMenuSeed();
    await AdministrationSeed();
    await RiskViewSeed();
    await ResilienceSeed();
    await PrivilageAccessSeed();    

    // Partner Permissions seeding        
    await PartnerParentMenuSeed();
    await PartnerDashboardSeed();
    await PartnerAdministrationSeed();

    // Super Admin Permissions seeding
    await SuperAdminParentMenuSeed();
    await SuperAdminCustomersSeed();
    await SuperAdminPartnersSeed();

    // Update old Permissions
    await updateOldPermissions();
}