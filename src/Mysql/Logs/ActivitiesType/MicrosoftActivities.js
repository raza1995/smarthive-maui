export const getMicrosoftUsersActivity = {
  label: "Get Microsoft users",
  code: "9601",
  status: {
    getMicrosoftUsersSuccessfully: {
      label: "Microsoft users get successfully",
      code: "9601200",
      status: "success",
      severity: null,
    },
    getMicrosoftUsersFailed: {
      label: "Getting Microsoft users failed",
      code: "9601400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getMicrosoftDevicesActivity = {
  label: "Get Microsoft Devices",
  code: "9602",
  status: {
    getMicrosoftDevicesSuccessfully: {
      label: "Microsoft devices get successfully",
      code: "9602200",
      status: "success",
      severity: null,
    },
    getMicrosoftDevicesFailed: {
      label: "Getting Microsoft devices failed",
      code: "9602400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};
export const getMicrosoftDeviceSoftwaresActivity = {
  label: "Get Microsoft Device Softwares",
  code: "9603",
  status: {
    getMicrosoftDeviceSoftwaresSuccessfully: {
      label: "Microsoft device softwares get successfully",
      code: "9603200",
      status: "success",
      severity: null,
    },
    getMicrosoftDeviceSoftwaresFailed: {
      label: "Getting Microsoft device softwares failed",
      code: "9603400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};


const microsoftActivities = {
    getMicrosoftUsersActivity,
    getMicrosoftDevicesActivity,
    getMicrosoftDeviceSoftwaresActivity
}

const MicrosoftActivityCategory = {
  label: "Microsoft Activity Category",
  code: 9600,
  activities:  microsoftActivities,
};

export default MicrosoftActivityCategory;