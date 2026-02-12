import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Builds query parameters from report filter state.
 *
 * @param {Record<string, any>} filters - Query filter input.
 * @returns {URLSearchParams} Query params.
 */
function buildReportQueryParams(filters) {
  const params = new URLSearchParams();

  if (filters?.datasets?.length > 0) {
    params.set('datasets', filters.datasets.join(','));
  }
  if (Number.isFinite(filters?.fromYear)) {
    params.set('fromYear', String(filters.fromYear));
  }
  if (Number.isFinite(filters?.toYear)) {
    params.set('toYear', String(filters.toYear));
  }
  if (filters?.bounds) {
    params.set('bounds', filters.bounds);
  }
  if (filters?.includeWithoutCoordinates === false) {
    params.set('includeWithoutCoordinates', 'false');
  }

  return params;
}

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    getReports: builder.query({
      query: (filters) => {
        const params = buildReportQueryParams(filters);
        return `/reports?${params.toString()}`;
      },
      providesTags: ['Reports'],
    }),
    voteOnReport: builder.mutation({
      query: ({ reportId, direction, clientId }) => ({
        url: `/reports/${reportId}/vote`,
        method: 'POST',
        headers: clientId ? { 'x-client-id': clientId } : undefined,
        body: { direction },
      }),
      invalidatesTags: ['Reports'],
    }),
    updateReportTriage: builder.mutation({
      query: ({ reportId, triagePatch, token }) => ({
        url: `/reports/${reportId}/triage`,
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: triagePatch,
      }),
      invalidatesTags: ['Reports'],
    }),
    submitReport: builder.mutation({
      query: ({ submission, token, clientId }) => ({
        url: '/reports',
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(clientId ? { 'x-client-id': clientId } : {}),
        },
        body: submission,
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useVoteOnReportMutation,
  useUpdateReportTriageMutation,
  useSubmitReportMutation,
} = reportApi;
