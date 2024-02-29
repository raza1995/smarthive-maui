import activityModel from "./Activities/activity.madel";
import activityCategoryModel from "./ActivityCategories/activityCategories.model";
import eventLogsModel from "./eventLogs/eventLogs.model";
import eventPayloadModel from "./eventPayload/eventPayload.model";
import activityStatusModel from "./activityStatus/activityStatus.model";
import { createActivities } from "./Activities/activity.controller";

const syncLogsTables = async (options) => {
  await activityCategoryModel.sync(options).then((res) => {
    console.log("Activity categories table created");
  });
  await activityModel.sync(options).then(() => {
    console.log("activity table created");
  });
  await activityStatusModel.sync(options).then(() => {
    console.log("event Status table created");
  });
  await eventLogsModel.sync(options).then(() => {
    console.log("event logs table created");
  });
  await eventPayloadModel.sync(options).then(() => {
    console.log("event payloads table created");
  });
  await createActivities();
};
export default syncLogsTables;
