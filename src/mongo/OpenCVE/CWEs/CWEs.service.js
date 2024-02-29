import { getOpenCveCWEsList } from "../ApiServices";
import openCveCWEsModel from "./CWEs.model";

export const getOpenCWEs = async () => {
  let apiCallCount = 0;
  const get = async (page) => {
    console.log({ page });
    const CWEsList = await getOpenCveCWEsList(page).then((resp) => resp.data);
    apiCallCount++;
    for await (const cwe of CWEsList) {
      console.log({ name: cwe.name });
      await openCveCWEsModel.updateOne(
        { cwe_id: cwe.id },
        {
          cwe_id: cwe.id,
          name: cwe.name,
          description: cwe.description,
        },
        {
          upsert: true,
        }
      );
    }
    if (CWEsList.length === 20) {
      console.log(apiCallCount);
      await get(page + 1);
    } else console.log("Total CWEs fetched", 20 * (page - 1) + CWEsList.length);
  };
  await get(1);
};
