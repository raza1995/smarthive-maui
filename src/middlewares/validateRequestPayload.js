import { StatusCodes } from "http-status-codes";

const validateRequestPayload = (payload) => async (req, res, next) => {
  try {
    await payload.validate(req.body);
    next();
  } catch (e) {
    return res.status(StatusCodes.BAD_GATEWAY).json({message:e.message});
  }
};
export default validateRequestPayload;
