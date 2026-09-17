import { create } from "zustand";
import type { NewsTab } from "./ai-news-types";

interface NewsWorkspaceState {
  tab: NewsTab;
  selectedRunId: string | null;
  setTab: (tab: NewsTab) => void;
  selectRun: (id: string | null) => void;
}

/** Keep transient administrator navigation outside the URL and durable backend state. */
export const useNewsWorkspace = create<NewsWorkspaceState>(/** Initialize the isolated newsroom navigation store. */ function initialize(set) {
  return {
    tab: "overview",
    selectedRunId: null,
    setTab: /** Change the visible newsroom section. */ function setTab(tab) { set({ tab }); },
    selectRun: /** Open or close one retained run detail. */ function selectRun(id) { set({ selectedRunId: id }); },
  };
});
