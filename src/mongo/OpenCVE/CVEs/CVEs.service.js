import { getOpenCVEDetailById, getOpenCVEsList } from "../ApiServices";
import openCVEsModel from "./CVEs.model";

export const getOpenCVEs = async () => {
  let apiCallCount = 0;
  const get = async (page) => {
    console.log({ page });
    const CVEsList = await getOpenCVEsList(page).then((resp) => resp.data);
    apiCallCount++;
    for await (const cve of CVEsList) {
      const detail = (await getOpenCVEDetailById(cve.id)).data;
      apiCallCount++;
      console.log(cve.id);
      await openCVEsModel.updateOne(
        { cve_id: cve.id },
        {
          cve_id: cve.id,
          summary: cve.summary,
          detail,
        },
        {
          upsert: true,
        }
      );
    }
    if (CVEsList.length === 20) {
      console.log(apiCallCount);
      await get(page + 1);
    } else console.log("Total cve fetched", 20 * (page - 1) + CVEsList.length);
  };
  await get(1);
};
