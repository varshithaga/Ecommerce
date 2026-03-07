import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import messaging from "../../firebase";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "./api";

interface NotificationItem {
    id: number;
    title: string;
    body: string;
    created_at?: string;
    is_read: boolean;
}

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const user_id = localStorage.getItem("user_id") || "";
            // if (!user_id) return toast.error("User not found!");

            const data = await getNotifications(user_id);
            const results = data.results || data;
            const backendNotifs = results.map((n: any) => ({
                id: n.id,
                title: n.title,
                body: n.body,
                created_at: n.created_at,
                is_read: n.is_read || false,
            }));

            setNotifications(backendNotifs);
            localStorage.setItem("notifications", JSON.stringify(backendNotifs));
        } catch (error) {
            console.error("❌ Error fetching notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsRead();

            const updated = notifications.map((n) => ({ ...n, is_read: true }));
            setNotifications(updated);
            localStorage.setItem("notifications", JSON.stringify(updated));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("❌ Failed to mark notifications as read:", error);
            toast.error("Unable to mark all as read");
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationRead(id);
            const updated = notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
            );
            setNotifications(updated);
            localStorage.setItem("notifications", JSON.stringify(updated));
            toast.success("Notification marked as read");
        } catch (error) {
            console.error("❌ Failed to mark notification:", error);
            toast.error("Unable to mark as read");
        }
    };

    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload: any) => {
            if (payload.notification?.title && payload.notification?.body) {
                const newNotif: NotificationItem = {
                    id: Date.now(),
                    title: payload.notification.title,
                    body: payload.notification.body,
                    created_at: new Date().toISOString(),
                    is_read: false,
                };
                setNotifications((prev) => {
                    const updated = [newNotif, ...prev];
                    localStorage.setItem("notifications", JSON.stringify(updated));
                    return updated;
                });
                toast.info(`${newNotif.title}: ${newNotif.body}`);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "read") return n.is_read;
        if (filter === "unread") return !n.is_read;
        return true;
    });

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Notifications
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Manage your system alerts and messages
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Filter Dropdown */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:ring-2 focus:ring-brand-500/20"
                    >
                        <option value="all">All Items</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Previously Read</option>
                    </select>

                    {/* Mark All Button */}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-6 py-2.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-100 dark:shadow-none"
                        >
                            Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-20 text-center shadow-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">No notifications found</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">You are all caught up for today</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                            className={`group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden
                ${n.is_read
                                    ? "border-gray-100 bg-white/50 dark:bg-gray-900/50 dark:border-gray-800 text-gray-500"
                                    : "border-brand-500/20 bg-white dark:bg-gray-900 shadow-sm"
                                } hover:border-brand-500/40`}
                        >
                            {!n.is_read && (
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
                            )}

                            <div className="flex justify-between items-start gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-sm font-black uppercase tracking-tight ${n.is_read ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                            {n.title}
                                        </h3>
                                        {!n.is_read && <span className="px-2 py-0.5 bg-brand-50 text-brand-500 text-[8px] font-black uppercase rounded-md tracking-widest">New</span>}
                                    </div>
                                    <p className={`text-xs font-bold leading-relaxed mb-4 ${n.is_read ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {n.body}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(n.created_at || "").toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {!n.is_read && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                                        className="p-3 bg-brand-50 text-brand-500 hover:bg-brand-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                        title="Mark as Read"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="pt-10 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">End of Notifications</p>
                    </div>
                </div>
            )}
        </div>
    );
}
