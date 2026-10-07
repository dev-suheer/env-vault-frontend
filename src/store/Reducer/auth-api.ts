import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "pm" | "dev";
  phone: string;
  image: string | null;
  status: boolean;
  created: number | null;
  lastLogin: number | null;
  lastDevice: string | null;
  logins: number[];
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupArgs = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "pm" | "dev";
};

export type ForgotResponse = {
  email: string;
  code: string;
  expiresAt: number;
};

export type VerifyResetResponse = {
  resetToken: string;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: API_ROUTES.LOGIN, method: "POST", body }),
    }),
    signup: builder.mutation<AuthResponse, SignupArgs>({
      query: (body) => ({ url: API_ROUTES.SIGNUP, method: "POST", body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: API_ROUTES.LOGOUT, method: "POST", responseHandler: "text" }),
    }),
    me: builder.query<AuthUser, void>({
      query: () => ({ url: API_ROUTES.ME, method: "GET" }),
      providesTags: ["auth"],
    }),
    forgot: builder.mutation<ForgotResponse, { email: string }>({
      query: (body) => ({ url: API_ROUTES.FORGOT, method: "POST", body }),
    }),
    verifyReset: builder.mutation<VerifyResetResponse, { email: string; code: string }>({
      query: (body) => ({ url: API_ROUTES.FORGOT_VERIFY, method: "POST", body }),
    }),
    finishReset: builder.mutation<void, { resetToken: string; password: string }>({
      query: (body) => ({ url: API_ROUTES.FORGOT_RESET, method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useMeQuery,
  useForgotMutation,
  useVerifyResetMutation,
  useFinishResetMutation,
} = authApi;
