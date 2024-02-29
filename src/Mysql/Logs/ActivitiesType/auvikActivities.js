export const getAuvikDeviceActivity = {
  label: "Get Auvik device",
  code: "4011",
  status: {
    getAuvikDeviceSuccessfully: {
      label: "Auvik device Get successfully",
      code: "4011200",
      status: "success",
      severity: "informational",
    },
    getAuvikDeviceFailed: {
      label: "getting Auvik device failed",
      code: "4011400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAuvikDeviceLifeCycleActivity = {
  label: "Get Auvik device life cycle",
  code: "4012",
  status: {
    getAuvikDeviceLifeCycleSuccessfully: {
      label: "Auvik device  life cycle get successfully",
      code: "4012200",
      status: "success",
      severity: "informational",
    },
    getAuvikDeviceLifeCycleFailed: {
      label: "getting Auvik device life cycle failed",
      code: "4012400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const getAuvikDeviceWarrantyActivity = {
  label: "Get Auvik device Warranty",
  code: "4013",
  status: {
    getAuvikDeviceLifeCycleSuccessfully: {
      label: "Auvik device  Warranty get successfully",
      code: "4013200",
      status: "success",
      severity: null,
    },
    getAuvikDeviceLifeCycleFailed: {
      label: "getting Auvik device Warranty failed",
      code: "4013400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};
export const getAuvikDeviceDetailsActivity = {
  label: "Get Auvik device Details",
  code: "4014",
  status: {
    getAuvikDeviceDetailsSuccessfully: {
      label: "Auvik device  Details get successfully",
      code: "4014200",
      status: "success",
      severity: null,
    },
    getAuvikDeviceDetailsFailed: {
      label: "getting Auvik device Details failed",
      code: "4014400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

const auvikActivities = {
  getAuvikDeviceActivity,
  getAuvikDeviceLifeCycleActivity,
  getAuvikDeviceWarrantyActivity,
  getAuvikDeviceDetailsActivity,
};

export default auvikActivities;
