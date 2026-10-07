import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import type { Project } from "@/store/Reducer/projects-api";
import type { Workspace } from "@/store/Reducer/workspaces-api";
import type { ListQuery, Page } from "@/store/types";

export type EnvKind = "Development" | "Staging" | "Production";

export type EnvVar = {
  id: string;
  k: string;
  v: string;
};

export type EnvFile = {
  id: string;
  name: string;
  desc: string;
  env: EnvKind;
  vars: EnvVar[];
  updated: number;
  status: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  workspaceId: string | null;
  projectId: string | null;
};

export type EnvDetail = EnvFile & {
  workspace: Workspace | null;
  project: Project | null;
};

export type ProjectEnvList = Page<EnvFile> & {
  workspace: Workspace;
  project: Project;
};

export type EnvInput = {
  name: string;
  desc: string;
  env: EnvKind;
};

type EnvListQuery = ListQuery & { env?: EnvKind };

export const envsApi = createApi({
  reducerPath: "envsApi",
  baseQuery: customFetchBaseQuery(),
  tagTypes: ["Env"],
  endpoints: (builder) => ({
    listPersonalEnvs: builder.query<Page<EnvFile>, EnvListQuery | void>({
      query: ({ page = 1, limit = 20, keyword, env } = {}) => ({
        url: API_ROUTES.ENVS,
        params: { page, limit, ...(keyword ? { keyword } : {}), ...(env ? { env } : {}) },
      }),
      providesTags: [{ type: "Env", id: "personal" }],
    }),
    listProjectEnvs: builder.query<ProjectEnvList, { projectId: string } & EnvListQuery>({
      query: ({ projectId, page = 1, limit = 20, keyword, env }) => ({
        url: API_ROUTES.PROJECT_ENVS(projectId),
        params: { page, limit, ...(keyword ? { keyword } : {}), ...(env ? { env } : {}) },
      }),
      providesTags: (_result, _error, { projectId }) => [{ type: "Env", id: `project-${projectId}` }],
    }),
    listUserEnvs: builder.query<Page<EnvFile>, { userId: string } & ListQuery>({
      query: ({ userId, page = 1, limit = 20, keyword }) => ({
        url: API_ROUTES.USER_ENVS(userId),
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      providesTags: (_result, _error, { userId }) => [{ type: "Env", id: `user-${userId}` }],
    }),
    getEnv: builder.query<EnvDetail, string>({
      query: (id) => API_ROUTES.ENV(id),
      providesTags: (result) => (result ? [{ type: "Env", id: result.id }] : []),
    }),
    createPersonalEnv: builder.mutation<EnvDetail, EnvInput>({
      query: (body) => ({ url: API_ROUTES.ENVS, method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedCreatedEnv(dispatch, getState, data, { type: "Env", id: "personal" });
        } catch {
          return;
        }
      },
    }),
    createProjectEnv: builder.mutation<EnvDetail, { projectId: string } & EnvInput>({
      query: ({ projectId, ...body }) => ({ url: API_ROUTES.PROJECT_ENVS(projectId), method: "POST", body }),
      async onQueryStarted({ projectId }, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedCreatedEnv(dispatch, getState, data, { type: "Env", id: `project-${projectId}` });
        } catch {
          return;
        }
      },
    }),
    updateEnv: builder.mutation<EnvFile, { id: string } & EnvInput>({
      query: ({ id, ...body }) => ({ url: API_ROUTES.ENV(id), method: "PATCH", body }),
      invalidatesTags: (result) => envTags(result),
    }),
    deleteEnv: builder.mutation<void, { id: string; projectId: string | null }>({
      query: ({ id }) => ({ url: API_ROUTES.ENV(id), method: "DELETE", responseHandler: "text" }),
      async onQueryStarted({ id, projectId }, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          return;
        }
        const tags = [{ type: "Env" as const, id: "personal" }];
        if (projectId) tags.push({ type: "Env", id: `project-${projectId}` });
        for (const tag of tags) {
          patchEnvLists(dispatch, getState, tag, (draft) => {
            const next = draft.data.filter((item) => item.id !== id);
            if (next.length === draft.data.length) return;
            draft.data = next;
            draft.totalRecords = Math.max(0, draft.totalRecords - 1);
          });
        }
      },
    }),
    upsertVariable: builder.mutation<EnvFile, { id: string; k: string; v: string }>({
      query: ({ id, ...body }) => ({ url: API_ROUTES.ENV_VARIABLES(id), method: "POST", body }),
      invalidatesTags: (result) => envTags(result),
    }),
    removeVariable: builder.mutation<EnvFile, { id: string; key: string }>({
      query: ({ id, key }) => ({ url: API_ROUTES.ENV_VARIABLE(id, key), method: "DELETE" }),
      invalidatesTags: (result) => envTags(result),
    }),
    importVariables: builder.mutation<EnvFile, { id: string; pairs: { k: string; v: string }[] }>({
      query: ({ id, pairs }) => ({ url: API_ROUTES.ENV_IMPORT(id), method: "POST", body: { pairs } }),
      invalidatesTags: (result) => envTags(result),
    }),
  }),
});

function seedCreatedEnv(
  dispatch: (action: unknown) => void,
  getState: () => unknown,
  created: EnvDetail,
  tag: { type: "Env"; id: string },
) {
  dispatch(envsApi.util.upsertQueryData("getEnv", created.id, created));
  patchEnvLists(dispatch, getState, tag, (draft) => {
    if (draft.data.some((item) => item.id === created.id)) return;
    draft.data.unshift(created);
    draft.totalRecords += 1;
  });
}

function patchEnvLists(
  dispatch: (action: unknown) => void,
  getState: () => unknown,
  tag: { type: "Env"; id: string },
  patch: (draft: Page<EnvFile>) => void,
) {
  for (const { endpointName, originalArgs } of envsApi.util.selectInvalidatedBy(getState(), [tag])) {
    if (endpointName === "listProjectEnvs") {
      dispatch(envsApi.util.updateQueryData("listProjectEnvs", originalArgs, patch));
    }
    if (endpointName === "listPersonalEnvs") {
      dispatch(envsApi.util.updateQueryData("listPersonalEnvs", originalArgs, patch));
    }
    if (endpointName === "listUserEnvs") {
      dispatch(envsApi.util.updateQueryData("listUserEnvs", originalArgs, patch));
    }
  }
}

function envTags(env: EnvFile | undefined) {
  if (!env) return [];
  return [
    { type: "Env" as const, id: env.id },
    { type: "Env" as const, id: env.projectId ? `project-${env.projectId}` : "personal" },
  ];
}

export const {
  useListPersonalEnvsQuery,
  useListProjectEnvsQuery,
  useListUserEnvsQuery,
  useGetEnvQuery,
  useCreatePersonalEnvMutation,
  useCreateProjectEnvMutation,
  useUpdateEnvMutation,
  useDeleteEnvMutation,
  useUpsertVariableMutation,
  useRemoveVariableMutation,
  useImportVariablesMutation,
} = envsApi;

export function canEditEnv(
  me: { role: string; email: string },
  env: EnvFile,
  workspace?: { ownerEmail: string; members: { email: string; access: string }[] } | null,
) {
  if (!env.workspaceId) return env.ownerEmail === me.email;
  if (!workspace) return false;
  return (
    me.role === "admin" ||
    env.ownerEmail === me.email ||
    workspace.ownerEmail === me.email ||
    workspace.members.some((member) => member.email === me.email && member.access === "edit")
  );
}
