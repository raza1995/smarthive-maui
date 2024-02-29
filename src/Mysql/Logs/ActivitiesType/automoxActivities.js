export const getAutomoxDeviceActivity = {
  label: "Get Automox device",
  code: "4021",
  status: {
    getAutomoxDeviceSuccessfully: {
      label: "Automox device get successfully",
      code: "4021200",
      status: "success",
      severity: null,
    },
    getAutomoxDeviceFailed: {
      label: "Getting Automox device failed",
      code: "4021400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAutomoxDeviceReportsActivity = {
  label: "Get Automox device Reports",
  code: "4022",
  status: {
    getAutomoxDeviceReportsSuccessfully: {
      label: "Automox device reports get successfully",
      code: "4022200",
      status: "success",
      severity: null,
    },
    getAutomoxDeviceReportsFailed: {
      label: "Getting Automox device reports failed",
      code: "4022400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAutomoxDeviceSoftwareActivity = {
  label: "Get Automox device softwares",
  code: "4023",
  status: {
    getAutomoxDeviceSoftwareSuccessfully: {
      label: "Automox device softwares get successfully",
      code: "4023200",
      status: "success",
      severity: null,
    },
    getAutomoxDeviceSoftwareFailed: {
      label: "Getting Automox softwares reports failed",
      code: "4023400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAutomoxDevicePoliciesActivity = {
  label: "Get Automox Policies",
  code: "4024",
  status: {
    getAutomoxDevicePoliciesSuccessfully: {
      label: "Automox Policies get successfully",
      code: "4024200",
      status: "success",
      severity: null,
    },
    getAutomoxDevicePoliciesFailed: {
      label: "Getting Automox Policies failed",
      code: "4024400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAutomoxDeviceGroupsActivity = {
  label: "Get Automox Groups",
  code: "4025",
  status: {
    getAutomoxDeviceGroupsSuccessfully: {
      label: "Automox Groups get successfully",
      code: "4025200",
      status: "success",
      severity: null,
    },
    getAutomoxDeviceGroupsFailed: {
      label: "getting Automox Groups failed",
      code: "4025400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

const automoxActivities = {
  getAutomoxDeviceActivity,
  getAutomoxDeviceGroupsActivity,
  getAutomoxDevicePoliciesActivity,
  getAutomoxDeviceReportsActivity,
  getAutomoxDeviceSoftwareActivity,
};
export default automoxActivities;
