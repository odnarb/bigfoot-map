import { configureStore } from '@reduxjs/toolkit';
import mapUiReducer from './slices/mapUiSlice';
import { reportApi } from './services/reportApi';

export const store = configureStore({
  reducer: {
    mapUi: mapUiReducer,
    [reportApi.reducerPath]: reportApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(reportApi.middleware),
});
