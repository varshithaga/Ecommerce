import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import MasterUserDropdown from "../../components/Header/MasterUserDropdown";
import { createApiUrl, getAuthHeaders } from "../../access/access";

const MasterHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(createApiUrl('api/notifications/'), { headers });
      if (response.ok) {
        const data = await response.json();
        const notifs = data.results || data;
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access')) {
      fetchNotifications();
    }

    const interval = setInterval(() => {
      if (localStorage.getItem('access')) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleNotification = () => {
    const newState = !isNotificationOpen;
    setIsNotificationOpen(newState);
    if (newState) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(createApiUrl('api/notifications/mark_all_read/'), {
        method: 'POST',
        headers
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {/* Cross Icon */}
          </button>

          <Link to="/" className="lg:hidden flex items-center">
            <span className="font-bold text-lg text-gray-900 dark:text-white">E-Commerce</span>
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>


        </div>
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            <div className="relative">
              <button
                onClick={handleToggleNotification}
                className="relative items-center justify-center p-2.5 text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                title="Notifications"
              >
                <svg className="fill-current w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0003 2.91666C7.37699 2.91666 5.25033 5.04331 5.25033 7.66666V9.92723C5.25033 10.3926 5.08745 10.8427 4.78921 11.1957C4.19539 11.8986 3.66804 12.6841 3.5222 13.5593C3.47545 13.84 3.56839 14.1245 3.76678 14.3387C3.96518 14.553 4.24641 14.6726 4.53106 14.6667H15.4696C15.7543 14.6726 16.0355 14.553 16.2339 14.3387C16.4323 14.1245 16.5252 13.84 16.4785 13.5593C16.3326 12.6841 15.8053 11.8986 15.2115 11.1957C14.9132 10.8427 14.7503 10.3926 14.7503 9.92723V7.66666C14.7503 5.04331 12.6237 2.91666 10.0003 2.91666ZM3.78255 7.66666C3.78255 4.23233 6.566 1.44888 10.0003 1.44888C13.4347 1.44888 16.2181 4.23233 16.2181 7.66666V9.92723C16.2181 10.0514 16.2615 10.1714 16.341 10.2655C17.0622 11.1187 17.6534 12.0076 17.8285 13.0583C17.9622 13.8611 17.6963 14.6749 17.129 15.2854C16.5617 15.8959 15.758 16.2384 14.9442 16.2222H5.05652C4.24268 16.2384 3.43899 15.8959 2.87169 15.2854C2.30438 14.6749 2.03852 13.8611 2.17217 13.0583C2.34732 12.0076 2.93855 11.1187 3.65968 10.2655C3.73919 10.1714 3.78255 10.0514 3.78255 9.92723V7.66666Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.74935 17.045C8.01639 16.8122 8.42168 16.84 8.65449 17.107C8.89569 17.382 9.38787 17.75 10.001 17.75C10.6141 17.75 11.1063 17.382 11.3475 17.107C11.5803 16.84 11.9856 16.8122 12.2526 17.045C12.5197 17.2778 12.5475 17.6831 12.3147 17.9502C11.8399 18.4905 11.0264 19.2178 10.001 19.2178C8.97555 19.2178 8.16213 18.4905 7.68731 17.9502C7.4545 17.6831 7.48229 17.2778 7.74935 17.045Z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-md border-2 border-white dark:border-gray-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase tracking-widest transition-colors">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center bg-white dark:bg-gray-900">
                        <p className="text-xs font-bold text-gray-400">All caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map((notif: any) => (
                          <div key={notif.id} className={`p-4 transition-colors ${notif.is_read ? 'bg-white dark:bg-gray-900' : 'bg-brand-50/50 dark:bg-brand-500/5'}`}>
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <p className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-1">{notif.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{notif.body}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {!notif.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5"></span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* <!-- User Area --> */}
          <MasterUserDropdown />
        </div>
      </div>
    </header>
  );
};

export default MasterHeader;
