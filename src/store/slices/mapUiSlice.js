import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  datasetVisibility: {
    bfro: true,
    woodape: false,
    kilmury: false,
  },
  showHeatmap: false,
  showCountyOverlay: false,
  splitViewEnabled: false,
  colorMode: 'light',
};

const mapUiSlice = createSlice({
  name: 'mapUi',
  initialState,
  reducers: {
    setDatasetVisibility(state, action) {
      const { datasetKey, visible } = action.payload;
      state.datasetVisibility[datasetKey] = visible;
    },
    setShowHeatmap(state, action) {
      state.showHeatmap = Boolean(action.payload);
    },
    setShowCountyOverlay(state, action) {
      state.showCountyOverlay = Boolean(action.payload);
    },
    setSplitViewEnabled(state, action) {
      state.splitViewEnabled = Boolean(action.payload);
    },
    setColorMode(state, action) {
      state.colorMode = action.payload === 'dark' ? 'dark' : 'light';
    },
    toggleColorMode(state) {
      state.colorMode = state.colorMode === 'dark' ? 'light' : 'dark';
    },
  },
});

export const {
  setDatasetVisibility,
  setShowHeatmap,
  setShowCountyOverlay,
  setSplitViewEnabled,
  setColorMode,
  toggleColorMode,
} = mapUiSlice.actions;

export default mapUiSlice.reducer;
