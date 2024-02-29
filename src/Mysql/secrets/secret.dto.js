import * as yup from "yup";

export const createSecretApiPayload = yup.object().shape({
  name: yup.string().required(),
  secrets: yup.string().required(),
  secrets_type: yup.string().required(),
});

export const shareSecretApiPayload = yup.object().shape({
  secret_id: yup.string().required(),
  users: yup.array(yup.object()).required(),
});
