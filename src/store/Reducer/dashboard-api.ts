import { createApi } from "@reduxjs/toolkit/query/react";
import API_ROUTES from "@/store/apiRoutes";
import { customFetchBaseQuery } from "@/store/customFetchBaseQuery";
import type { DashboardStats } from "@/modules/dashboard/lib/stats";

export type Dashboard = DashboardStats & {
  recent: (DashboardStats["recent"][number] & { workspaceId: string })[];
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: customFetchBaseQuery(),
  endpoints: (builder) => ({
    getDashboard: builder.query<Dashboard, void>({
      query: () => API_ROUTES.DASHBOARD,
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
