import { Types } from "mongoose";

export const findQuery = (idParam, paramKey) => {
  const hex = /[0-9A-Fa-f]{6}/g;
  const q = hex.test(idParam)
    ? { _id: new Types.ObjectId(idParam) }
    : { id: idParam };
  const params = paramKey || "type";
  return {
    $or: [{ id: idParam }, { [params]: idParam }, q],
  };
};
