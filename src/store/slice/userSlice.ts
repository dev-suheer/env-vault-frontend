import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "pm" | "dev";
  phone: string;
  image: string | null;
  status: boolean;
  token: string;
};

const STORAGE_KEY = "user";

function readUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export const userSlice = createSlice({
  name: "user",
  initialState: { user: null as SessionUser | null },
  reducers: {
    setUser: (state, action: PayloadAction<SessionUser>) => {
      state.user = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    hydrateUser: (state) => {
      state.user = readUser();
    },
  },
});

export const { setUser, logout, hydrateUser } = userSlice.actions;
