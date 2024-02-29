import { updateOrCreateCVE } from "../Cves/Cves.service";
import PatchCVEsModel from "./PatchCVEs.model";

export const updateOrCreatePatchCVe = async (patchCVE, cve, client) => {
  const PatchCVEInDB = await PatchCVEsModel.findOne({
    where: { patch_id: patchCVE.patch_id, cve_id: patchCVE.cve_id },
  });
  if (PatchCVEInDB) {
    await PatchCVEsModel.update(patchCVE, {
      where: {
        id: PatchCVEInDB.id,
      },
    });
  } else {
    await PatchCVEsModel.create(patchCVE);
    // await addEventLog(
    //   {
    //     id: client?.client_id,
    //     email: client?.client_email,
    //     ipAddress: client?.ipAddress,
    //     process: `A new tag "${tagLabel}" assigned successfully`,
    //     user_id: null,
    //     asset_id: assetTag.asset_id,
    //     company_id: client?.company_id,
    //     isSystemLog: false,
    //   },
    //   TagAssignToAsset.status.TagAssignToAssetSuccessfully.code,
    //   null
    // );
    console.log(`A new cve "${cve}" get successfully`);
  }
  return true;
};
export const updateOrCreatePatchCVEs = async (
  cves,
  patch_id,
  client
) => {
  for await (const cve of cves) {
    const cveInDB = await updateOrCreateCVE(cve, client);
    if (cveInDB) {
     await updateOrCreatePatchCVe(
        { cve_id: cveInDB.id, patch_id },
        cveInDB.cve,
        client
      );
    }
  }
  return true;
};
