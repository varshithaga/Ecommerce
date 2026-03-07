import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../access/access";

// 🔹 Fetch all notifications for a specific user
export const getNotifications = async (user_id: string) => {
    const url = createApiUrl(`api/notifications/?user_id=${user_id}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data.results || response.data;
};

// 🔹 Fetch only unread notifications
export const getUnreadNotifications = async (user_id: string) => {
    const data = await getNotifications(user_id);
    const notifs = data.results || data;
    return notifs.filter((n: any) => !n.is_read);
};

// 🔹 Mark all as read
export const markAllNotificationsRead = async () => {
    const url = createApiUrl(`api/notifications/mark_all_read/`);
    const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
    return response.data;
};

// 🔹 Mark a single notification as read
export const markNotificationRead = async (notificationId: number) => {
    const url = createApiUrl(`api/notifications/${notificationId}/mark_as_read/`);
    const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
    return response.data;
};
