import * as yup from "yup";

export const partnerCompanySendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        address: yup.string().required(),
        company_name: yup.string().required(),
        industry: yup.string().required(),
        invited_from: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const partnerUserSendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        company_id: yup.string().required(),
        invited_from: yup.string().required(),
        invited_to: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const partnerCompanyUserSendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        company_id: yup.string().required(),
        invited_from: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const partnerCompanyUserUpdateStatusApiPayload = yup.object().shape({
    is_active: yup.boolean().required(),
});

export const partnerCompanyUserUpdateApiPayload = yup.object().shape({
    name: yup.string().required(),
    role: yup.string().required(),
    role_permissions: yup.array(yup.object()).required(),
});