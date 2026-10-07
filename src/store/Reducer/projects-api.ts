import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import { workspacesApi, type Workspace } from "@/store/Reducer/workspaces-api";
import type { ListQuery, Page } from "@/store/types";

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  desc: string;
  status: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  created: number;
};

export type ProjectList = Page<Project> & {
  workspace: Workspace;
};

export type ProjectInput = {
  name: string;
  desc: string;
};

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    listProjects: builder.query<ProjectList, { workspaceId: string } & ListQuery>({
      query: ({ workspaceId, page = 1, limit = 20, keyword }) => ({
        url: API_ROUTES.WORKSPACE_PROJECTS(workspaceId),
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: (_result, _error, { workspaceId }) => [{ type: "Project", id: workspaceId }],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => API_ROUTES.PROJECT(id),
      providesTags: (result) =>
        result
          ? [
              { type: "Project", id: result.id },
              { type: "Project", id: result.workspaceId },
            ]
          : [],
    }),
    createProject: builder.mutation<Project, { workspaceId: string } & ProjectInput>({
      query: ({ workspaceId, ...body }) => ({ url: API_ROUTES.WORKSPACE_PROJECTS(workspaceId), method: "POST", body }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "Project", id: workspaceId }],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          workspacesApi.util.invalidateTags([
            { type: "Audit", id: workspaceId },
            { type: "Workspace", id: "LIST" },
            { type: "Workspace", id: workspaceId },
          ]),
        );
      },
    }),
    updateProject: builder.mutation<Project, { id: string; workspaceId: string } & ProjectInput>({
      query: ({ id, ...body }) => ({ url: API_ROUTES.PROJECT(id), method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id, workspaceId }) => [
        { type: "Project", id },
        { type: "Project", id: workspaceId },
      ],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(workspacesApi.util.invalidateTags([{ type: "Audit", id: workspaceId }]));
      },
    }),
    deleteProject: builder.mutation<void, { id: string; workspaceId: string }>({
      query: ({ id }) => ({ url: API_ROUTES.PROJECT(id), method: "DELETE", responseHandler: "text" }),
      invalidatesTags: (_result, _error, { id, workspaceId }) => [
        { type: "Project", id },
        { type: "Project", id: workspaceId },
      ],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          workspacesApi.util.invalidateTags([
            { type: "Audit", id: workspaceId },
            { type: "Workspace", id: "LIST" },
            { type: "Workspace", id: workspaceId },
          ]),
        );
      },
    }),
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
