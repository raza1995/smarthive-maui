import * as yup from "yup";

export const userSendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});