import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import type { AuthUser } from "@/store/Reducer/auth-api";
import type { ListQuery, Page } from "@/store/types";

export type UserPage = Page<AuthUser> & {
  counts: {
    all: number;
    projectManagers: number;
    devs: number;
  };
};

export type UserRole = "admin" | "pm" | "dev";

export type UserWorkspace = {
  id: string;
  name: string;
  access: "owner" | "edit" | "view";
  members: number;
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["profile", "User"],
  endpoints: (builder) => ({
    updateProfile: builder.mutation<AuthUser, { name: string; phone: string }>({
      query: (body) => ({ url: API_ROUTES.PROFILE, method: "PATCH", body }),
      invalidatesTags: ["profile"],
    }),
    changePassword: builder.mutation<void, { current: string; next: string }>({
      query: (body) => ({ url: API_ROUTES.PASSWORD, method: "POST", body, responseHandler: "text" }),
    }),
    listUsers: builder.query<UserPage, (ListQuery & { role?: "pm" | "dev"; status?: boolean }) | void>({
      query: ({ page = 1, limit = 20, keyword, role, status } = {}) => ({
        url: API_ROUTES.USERS,
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(role ? { role } : {}),
          ...(status === undefined ? {} : { status }),
        },
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getUser: builder.query<AuthUser, string>({
      query: (id) => API_ROUTES.USER(id),
      providesTags: (result) => (result ? [{ type: "User", id: result.id }] : []),
    }),
    listUserWorkspaces: builder.query<Page<UserWorkspace>, { userId: string } & ListQuery>({
      query: ({ userId, page = 1, limit = 20, keyword }) => ({
        url: API_ROUTES.USER_WORKSPACES(userId),
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: (_result, _error, { userId }) => [{ type: "User", id: `${userId}-workspaces` }],
    }),
    updateUser: builder.mutation<AuthUser, { id: string; name: string; role: UserRole; status: boolean }>({
      query: ({ id, ...body }) => ({ url: API_ROUTES.USER(id), method: "PATCH", body }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "User", id: result.id },
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useListUsersQuery,
  useGetUserQuery,
  useListUserWorkspacesQuery,
  useUpdateUserMutation,
} = usersApi;
