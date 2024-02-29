import { CliProgressBar } from "../../../utils/cliProgressBar";
import { errorHandler } from "../../../utils/errorHandler";
import sentinelOneAgentModel from "./agents.model";

export const updateOrCreateSentinelOneAgents = async (items, company_id) => {
  try {
    let i = 0;
    const startTime = new Date();
    for await (const item of items) {
       await sentinelOneAgentModel.updateOne(
        { id: item.id, company_id },
        { ...item, company_id, createdAtOnSource: item.createdAt },
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
