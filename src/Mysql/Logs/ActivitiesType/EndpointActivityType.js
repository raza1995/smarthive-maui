// get endpoint assets list
export const getEndpointAssetList = {
  label: "Get Endpoint Asset List",
  code: "5100",
  status: {
    getEndpointAssetListSuccess: {
      label: "Endpoint Asset List Get successfully",
      code: "5100200",
      status: "success",
      severity: "Medium",
    },
    getEndpointAssetListFailed: {
      label: "Endpoint Asset List Get failed",
      code: "5100400",
      status: "failed",
      severity: "Medium",
    },
  },
};

// get endpoint assets
export const GetEndpointAsset = {
  label: "Get Endpoint Asset",
  code: "5101",
  status: {
    getEndpointAssetSuccess: {
      label: "Endpoint Asset Get successfully",
      code: "5101200",
      status: "success",
      severity: "Medium",
    },
    getEndpointAssetFailed: {
      label: "Endpoint Asset Get failed",
      code: "5101400",
      status: "failed",
      severity: "Medium",
    },
  },
};

// endpoint overview logs
export const endPointOverview = {
  label: "Get Endpoint Overview Data",
  code: "5102",
  status: {
    getEndpointOverviewSuccess: {
      label: "Endpoint Overview Data Get successfully",
      code: "5102200",
      status: "success",
      severity: "Medium",
    },
    getEndpointOverviewFailed: {
      label: "Endpoint Overview Data Get failed",
      code: "5102400",
      status: "failed",
      severity: "Medium",
    },
  },
};

// get endpoint assets list
export const createEndpointAssetInfo = {
  label: "Create Endpoint asset info",
  code: "5104",
  status: {
    createEndpointAssetInfoSuccess: {
      label: "Create Endpoint asset info successfully",
      code: "5104200",
      status: "success",
      severity: null,
    },
    createEndpointAssetInfoFailed: {
      label: "Create Endpoint asset info failed",
      code: "5104400",
      status: "failed",
      severity: "High",
    },
  },
};

// get endpoint assets list
export const updateEndpointAssetInfo = {
  label: "Update Endpoint asset info",
  code: "5107",
  status: {
    updateEndpointAssetInfoSuccess: {
      label: "Updated Endpoint asset info successfully",
      code: "5107200",
      status: "success",
      severity: null,
    },
    updateEndpointAssetInfoFailed: {
      label: "Updating Endpoint asset info failed",
      code: "5107400",
      status: "failed",
      severity: "High",
    },
  },
};

export const assetsEndpointScoreUpdateActivity = {
  label: "Asset Endpoint score Update",
  code: "5122",
  status: {
    assetScoreUpdatedSuccessfully: {
      label: "Asset Endpoint score updated successfully",
      code: "5122200",
      status: "success",
      severity: null,
    },
    assetScoreUpdatingFailed: {
      label: "Asset Endpoint score updating failed",
      code: "5122400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
const EndpointActivity = {
  assetsEndpointScoreUpdateActivity,
  getEndpointAssetList,
  GetEndpointAsset,
  endPointOverview,
  createEndpointAssetInfo,
  updateEndpointAssetInfo,
};

export default EndpointActivity;
