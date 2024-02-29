import { Op } from "sequelize";
import patchingPoliciesSQLModel from "../../Mysql/PatchingPolicy/patchingPolicy.model";
import {
  applyPatchesByAssetId,
  getPolicyDevices,
} from "../../Mysql/AssetPatches/assetPatch.service";
import patchSQLModel from "../../Mysql/Patch/patch.model";
import softwareSQLModel from "../../Mysql/Softwares/softwares.model";
import softwarePackagesQLModel from "../../Mysql/SoftwarePackages/softwarePackages.model";
import assetSoftwareSQLModel from "../../Mysql/AssetSoftwares/assetSoftware.model";

const handleBinary = (schedule, time) => {
  const data = {
    months: [
      { value: "0", label: "Jan" },
      { value: "0", label: "Feb" },
      { value: "0", label: "Mar" },
      { value: "0", label: "Apr" },
      { value: "0", label: "May" },
      { value: "0", label: "Jun" },
      { value: "0", label: "Jul" },
      { value: "0", label: "Aug" },
      { value: "0", label: "Sep" },
      { value: "0", label: "Oct" },
      { value: "0", label: "Nov" },
      { value: "0", label: "Dec" },
    ],
    weeks: [
      { value: "0", label: "1st" },
      { value: "0", label: "2nd" },
      { value: "0", label: "3rd" },
      { value: "0", label: "4th" },
    ],
    day: [
      { value: "0", label: "Mon" },
      { value: "0", label: "Tue" },
      { value: "0", label: "Wed" },
      { value: "0", label: "Thu" },
      { value: "0", label: "Fri" },
      { value: "0", label: "Sat" },
      { value: "0", label: "Sun" },
    ],
  };
  const selectedData = schedule
    ?.toString()
    ?.padStart(data[time].length + 1, "0");
  const selected = schedule
    ?.toString()
    ?.padStart(data[time].length + 1, "0")
    .split("");
  selected?.pop();
  selected?.reverse();
  data[time]?.forEach((item, index) => {
    data[time][index].value = selected?.[index];
  });
  return data[time];
};

function convertToBinary(x) {
  let bin = 0;
  let rem;
  let i = 1;
  const step = 1;
  while (x !== 0) {
    rem = x % 2;
    x = parseInt(x / 2, 10);
    bin += rem * i;
    i *= 10;
  }
  return bin;
}
function getRelativeDayInWeek(d, dy) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : dy); // adjust when day is sunday
  return new Date(d.setDate(diff));
}
function getDateArray(months, weeks, days) {
  const array = [];
  months.forEach((month, m) => {
    if (month.value === "1") {
      weeks.forEach((week, w) => {
        if (week.value === "1") {
          let startDay = 1;
          if (week.label === "1st") {
            startDay = 1;
          } else if (week.label === "2nd") {
            startDay = 8;
          } else if (week.label === "3rd") {
            startDay = 15;
          } else if (week.label === "4th") {
            startDay = 22;
          } else if (week.label === "5th") {
            startDay = 29;
          }
          days.forEach((day, d) => {
            if (day.value === "1") {
              const currentYear = new Date().getFullYear();
              let lm = m + 1;
              lm = `0${lm}`.slice(-2);
              const ld = `0${startDay}`.slice(-2);
              const date = `${lm}-${ld}-${currentYear}`;
              const finalDate = getRelativeDayInWeek(date, d + 1);
              let fd = finalDate.getDate();
              fd = `0${fd}`.slice(-2);
              let fm = finalDate.getMonth() + 1;
              fm = `0${fm}`.slice(-2);
              const fy = finalDate.getFullYear();
              const lastDate = `${fd}-${fm}-${fy}`;
              array.push(lastDate);
            }
          });
        }
      });
    }
  });
  return array;
}

export const patchingCron = async (req, res) => {
  if (res) {
    res.send("Cron Running Successfully");
  }
  const policyDatas = await patchingPoliciesSQLModel.findAll({
    where: {
      status: "Active",
    },
  });
  if (policyDatas.length > 0) {
    policyDatas.forEach(async (policyData) => {
      if (
        policyData?.configuration?.device_filters_enabled ||
        policyData?.server_groups.length > 0
      ) {
        console.log("policyData.id", policyData.id);
        const months = handleBinary(
          convertToBinary(policyData?.schedule_months),
          "months"
        );
        const day = handleBinary(
          convertToBinary(policyData?.schedule_days),
          "day"
        );
        const weeks = handleBinary(
          convertToBinary(policyData?.schedule_weeks_of_month),
          "weeks"
        );
        const datesArray = getDateArray(months, weeks, day);
        const date = new Date();
        const todayMonth = `0${date.getMonth() + 1}`.slice(-2);
        const todayDay = `0${date.getDate()}`.slice(-2);
        const todayYear = date.getFullYear();
        const finalDate = `${todayDay}-${todayMonth}-${todayYear}`;
        const finalArray = datesArray.filter((item) => {
          if (item === finalDate) {
            return item;
          }
          return false;
        });
        const deviceList = await getPolicyDevices(policyData.id);
        const utcStr = new Date();

        const currentHours = `0${utcStr.getUTCHours()}`.slice(-2);
        const currentMinutes = `0${utcStr.getUTCMinutes()}`.slice(-2);
        const currentTime = `${currentHours}:${currentMinutes}`;
        // console.log(deviceList)
        if (finalArray.length > 0 && currentTime === policyData.schedule_time) {
          deviceList?.forEach(async (device) => {
            const filterObj = {};
            const softwarePackagefilterObj = {};
            if (policyData?.configuration?.patch_rule === "all") {
              // filterObj = {}
            } else if (policyData?.configuration?.patch_rule !== "all") {
              if (policyData?.configuration?.filter_type === "severity") {
                filterObj.severity = policyData?.configuration?.severity_filter;
              } else if (policyData?.configuration?.filter_type === "exclude") {
                softwarePackagefilterObj.id = {
                  [Op.in]: policyData?.configuration?.patch_ids,
                };
              } else if (policyData?.configuration?.filter_type === "include") {
                softwarePackagefilterObj.id = {
                  [Op.notIn]: policyData?.configuration?.patch_ids,
                };
              }
            }

            const assetPatches = await assetSoftwareSQLModel.findAll({
              where: {
                asset_id: device.id,
              },
              include: [
                {
                  model: softwareSQLModel,
                },
                {
                  model: softwarePackagesQLModel,
                  where: softwarePackagefilterObj,
                  include: [
                    {
                      model: patchSQLModel,
                      where: filterObj,
                      required: true,
                    },
                  ],
                },
              ],
              nest: true,
              raw: true,
            });
            console.log("device", device.asset_name);
            // console.log("assetPatches", assetPatches)

            await applyPatchesByAssetId(device.id, assetPatches, policyData, {
              client_id: null,
              isSystemLog: true,
              company_id: policyData?.company_id,
            });
          });
        }
        console.log("datesArray", datesArray);
        console.log("finalArray", finalArray);
      }
    });
  }
};
