import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CurrentUrl } from "@/constant/constant";
import { logout } from "@/store/slice/userSlice";
import { resetStore, type RootState } from "@/store/store";

export const customFetchBaseQuery = (): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl: CurrentUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).userSlice.user?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401 && window.location.pathname !== "/") {
      api.dispatch(logout());
      api.dispatch(resetStore());
      window.location.replace("/");
    }
    return result;
  };
};
