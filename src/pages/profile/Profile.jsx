import React, { useEffect, useState } from "react";
import { authApi } from "../../services/authApi";
import { userApi } from "../../services/userApi";
import { useAuthStore } from "../../state/useAuthStore";

function Profile() {
  const setUserInStore = useAuthStore((s) => s.setUser);
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    setIsLoading(true);
    userApi
      .getProfile()
      .then((res) => {
        const profile = res?.data || res;
        const merged = {
          ...profile,
          avatar:
            profile?.profileImage ||
            profile?.profileImageUrl ||
            profile?.avatar ||
            "",
        };
        setUser(merged);
        setTempUser(merged);
        setUserInStore(merged);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not load profile. Please try again.";
        if (msg?.toLowerCase().includes("only client can access")) {
          // Suppress role-specific noise on profile page
          setError("");
        } else {
          setError(msg);
        }
      })
      .finally(() => setIsLoading(false));
  }, [setUserInStore]);

  const handleChange = (field, value) => {
    setTempUser((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!tempUser) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        fullName: tempUser.fullName || tempUser.name,
        phoneNumber: tempUser.phoneNumber || tempUser.phone,
        address: tempUser.address,
      };
      const res = await userApi.updateProfile(payload);
      const updated = res?.data || res;
      const merged = {
        ...updated,
        avatar:
          updated?.profileImage ||
          updated?.profileImageUrl ||
          updated?.avatar ||
          tempUser.avatar,
      };
      setUser(merged);
      setTempUser(merged);
      setUserInStore(merged);
      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not update profile. Please try again.";
      if (!msg?.toLowerCase().includes("only client can access")) {
        setError(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempUser(user);
    setPhotoPreview(null);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
    setSuccess("");
    setIsUploading(true);
    try {
      const updated = await userApi.uploadProfilePhoto(file);
      const profileImage =
        updated?.profileImage || updated?.profileImageUrl || updated?.avatar;
      const merged = { ...(user || {}), ...updated, avatar: profileImage, profileImage };
      setUser(merged);
      setTempUser(merged);
      setUserInStore(merged);
      setPhotoPreview(null);
      setSuccess("Profile photo updated.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not upload photo. Please try again."
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      const message =
        res?.message ||
        "Password changed successfully. Please login again with your new password.";
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(message);
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-5 text-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-5 text-center text-red-500">
        {error || "Profile not found."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-6">
      <div className="bg-gradient-to-r from-[#fde7e1] to-white border border-[#f6d5ce] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {photoPreview || user?.avatar ? (
              <img
                src={photoPreview || user.avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#C85344] text-white flex items-center justify-center text-xl font-semibold border border-white shadow-md">
                {(user?.fullName || user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 border border-gray-200 shadow cursor-pointer hover:text-[#C85344]">
              {isUploading ? "..." : "Change"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhotoPreview(URL.createObjectURL(file));
                    handlePhotoChange(e);
                  }
                }}
              />
            </label>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C85344]">Account</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Profile</h1>
            <p className="text-gray-600">{user.role ? user.role.toUpperCase() : "User"}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#C85344] text-white rounded-lg text-sm hover:bg-[#b84335] transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {(error || success) && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            error
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={tempUser?.fullName || tempUser?.name || ""}
              disabled={!isEditing}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={`p-3 rounded-lg border ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-[#C85344]/30`}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
            <input
              type="email"
              value={tempUser?.email || ""}
              disabled
              className="p-3 rounded-lg border border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={tempUser?.phoneNumber || tempUser?.phone || ""}
              disabled={!isEditing}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className={`p-3 rounded-lg border ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-[#C85344]/30`}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={tempUser?.address || ""}
              disabled={!isEditing}
              onChange={(e) => handleChange("address", e.target.value)}
              className={`p-3 rounded-lg border ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-[#C85344]/30`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[#C85344] text-white rounded-lg hover:bg-[#b84335] transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C85344]">Security</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">Change Password</h2>
        </div>

        {(passwordError || passwordSuccess) && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              passwordError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {passwordError || passwordSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C85344]/30"
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C85344]/30"
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordFieldChange("confirmPassword", e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C85344]/30"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="px-4 py-2 bg-[#C85344] text-white rounded-lg hover:bg-[#b84335] transition disabled:opacity-60"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
