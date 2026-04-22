import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ─────────────────────────────────────────────
// TODO: Load user profile:
//   const { data } = await convex.query(api.users.profile, { userId })
//   initUser(data)
// TODO: updateUser → convex.mutation(api.users.update, { userId, ...fields })
// TODO: Auth with phone OTP:
//   const { error } = await convex.action(api.auth.sendOtp, { phone })
//   const { data, error } = await convex.action(api.auth.verifyOtp, { phone, otp })
// ─────────────────────────────────────────────────────────────────────────────

// ─── Languages ───────────────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: "en",    label: "English" },
  { code: "hi",    label: "हिन्दी (Hindi)" },
  { code: "ta",    label: "தமிழ் (Tamil)" },
  { code: "te",    label: "తెలుగు (Telugu)" },
  { code: "bn",    label: "বাংলা (Bengali)" },
  { code: "mr",    label: "मराठी (Marathi)" },
  { code: "kn",    label: "ಕನ್ನಡ (Kannada)" },
];

// Empty default — profile setup page populates real data
const DEFAULT_USER = {
  id: null,
  name: "",
  firstName: "",
  initials: "",
  gender: "",
  bloodGroup: "",
  dob: "",
  age: null,
  phone: "",
  email: "",
  height: null,
  weight: null,
  conditions: [],
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  address: "",
  healthId: "",
  abhaId: null,
  notifications: true,
  darkMode: false,
  biometricLock: false,
  preferredLanguage: "en",
  profileComplete: false,
};

export const useUserStore = create((set, get) => ({
  user: { ...DEFAULT_USER },

  updateUser: (fields) =>
    set((state) => ({
      user: { ...state.user, ...fields },
    })),

  setLanguage: (code) =>
    set((state) => ({
      user: { ...state.user, preferredLanguage: code },
    })),

  setNotifications: (val) =>
    set((state) => ({
      user: { ...state.user, notifications: val },
    })),

  setDarkMode: (val) =>
    set((state) => ({
      user: { ...state.user, darkMode: val },
    })),

  setBiometricLock: (val) =>
    set((state) => ({
      user: { ...state.user, biometricLock: val },
    })),
}));
