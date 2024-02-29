import {
  NotificationMessage,
  NotificationRedirectLink,
} from "../../utils/constants";
import NotificationModel from "./notification.model";

export const getNotification = async (user) => {
  try {
    const response = await NotificationModel.findAll({
      where: { for: user.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
};
export const updateNotification = async (id, data) => {
  try {
    const response = await NotificationModel.update(data, { where: { id } });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
};
export const addNotification = async (id, user, type) => {
  try {
    const data = {
      for: id,
      type,
      action_from_id: user.id,
      action_from_name: user.full_name,
      heading: NotificationMessage(user, type).heading,
      message: NotificationMessage(user, type).message,
      redirectLink: NotificationRedirectLink[type] || "",
    };

    const response = await NotificationModel.create(data);
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
};

const notificationsService = { getNotification, addNotification };
export default notificationsService;
