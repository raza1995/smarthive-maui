
export const inviteUserActivity = {
    label: "Create user invitation",
    code: "3011",
    status: {
      createUserInvitationSuccessfully: {
        label: "User invitation created successfully",
        code: "3011200",
        status: "success",
        severity: "low",
      },
      createUserInvitationFailed: {
        label: "User invitation failed",
        code: "3011400",
        status: "failed",
        severity: "High",
        errorReason: {},
      },
    },
  };
  export const deleteUserInvitationActivity = {
    label: "Delete user invitation",
    code: "3012",
    status: {
      userDeletedSuccessfully: {
        label: "User invitation deleted successfully",
        code: "3012200",
        status: "success",
        severity: "low",
      },
      userDeletingFailed: {
        label: "User invitation Deletion failed",
        code: "3012400",
        status: "failed",
        severity: "High",
        errorReason: {},
      },
    },
  };
  export const updateUserInvitationActivity = {
    label: "Update User invitation",
    code: "3013",
    status: {
      userUpdatedSuccessfully: {
        label: "update user invitation successfully",
        code: "3013200",
        status: "success",
        severity: "low",
      },
      userUpdatingFailed: {
        label: "user invitation updating failed",
        code: "3013400",
        status: "failed",
        severity: "High",
        errorReason: {},
      },
    },
  };
  export const getUserInvitationActivity = {
    label: "Get User invitation",
    code: "3014",
    status: {
      getUserInvitationSuccessfully: {
        label: "User invitation Get successfully",
        code: "3014200",
        status: "success",
        severity: "informational",
      },
      getUserInvitationFailed: {
        label: "getting user invitation failed",
        code: "3014400",
        status: "failed",
        severity: "Medium",
        errorReason: {
          userEmailExist: "Email address is already exist in database",
        },
      },
    },
  };

  export const userCreateActivity = {
    label: "Create user",
    code: "3001",
    status: {
      userCreatedSuccessfully: {
        label: "User created successfully",
        code: "3001200",
        status: "success",
        severity: "High",
      },
      userCreationFailed: {
        label: "User created failed",
        code: "3001400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "Email address is already exist in database",
        },
      },
    },
  };
  export const userDeleteActivity = {
    label: "Delete user",
    code: "3003",
    status: {
      userDeletedSuccessfully: {
        label: "User deleted successfully",
        code: "3003200",
        status: "success",
        severity: "high",
      },
      userDeletingFailed: {
        label: "User Deletion failed",
        code: "3003400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "Email address is already exist in database",
        },
      },
    },
  };
  export const userUpdateActivity = {
    label: "Update User",
    code: "3002",
    status: {
      userUpdatedSuccessfully: {
        label: "User updated successfully",
        code: "3002200",
        status: "success",
        severity: "medium",
      },
      userUpdatingFailed: {
        label: "User updating failed",
        code: "3002400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "Email address is already exist in database",
        },
      },
    },
  };
  export const getUserActivity = {
    label: "Get User",
    code: "3004",
    status: {
      userGetSuccessfully: {
        label: "User Get successfully",
        code: "3004200",
        status: "success",
        severity: "informational",
      },
      gettingUserFailed: {
        label: "getting user failed",
        code: "3004400",
        status: "failed",
        severity: "Medium",
        errorReason: {
          userEmailExist: "Email address is already exist in database",
        },
      },
    },
  };
  

  export const getResilenceDashboard = {
    label: "View Resilence Dashboard",
    code: "3201",
    status: {
      resilenceDashboardGetSuccessfully: {
        label: "Resilence Dashboard data fetched successfully",
        code: "3201200",
        status: "success",
        severity: "informational",
      },
      resilenceDashboardGetFailed: {
        label: "Resilence Dashboard data fetched failed",
        code: "3201400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "",
        },
      },
    },
  };
  
  export const getSoftwares = {
    label: "Get Softwares",
    code: "3202",
    status: {
      softwareGetSuccessfully: {
        label: "Software data fetched successfully",
        code: "3202200",
        status: "success",
        severity: "informational",
      },
      softwareGetFailed: {
        label: "Software data fetched failed",
        code: "3202400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "",
        },
      },
    },
  };
  
  export const getAssetDetail = {
    label: "Get Asset Detail",
    code: "3203",
    status: {
      assetGetSuccessfully: {
        label: "Asset data fetched successfully",
        code: "3203200",
        status: "success",
        severity: "informational",
      },
      assetGetFailed: {
        label: "Asset data fetched failed",
        code: "3203400",
        status: "failed",
        severity: "High",
        errorReason: {
          userEmailExist: "",
        },
      },
    },
  };

const userActivities={
    userCreateActivity,
    userDeleteActivity,
    userUpdateActivity,
    getUserActivity,
    inviteUserActivity,
    deleteUserInvitationActivity,
    updateUserInvitationActivity,
    getUserInvitationActivity,
    getResilenceDashboard,
    getSoftwares,
    getAssetDetail,
}
export default userActivities