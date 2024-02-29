import { getUserSecretsAndLinkAssetsToSecrets } from "../AssetsSecrets/AssetsSecrets.service";
import { getHumanById } from "../Human/human.service";
import { updateRiskScore } from "../HumanRiskScores/humanRiskScore.service";
import humanAssetsSQLModel from "./humanAssets.model";
import { createUpdateHumanAsset, deleteHumanAssetRelation } from "./humanAssets.service";

export const addHumanAssetRelation = async (req, res) => {
  try {
    const {user} = req;
    const { id } = req.params;
    const { body } = req;
    const { assetIds } = body;
    const clientDetails = {
      id: user.id,
      user_id:user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Create Human Asset Relation",
      company_id: user.company_id,
      target_id: id,
      isSystemLog: false,
      effected_table: humanAssetsSQLModel.tableName
    };
    // Delete Old Relation
    await humanAssetsSQLModel.destroy({
      where: {
        human_id: id,
      },
    });
    // Add New Relation
    for await (const item of assetIds) {
      await createUpdateHumanAsset(id, item, user.company_id, clientDetails);
    }

    // update human score
    const human = await getHumanById(id);
    await updateRiskScore(user.company_id, human, {
      id: user?.id,
      email: user?.email,
      full_name: user?.full_name,
      ipAddress: req.socket.remoteAddress,
      company_id: user.company_id,
    });
    getUserSecretsAndLinkAssetsToSecrets(human.user_id)
    res.status(200).json({
      valid: true,
      message: "Assets assign successfully.",
    });
  } catch (err) {
    return err.message;
  }
};

export const removeHumanAssetRelation = async (req, res) => {
  try {
    const {user} = req;
    const { id } = req.params;
    const { body } = req;
    const { assetIds } = body;
    const clientDetails = {
      id: user.id,
      user_id:user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Remove Human Asset Relation",
      company_id: user.company_id,
      target_id: id,
      isSystemLog: false,
      effected_table: humanAssetsSQLModel.tableName
    };
    await deleteHumanAssetRelation(id, assetIds, clientDetails)

    // update human score
    const human = await getHumanById(id);
    await updateRiskScore(user.company_id, human, {
      id: user?.id,
      email: user?.email,
      full_name: user?.full_name,
      ipAddress: req.socket.remoteAddress,
      company_id: user.company_id,
    });
    getUserSecretsAndLinkAssetsToSecrets(human.user_id)
    res.status(200).json({
      valid: true,
      message: "Assets unassign successfully.",
    });
  } catch (err) {
    return err.message;
  }
};
