import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01FreeIcons,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Menu01Icon,
  MultiplicationSignIcon,
} from "@hugeicons/core-free-icons";
import superflyLogo from "../../assets/superfly-logo.svg";
import { useAuthStore } from "../../state/useAuthStore";
import { useRealtimeNotificationStore } from "../../state/useRealtimeNotificationStore";

function Header() {
  const [showServices, setShowServices] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuthStore((state) => ({
    user: state.user,
    role: state.role,
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
  }));
  const notifications = useRealtimeNotificationStore((state) => state.notifications);
  const markAsRead = useRealtimeNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useRealtimeNotificationStore((state) => state.markAllAsRead);
  const normalizedRole = (role || "").toLowerCase();
  const hasNotificationCenter =
    isAuthenticated &&
    (normalizedRole === "client" || normalizedRole === "cleaner");
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { name: "Home", link: "/" },
        {
          name: "Services",
          dropdown: [
            { name: "Residential Cleaning", link: "/services/residential" },
            { name: "Commercial Cleaning", link: "/services/book-site-visit-commercial" },
            { name: "Post-Construction Cleaning", link: "/services/book-site-visit-post-construction" },
          ],
        },
        { name: "Contact", link: "/contact" },
        { name: "Reviews", link: "/reviews" },
      ];
    } else if (normalizedRole === "client") {
      return [
        { name: "Home", link: "/" },
        {
          name: "Services",
          dropdown: [
            { name: "Residential Cleaning", link: "/services/residential" },
            { name: "Commercial Cleaning", link: "/services/book-site-visit-commercial" },
            { name: "Post-Construction Cleaning", link: "/services/book-site-visit-post-construction" },
          ],
        },
        { name: "Contact", link: "/contact" },
        { name: "My Bookings", link: "/my-booking" },
        { name: "Reviews", link: "/reviews" },
      ];
    } else if (normalizedRole === "cleaner") {
      return [
        { name: "My Jobs", link: "/my-jobs" },
        { name: "Earnings", link: "/earnings" },
        { name: "Profile", link: "/profile" },
      ];
    }

    return [];
  };

  const isRouteActive = (link) => {
    if (!link) return false;
    if (link === "/") return location.pathname === "/";
    return (
      location.pathname === link || location.pathname.startsWith(`${link}/`)
    );
  };

  const isItemActive = (item) => {
    if (item.dropdown) {
      return (
        location.pathname === "/services" ||
        location.pathname.startsWith("/services/")
      );
    }

    return isRouteActive(item.link);
  };

  const closeNavMenus = () => {
    setShowServices(false);
    setMobileMenuOpen(false);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setShowServices(!showServices);
  };

  const handleSelect = (subItem) => {
    closeNavMenus();
    navigate(subItem.link);
  };

  const handleNavClick = (item) => {
    closeNavMenus();
    navigate(item.link);
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    await logout();
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    if (!notification) return;
    markAsRead(notification.id);
    setShowNotifications(false);
    if (!notification.quoteId) return;

    if (normalizedRole === "cleaner") {
      navigate(`/my-jobs/${notification.quoteId}`);
      return;
    }

    if (normalizedRole === "client") {
      navigate(`/my-booking/${notification.quoteId}`);
    }
  };

  const formatNotificationTime = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showServices) setShowServices(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showServices]);

  useEffect(() => {
    if (!showNotifications) return undefined;
    const onDocumentClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [showNotifications]);

  useEffect(() => {
    closeNavMenus();
    setShowNotifications(false);
  }, [location.pathname]);

  return (
    <nav className="navbar-shell sticky top-0 z-50 w-full bg-white/90 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[74px] items-center justify-between">
          {/* Left Section: Logo + Mobile Menu Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl bg-white p-2 text-gray-600 transition hover:text-[#C85344]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <HugeiconsIcon
                icon={mobileMenuOpen ? MultiplicationSignIcon : Menu01Icon}
                className="w-6 h-6"
              />
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={closeNavMenus}
              className="logo-highlight group relative flex items-center gap-3 rounded-2xl bg-white/80 px-2.5 py-1.5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="h-11 w-11 sm:h-12 sm:w-12 overflow-hidden rounded-xl bg-white p-[2px]">
                <img
                  src={superflyLogo}
                  alt="Superfly Logo"
                  className="h-full w-full rounded-[10px] object-cover object-center scale-[1.07] transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-[#a6382a]">
                  Superfly Services
                </p>
                <p className="text-[11px] text-gray-500 group-hover:text-gray-600 transition-colors">
                  Where Clean Takes Flight
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="navbar-track hidden lg:flex lg:items-center lg:gap-2 rounded-2xl bg-white/85 p-1.5">
            {getNavItems().map((item, index) => {
              if (item.dropdown) {
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownClick(e);
                      }}
                      className={`nav-pill flex items-center space-x-1 rounded-xl px-4 py-2 text-sm font-medium ${
                        isItemActive(item)
                          ? "nav-pill-active bg-[#C85344]/10 text-[#C85344]"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#C85344]"
                      }`}
                    >
                      <span className="nav-pill-label">{item.name}</span>
                      <HugeiconsIcon
                        icon={showServices ? ArrowUp01Icon : ArrowDown01Icon}
                        className={`w-4 h-4 transition-transform duration-200 ${showServices ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showServices && (
                      <div className="nav-dropdown-panel absolute top-full left-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur z-50">
                        <div className="py-1">
                          {item.dropdown.map((subItem, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelect(subItem)}
                              className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                isRouteActive(subItem.link)
                                  ? "bg-[#C85344] text-white"
                                  : "text-gray-700 hover:bg-[#fff1ee] hover:text-[#C85344]"
                              }`}
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.link}
                  onClick={closeNavMenus}
                  className={`nav-pill rounded-xl px-4 py-2 text-sm font-medium ${
                    isItemActive(item)
                      ? "nav-pill-active bg-[#C85344]/10 text-[#C85344]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#C85344]"
                  }`}
                >
                  <span className="nav-pill-label">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section: Notification + Login/User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasNotificationCenter && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-xl bg-white p-2 text-gray-600 transition hover:text-[#C85344]"
                  aria-label="Open notifications"
                >
                  <HugeiconsIcon icon={Notification01FreeIcons} className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C85344] px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[330px] max-w-[92vw] rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Notifications
                        </p>
                        <p className="text-xs text-gray-500">
                          {unreadCount} unread
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-[#C85344] hover:text-[#b54538]"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                              notification.isRead ? "bg-white" : "bg-[#fff1ee]"
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              {notification.message}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-500">
                                {notification.quoteId
                                  ? `Booking #${notification.quoteId}`
                                  : "System update"}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Login Buttons / User Profile */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              {!isAuthenticated ? (
                <button
                  onClick={handleLoginClick}
                  className="rounded-xl bg-[#C85344] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b54538]"
                >
                  Login
                </button>
              ) : (
                <UserProfileDropdown user={user} onLogout={handleLogout} />
              )}
            </div>

            {/* Mobile Login Buttons - Only show when not logged in */}
            {!isAuthenticated && (
              <div className="lg:hidden flex items-center space-x-2">
                <button
                  onClick={handleLoginClick}
                  className="rounded-xl bg-[#C85344] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#b54538]"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile User Profile - Show when logged in */}
            {isAuthenticated && (
              <div className="lg:hidden">
                <UserProfileDropdown user={user} onLogout={handleLogout} />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel absolute left-4 right-4 top-[calc(100%+10px)] z-50 rounded-2xl bg-white/95 backdrop-blur lg:hidden">
            <div className="space-y-1 p-3">
              {getNavItems().map((item, index) => {
                if (item.dropdown) {
                  return (
                    <div key={index} className="space-y-1">
                      <button
                        onClick={handleDropdownClick}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                          isItemActive(item)
                            ? "bg-[#C85344]/10 text-[#C85344]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-[#C85344]"
                        }`}
                      >
                        <span>{item.name}</span>
                        <HugeiconsIcon
                          icon={showServices ? ArrowUp01Icon : ArrowDown01Icon}
                          className="w-4 h-4"
                        />
                      </button>

                      {showServices && (
                        <div className="pl-4 space-y-1">
                          {item.dropdown.map((subItem, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelect(subItem)}
                              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                                isRouteActive(subItem.link)
                                  ? "bg-[#C85344] text-white"
                                  : "text-gray-700 hover:bg-[#fff1ee] hover:text-[#C85344]"
                              }`}
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item)}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-base font-medium transition-colors ${
                      isItemActive(item)
                        ? "bg-[#C85344]/10 text-[#C85344]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#C85344]"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function UserProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const displayName = user?.fullName || user?.name || "User";
  const displayRole = user?.role || "client";
  const initial = (displayName || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile-dropdown')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative user-profile-dropdown">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="h-8 w-8 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#C85344] text-white flex items-center justify-center text-sm font-semibold border border-[#e5b3aa]">
            {initial}
          </div>
        )}
        <div className="text-left hidden lg:block">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
        </div>
        <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            My Profile
          </Link>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
