import userService, { findUserByEmail } from "../Users/users.service";
import notificationsService, {
  updateNotification,
} from "./notification.service";

const notificationController = {
  async getNotifications(req, res) {
    try {
      const loggedInUser = req.user;
      const user = await findUserByEmail(loggedInUser.email);
      const response = await notificationsService.getNotification(user);
      return res.status(200).json(response);
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  async makeNotificationSeen(req, res) {
    try {
      const { id } = req.params;
      if (id) {
        const data = { seen: true };
        const response = await updateNotification(id, data);
        return res.status(200).json(response);
      }
      return res.status(500).json({ message: "undefined" });
    } catch (err) {
      return res.status(500).json(err);
    }
  },
};

export default notificationController;
