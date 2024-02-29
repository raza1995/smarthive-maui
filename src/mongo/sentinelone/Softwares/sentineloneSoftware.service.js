import { CliProgressBar } from "../../../utils/cliProgressBar";
import { errorHandler } from "../../../utils/errorHandler";
import sentineloneSoftwareModel from "./sentineloneSoftware.model";

export const updateOrCreate = async (items, company_id) => {
    try {
      let i = 0;
      const startTime = new Date();
      for await (const item of items) {
        await sentineloneSoftwareModel.updateOne(
          { id: item.id, company_id },
          { ...item, company_id },
          { new: true, upsert: true }
        );
        CliProgressBar(
          `Automox device software saving  for company Id ${company_id} `,
          i,
          items.length,
          startTime
        );
        i++;
      }
      return true;
    } catch (err) {
      errorHandler(err);
      return false;
    }
  };