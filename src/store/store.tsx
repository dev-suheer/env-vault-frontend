"use client";

import { useState, type ReactNode } from "react";
import { combineReducers, configureStore, createAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { authApi } from "@/store/Reducer/auth-api";
import { dashboardApi } from "@/store/Reducer/dashboard-api";
import { envsApi } from "@/store/Reducer/envs-api";
import { invitesApi } from "@/store/Reducer/invites-api";
import { projectsApi } from "@/store/Reducer/projects-api";
import { usersApi } from "@/store/Reducer/users-api";
import { workspacesApi } from "@/store/Reducer/workspaces-api";
import { hydrateUser, userSlice } from "@/store/slice/userSlice";

export const resetStore = createAction("RESET_STORE");

const appReducer = combineReducers({
  userSlice: userSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [workspacesApi.reducerPath]: workspacesApi.reducer,
  [projectsApi.reducerPath]: projectsApi.reducer,
  [envsApi.reducerPath]: envsApi.reducer,
  [invitesApi.reducerPath]: invitesApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) =>
  appReducer(action.type === resetStore.type ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      workspacesApi.middleware,
      projectsApi.middleware,
      envsApi.middleware,
      invitesApi.middleware,
      dashboardApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;

export function StoreProvider({ children }: { children: ReactNode }) {
  useState(() => {
    if (typeof window !== "undefined") store.dispatch(hydrateUser());
    return true;
  });
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
