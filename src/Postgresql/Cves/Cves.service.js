import CVEsModel from "./Cves.model";

export const updateOrCreateCVE = async (cve, client) => {
  const tagInDB = await CVEsModel.findOne({
    where: { cve },
  });

  if (tagInDB?.id) {
    return tagInDB;
  }
  // eslint-disable-next-line no-return-await
  return await CVEsModel.create({ cve }).then(
    (resp) =>
      // addEventLog(
      //   {
      //     id: client?.client_id,
      //     email: client?.client_email,
      //     ipAddress: client.ipAddress,
      //     process: `New tag created`,
      //     user_id: null,
      //     company_id: tag.company_id,
      //     isSystemLog: false,
      //   },
      //   TagCreated.status.TagCreatedSuccessfully.code,
      //   null
      // );
      resp
  );
};
