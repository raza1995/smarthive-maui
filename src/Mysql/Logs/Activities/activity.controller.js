/* eslint-disable guard-for-in */
import { errorHandler } from "../../../utils/errorHandler";
import activityCategoryModel from "../ActivityCategories/activityCategories.model";
import activityStatusModel from "../activityStatus/activityStatus.model";
import { activitiesData } from "../logsConstant";
import activityModel from "./activity.madel";

const updateOrCreateActivity = async (category_id, items) => {
  try {
    let i = 1;
    for await (const item of items) {
      // await activityModel.create({ category_id: category_id, ...item }, { include: [{ model: activityStatusModel }] });

      const activity = await activityModel.findOne({
        where: { code: item.code },
      });
      if (activity) {
        await activityModel.update(item, {
          where: {
            id: activity.id,
          },
        });
        for await (const status of item.logs_activity_statuses) {
          const activeStatus = await activityStatusModel.findOne({
            where: { activity_id: activity.id, code: status.code },
          });
          if (activeStatus.id) {
            await activityStatusModel.update(status, {
              where: {
                id: activeStatus.id,
              },
            });
          } else {
            await activityStatusModel.create({
              activity_id: activity.id,
              ...status,
            });
          }
        }
      } else {
        await activityModel.create(
          { category_id, ...item },
          { include: [{ model: activityStatusModel }] }
        );
        console.log(`     ${i}. Logs New Activity "${item.label}" created`);
        i++;
      }
    }

    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const updateOrCreateLogsCatagories = async (item) => {
  try {
    const activityCategory = await activityCategoryModel.findOne({
      where: { code: item.code },
    });
    if (activityCategory) {
      await activityCategory.update(
        { label: item.label, code: item.code },
        { where: { if: activityCategory.id } }
      );

      await updateOrCreateActivity(activityCategory.id, item.logs_activities);
    } else {
      const newActivityCategory = await activityCategoryModel.create(item);
      console.log(
        `************ Logs New Category "${item.label}" created ************************`
      );
      await updateOrCreateActivity(
        newActivityCategory.id,
        item.logs_activities
      );
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const createActivities = async () => {
  // await activityCategoryModel.destroy({ where: {} })
  for (const categoryKey in activitiesData) {
    const category = activitiesData[categoryKey];
    const logs_activities = [];
    for (const activityKey in category.activities) {
      const statusObj = category.activities[activityKey].status;
      const status = [];
      for (const statusKey in statusObj) {
        status.push({
          label: statusObj[statusKey].label,
          code: statusObj[statusKey].code,
          status: statusObj[statusKey].status,
          severity: statusObj[statusKey].severity,
        });
      }
      logs_activities.push({
        label: category.activities[activityKey].label,
        code: category.activities[activityKey].code,
        logs_activity_statuses: status,
      });
    }
    await updateOrCreateLogsCatagories({
      label: category.label,
      code: category.code,
      logs_activities,
    });
  }
};
