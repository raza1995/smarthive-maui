import { StatusCodes } from "http-status-codes";
import { getVendors } from "./Vendors.service";

export const getVendorsController = async (req, res) => {
  const { size, page } = req.query;
  const filter = JSON.parse(req.query?.filter || JSON.stringify({}));
  const { Vendors, totalCount } = await getVendors(size, page, filter);
  res.status(StatusCodes.OK).json({ Vendors, totalCount });
};
