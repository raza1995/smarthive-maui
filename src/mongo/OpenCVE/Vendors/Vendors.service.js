import { errorHandler } from "../../../utils/errorHandler";
import {
  getOpenCVEVendorsDetailByName,
  getOpenCVEVendorsList,
} from "../ApiServices";
import openCVEsModel from "./Vendors.model";

export const getOpenCVEsVendors = async () => {
  let apiCallCount = 0;
  const get = async (page) => {
    const VendorsList = await getOpenCVEVendorsList(page).then(
      (resp) => resp.data
    );
    apiCallCount++;
    console.log({page});
    for await (const vender of VendorsList) {
      try {
        console.log({ name: vender.name });
        const detail = (await getOpenCVEVendorsDetailByName(vender.name)).data;
        apiCallCount++;
        await openCVEsModel.updateOne({ name: vender.name }, detail, {
          upsert: true,
        });
      } catch (err) {
        errorHandler(err);
      }
    }
    if (VendorsList.length === 20) {
      console.log(apiCallCount);
      await get(page + 1);
    } else console.log("Total Venders fetched", 20 * (page - 1) + VendorsList.length);
  };
  await get(1);
};
