/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface ActivityQuestion {
  question: string;
  options?: string[];
  type: "multiple_choice" | "discursive";
}

export interface ActivityAnswer {
  question: string;
  answer: string;
}

export interface ActivityData {
  id: string;
  title: string;
  level: string;
  type: string;
  topics: string[];
  questions: ActivityQuestion[];
  answerKey: ActivityAnswer[];
  createdAt: any;
}

interface ActivityState {
  currentActivity: ActivityData | null;
  isLoading: boolean;
  setActivity: (activity: ActivityData) => void;
  setLoading: (loading: boolean) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  currentActivity: null,
  isLoading: false,
  setActivity: (activity) =>
    set({ currentActivity: activity, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
