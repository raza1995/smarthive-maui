import * as yup from "yup";

export const userSendInviteApiPayload = yup.object().shape({
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

export const partnerSendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        company_id: yup.string().required(),
        invited_from: yup.string().required(),
        invited_to: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const partnerCompanySendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        address: yup.string().required(),
        company_id: yup.string().required(),
        company_name: yup.string().required(),
        industry: yup.string().required(),
        invited_from: yup.string().required(),
        invited_to: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const companyUserSendInviteApiPayload = yup.object().shape({
    data: yup.object().shape({
        company_id: yup.string().required(),
        invited_from: yup.string().required(),
        inviting_emails: yup.array(yup.string()).required(),
        role: yup.string().required(),
        role_permissions: yup.array(yup.object()).required(),
    }),
});

export const companyUserUpdateStatusApiPayload = yup.object().shape({
    is_active: yup.boolean().required(),
});

export const companyUserUpdateApiPayload = yup.object().shape({
    name: yup.string().required(),
    role: yup.string().required(),
    role_permissions: yup.array(yup.object()).required(),
});