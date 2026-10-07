import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import { workspacesApi } from "@/store/Reducer/workspaces-api";
import type { ListQuery, Page } from "@/store/types";

export type Notification = {
  id: string;
  kind: "invite" | "info";
  status: string | null;
  read: boolean;
  at: number;
  text: string | null;
  access: "view" | "edit" | null;
  toUserId: string;
  toEmail: string;
  fromUserId: string | null;
  fromEmail: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
};

export type InviteResult = {
  status: "joined" | "declined" | "missing";
  workspaceId: string | null;
  name: string | null;
};

export const invitesApi = createApi({
  reducerPath: "invitesApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    listNotifications: builder.query<Page<Notification>, ListQuery | void>({
      query: ({ page = 1, limit = 50, keyword } = {}) => ({
        url: API_ROUTES.NOTIFICATIONS,
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: ["Notification"],
    }),
    inviteMember: builder.mutation<Notification, { workspaceId: string; email: string; access: "view" | "edit" }>({
      query: ({ workspaceId, ...body }) => ({ url: API_ROUTES.WORKSPACE_INVITES(workspaceId), method: "POST", body }),
      invalidatesTags: ["Notification"],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(workspacesApi.util.invalidateTags([{ type: "Audit", id: workspaceId }]));
      },
    }),
    cancelInvite: builder.mutation<void, { id: string; workspaceId: string }>({
      query: ({ id }) => ({ url: API_ROUTES.INVITE(id), method: "DELETE", responseHandler: "text" }),
      invalidatesTags: ["Notification"],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(workspacesApi.util.invalidateTags([{ type: "Audit", id: workspaceId }]));
      },
    }),
    respondInvite: builder.mutation<InviteResult, { id: string; accept: boolean }>({
      query: ({ id, accept }) => ({ url: API_ROUTES.INVITE_RESPOND(id), method: "POST", body: { accept } }),
      invalidatesTags: ["Notification"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled;
        if (result.data.workspaceId) {
          dispatch(
            workspacesApi.util.invalidateTags([
              { type: "Workspace", id: "LIST" },
              { type: "Workspace", id: result.data.workspaceId },
              { type: "Audit", id: result.data.workspaceId },
            ]),
          );
        }
      },
    }),
    removeMember: builder.mutation<void, { workspaceId: string; userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: API_ROUTES.WORKSPACE_MEMBER(workspaceId, userId),
        method: "DELETE",
        responseHandler: "text",
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          workspacesApi.util.invalidateTags([
            { type: "Workspace", id: workspaceId },
            { type: "Workspace", id: "LIST" },
            { type: "Audit", id: workspaceId },
          ]),
        );
      },
    }),
    setMemberAccess: builder.mutation<void, { workspaceId: string; userId: string; access: "view" | "edit" }>({
      query: ({ workspaceId, userId, access }) => ({
        url: API_ROUTES.WORKSPACE_MEMBER(workspaceId, userId),
        method: "PATCH",
        body: { access },
        responseHandler: "text",
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          workspacesApi.util.invalidateTags([
            { type: "Workspace", id: workspaceId },
            { type: "Audit", id: workspaceId },
          ]),
        );
      },
    }),
    markNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: API_ROUTES.NOTIFICATIONS_READ, method: "POST", responseHandler: "text" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useInviteMemberMutation,
  useCancelInviteMutation,
  useRespondInviteMutation,
  useRemoveMemberMutation,
  useSetMemberAccessMutation,
  useMarkNotificationsReadMutation,
} = invitesApi;
