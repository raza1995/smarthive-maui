import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
// import AssetPropertySQLModel from "./assetProperty.model";
import { findUserOAuthId } from "../Users/users.service";
import AssetDetailModel from "./assetDetail.model";


export const updateAssetDetail = async (req, res) => {
  try {
    const {user} = req;
    const payload = req.body;
    const { id } = req.params;
    const data = {
      custom_name: payload.name,
      custom_location: payload.location,
    };
    await AssetDetailModel.update(data, {
      where: {
        asset_id: id,
        company_id: user.company_id,
      },
    });

    res.status(200).json({ message: "success" });
  } catch (err) {
    errorHandler(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err, message: err.message });
  }
};
