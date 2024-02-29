import { secretsTypes } from "../../utils/constants";
import SecretsTypesModel from "./SecretsTypes.model";

export const createSecretsTypes = () => {
  secretsTypes.forEach((type) => {
    SecretsTypesModel.findOrCreate({ where: { type }, default: { type } });
  });
};
