import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01FreeIcons,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Menu01Icon,
  MultiplicationSignIcon,
} from "@hugeicons/core-free-icons";
import { useAuthStore } from "../../state/useAuthStore";

function Header() {
  const [activeTab, setActiveTab] = useState("Home");
  const [showServices, setShowServices] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuthStore((state) => ({
    user: state.user,
    role: state.role,
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
  }));

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
    } else if (role === "client") {
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
    } else if (role === "cleaner") {
      return [
        { name: "My Jobs", link: "/my-jobs" },
        { name: "Earnings", link: "/earnings" },
        { name: "Profile", link: "/profile" },
      ];
    }

    return [];
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setShowServices(!showServices);
  };

  const handleSelect = (subItem) => {
    setActiveTab(subItem.name);
    setShowServices(false);
    setMobileMenuOpen(false);
    navigate(subItem.link);
  };

  const handleNavClick = (item) => {
    setActiveTab(item.name);
    setMobileMenuOpen(false);
    navigate(item.link);
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    setActiveTab("Home");
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showServices) setShowServices(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showServices]);

  return (
    <nav className="w-full bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Logo + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#C85344] transition-colors"
            >
              <HugeiconsIcon
                icon={mobileMenuOpen ? MultiplicationSignIcon : Menu01Icon}
                className="w-6 h-6"
              />
            </button>

            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => setActiveTab("Home")}
              className="flex items-center"
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto sm:h-10" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {getNavItems().map((item, index) => {
              if (item.dropdown) {
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownClick(e);
                      }}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === item.name 
                          ? "text-[#C85344] bg-red-50" 
                          : "text-gray-700 hover:text-[#C85344] hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.name}</span>
                      <HugeiconsIcon
                        icon={showServices ? ArrowUp01Icon : ArrowDown01Icon}
                        className="w-4 h-4"
                      />
                    </button>

                    {showServices && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {item.dropdown.map((subItem, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelect(subItem)}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                activeTab === subItem.name
                                  ? "bg-[#C85344] text-white"
                                  : "text-gray-700 hover:bg-[#C85344] hover:text-white"
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
                  onClick={() => handleNavClick(item)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.name
                      ? "text-[#C85344] bg-red-50"
                      : "text-gray-700 hover:text-[#C85344] hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Notification + Login/User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon - Always visible on mobile and desktop */}
            {!isAuthenticated && (
              <button className="p-2 text-gray-600 hover:text-[#C85344] transition-colors">
                <HugeiconsIcon icon={Notification01FreeIcons} className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Login Buttons / User Profile */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              {!isAuthenticated ? (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 bg-[#C85344] text-white rounded-md text-sm font-medium hover:bg-[#b54538] transition-colors"
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
                  className="px-3 py-1.5 bg-[#C85344] text-white rounded-md text-sm font-medium hover:bg-[#b54538] transition-colors"
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
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg absolute top-16 left-0 right-0">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getNavItems().map((item, index) => {
                if (item.dropdown) {
                  return (
                    <div key={index} className="space-y-1">
                      <button
                        onClick={handleDropdownClick}
                        className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          activeTab === item.name
                            ? "text-[#C85344] bg-red-50"
                            : "text-gray-700 hover:text-[#C85344] hover:bg-gray-50"
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
                              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                activeTab === subItem.name
                                  ? "bg-[#C85344] text-white"
                                  : "text-gray-700 hover:bg-[#C85344] hover:text-white"
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
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeTab === item.name
                        ? "text-[#C85344] bg-red-50"
                        : "text-gray-700 hover:text-[#C85344] hover:bg-gray-50"
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
