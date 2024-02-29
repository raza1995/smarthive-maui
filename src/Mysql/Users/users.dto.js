import * as yup from "yup";

export const userUpdateStatusApiPayload = yup.object().shape({
    is_active: yup.boolean().required(),
});

export const companyUserUpdateApiPayload = yup.object().shape({
    name: yup.string().required(),
    role: yup.string().required(),
    role_permissions: yup.array(yup.object()).required(),
});