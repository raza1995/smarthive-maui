export const sendMagicLinkActivity = {
  label: "Send Magic Link",
  code: "1002",
  status: {
    MagicLinkSentSuccessfully: {
      label: "Magic Link Sent Successfully",
      code: "1002200",
      status: "success",
      severity: "informational",
    },
    MagicLinkSendingFailed: {
      label: "Magic Link Sending process failed",
      code: "1002403",
      severity: "medium",
      status: "failed",
      errorReason: {
        userNotFound: "User not found to send magic link",
        userNotVerified: "Account of user in not verified",
      },
    },
  },
};
export const sendOTPonMobileActivity = {
  label: "Send OTP on mobile",
  code: "1003",
  status: {
    OtpSentSuccessfully: {
      label: "OTP Sent on mobile Successfully",
      code: "1003200",
      status: "success",
      severity: "informational",
    },
    otpSendingFailed: {
      label: "OTP Sending process failed",
      code: "1003403",
      severity: "medium",
      status: "failed",
      errorReason: {
        userNotFound: "User not found to send OTP",
        userNotVerified: "Account of user in not verified",
      },
    },
  },
};

export const AuthenticationActivity = {
  label: "Authentication",
  code: "1001",
  status: {
    authenticationSuccessfully: {
      label: "Authentication Successfully",
      code: "1001200",
      status: "success",
      severity: "high",
    },
    authenticationFailed: {
      label: "Authentication Failed",
      code: "1001401",
      status: "failed",
      severity: "High",
      errorReason: {
        userNotFound: "User not found to send magic link",
        userNotVerified: "Account of user in not verified",
      },
    },
  },
};

export const signUpActivity = {
  label: "signUp",
  code: "1004",
  status: {
    signUpSuccessfully: {
      label: "Successfully SignUp",
      code: "1004200",
      status: "success",
      severity: "informational",
    },
    signUpFailed: {
      label: "Sign Up failed",
      code: "1004403",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "Email address is already exist in database",
        userPhoneNumberExist: "Phone number is already exist in database",
        userNotVerified: "Account of user in not verified",
      },
    },
  },
};

const authActivities = {
  sendMagicLink: sendMagicLinkActivity,
  sendOTPonMobile: sendOTPonMobileActivity,
  Authentication: AuthenticationActivity,
  signUp: signUpActivity,
};
export default authActivities;
