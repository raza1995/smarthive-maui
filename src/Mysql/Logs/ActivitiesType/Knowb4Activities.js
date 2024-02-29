export const getKnowb4UsersActivity = {
  label: "Get Knowb4 users",
  code: "9701",
  status: {
    getKnowb4UsersSuccessfully: {
      label: "Knowb4 users get successfully",
      code: "9701200",
      status: "success",
      severity: null,
    },
    getKnowb4UsersFailed: {
      label: "Getting Knowb4 users failed",
      code: "9701400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};



const knowb4Activities = {
    getKnowb4UsersActivity,
}

const Knowb4ActivityCategory = {
  label: "Knowb4 Activity Category",
  code: 9700,
  activities:  knowb4Activities,
};

export default Knowb4ActivityCategory;