import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tabs: [],
};

export const openTabs = createSlice({
  name: "openTabs",
  initialState,
  reducers: {
    push: (state, action) => {
      const existingIndex = state.tabs.findIndex(
        (item) => item.name === action.payload.name,
      );
      state.tabs = state.tabs.map((tab) => {
        return { ...tab, active: false };
      });
      if (existingIndex >= 0) {
        state.tabs[existingIndex] = {
          ...state.tabs[existingIndex],
          active: true,
          previewId: action.payload.previewId,
          date: action.payload.date,
          params: action.payload.params ?? null,
          pageId: action.payload.id,
        };
      } else {
        state.tabs.push({
          name: action.payload.name,
          active: true,
          previewId: action.payload.previewId,
          date: action.payload.date,
          params: action.payload.params ?? null,
          pageId: action.payload.id,
        });
      }
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
    },
    clearTabParams: (state, action) => {
      // ⬅️ add this
      const index = state.tabs.findIndex(
        (item) => item.name === action.payload,
      );
      if (index >= 0) {
        state.tabs[index].params = null;
      }
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
    },
    remove: (state, action) => {
      const existingIndex = state.tabs.findIndex(
        (item) => item.name === action.payload.name,
      );
      if (state.tabs[existingIndex]?.active) {
        if (state.tabs.length > 1) {
          state.tabs = state.tabs.map((tab) => {
            return { ...tab, active: false };
          });
          if (existingIndex === state.tabs.length - 1) {
            state.tabs[existingIndex - 1] = {
              ...state.tabs[existingIndex - 1],
              active: true,
            };
          } else {
            state.tabs[existingIndex + 1] = {
              ...state.tabs[existingIndex + 1],
              active: true,
            };
          }
        }
      }
      state.tabs = state.tabs.filter((tab) => tab.name !== action.payload.name);
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
    },
  },
});

export const { push, remove, clearTabParams } = openTabs.actions;

export default openTabs.reducer;
