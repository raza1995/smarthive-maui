import { errorHandler } from "../../utils/errorHandler";
import { onlyUnique } from "../Assets/asset.controller";
import patchingtGroupsSQLModel from "../PatchingGroups/patchingGroups.model";
import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import PolicyGroupsSQLModel from "./PolicyGroups.model";

export const savePolicyGroupData = async (
  company_id,
  server_groups,
  policy_id
) => {
  try {
    const policy = await patchingPoliciesSQLModel.findOne({
      where: { id:policy_id, company_id },
    });
    // Destroy old records
    await PolicyGroupsSQLModel.destroy({
      where: { company_id, patching_policy_id: policy_id },
    });

    if (server_groups.length > 0) {
      server_groups.map(async (item) => {
        console.log("group item", item);
        await patchingtGroupsSQLModel
          .findOne({
            where: { id: item },
          })
          .then(async (group) => {
            if (group !== null) {
              const data = {
                patching_group_id: group.id,
                patching_policy_id: policy.id,
                company_id,
              };
              await PolicyGroupsSQLModel.create(data);
            }
          });
      });
    }
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

export const updatePoliciesToGroups = async (company_id) => {
  try {
    await patchingtGroupsSQLModel
      .findAll({
        where: {
          company_id,
        },
        attributes: ["id"],
      })
      .then((data) => {
        if (data !== null && data.length > 0) {
          data.map(async (item) => {
            console.log("itemitemitemitemitemitem", item?.id);
            await PolicyGroupsSQLModel.findAll({
              where: {
                patching_group_id: item?.id,
              },
              include: [
                {
                  model: patchingPoliciesSQLModel,
                  required: true,
                  attributes: ["policy_id"],
                },
              ],
              attributes: ["id"],
            }).then(async (ppid) => {
              const array = [];
              if (ppid !== null && ppid.length > 0) {
                ppid.forEach((ppidItem) => {
                  if (ppidItem?.patching_policy?.policy_id) {
                    array.push(ppidItem?.patching_policy?.policy_id);
                  }
                  // console.log("item", item?.patching_policy?.policy_id)
                });
              }
              console.log("array", array);
              const unique = array.filter(onlyUnique);
              patchingtGroupsSQLModel.update(
                {
                  policies: unique,
                },
                {
                  where: {
                    id: item?.id,
                  },
                }
              );
            });
          });
        }
      });
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
