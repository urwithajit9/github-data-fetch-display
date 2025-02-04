import { create } from "zustand";

interface RepoState {
  repos: string[];
  addRepo: (repo: string) => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repos: [],
  addRepo: (repo) =>
    set((state) => ({
      repos: [repo, ...state.repos],
    })),
}));
