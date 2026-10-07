import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import type { ListQuery, Page } from "@/store/types";
import type { Workspace as VaultWorkspace } from "@/lib/types";

export type WorkspaceMember = {
  id: string;
  email: string;
  name: string;
  access: "view" | "edit";
};

export type Workspace = {
  id: string;
  name: string;
  desc: string;
  status: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  members: WorkspaceMember[];
  projectCount: number;
  created: number;
};

export type AuditEntry = {
  id: string;
  workspaceId: string;
  at: number;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  subject: string;
  detail: string;
};

export type WorkspaceInput = {
  name: string;
  desc: string;
};

const LIST = "LIST";

export const workspacesApi = createApi({
  reducerPath: "workspacesApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["Workspace", "Audit"],
  endpoints: (builder) => ({
    listWorkspaces: builder.query<Page<Workspace>, ListQuery | void>({
      query: ({ page = 1, limit = 20, keyword } = {}) => ({
        url: API_ROUTES.WORKSPACES,
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: [{ type: "Workspace", id: LIST }],
    }),
    getWorkspace: builder.query<Workspace, string>({
      query: (id) => API_ROUTES.WORKSPACE(id),
      providesTags: (_result, _error, id) => [{ type: "Workspace", id }],
    }),
    createWorkspace: builder.mutation<Workspace, WorkspaceInput>({
      query: (body) => ({ url: API_ROUTES.WORKSPACES, method: "POST", body }),
      invalidatesTags: [{ type: "Workspace", id: LIST }],
    }),
    updateWorkspace: builder.mutation<Workspace, { id: string } & WorkspaceInput>({
      query: ({ id, ...body }) => ({ url: API_ROUTES.WORKSPACE(id), method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Workspace", id },
        { type: "Workspace", id: LIST },
        { type: "Audit", id },
      ],
    }),
    deleteWorkspace: builder.mutation<void, string>({
      query: (id) => ({ url: API_ROUTES.WORKSPACE(id), method: "DELETE", responseHandler: "text" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Workspace", id },
        { type: "Workspace", id: LIST },
      ],
    }),
    listAudit: builder.query<Page<AuditEntry>, { workspaceId: string } & ListQuery>({
      query: ({ workspaceId, page = 1, limit = 20, keyword }) => ({
        url: API_ROUTES.WORKSPACE_AUDIT(workspaceId),
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: (_result, _error, { workspaceId }) => [{ type: "Audit", id: workspaceId }],
    }),
  }),
});

export const {
  useListWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useListAuditQuery,
} = workspacesApi;

export function canManageWorkspace(me: { role: string; email: string }, workspace: { ownerEmail: string }) {
  return me.role === "admin" || me.email === workspace.ownerEmail;
}

export function asVaultWorkspace(workspace: Workspace): VaultWorkspace {
  return {
    id: workspace.id,
    name: workspace.name,
    desc: workspace.desc,
    pm: workspace.ownerEmail,
    members: workspace.members.map((member) => member.email),
    editors: workspace.members.filter((member) => member.access === "edit").map((member) => member.email),
    created: workspace.created,
  };
}
