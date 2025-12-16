export type PlanType = "free" | "professor" | "expert";

export const PLAN_LIMITS = {
  free: {
    label: "Visitante",
    maxActivitiesPerMonth: 1,
    canUseOCR: false,
    priority: "low",
  },
  professor: {
    label: "Professor",
    maxActivitiesPerMonth: 20,
    canUseOCR: true,
    priority: "standard",
  },
  expert: {
    label: "Expert",
    maxActivitiesPerMonth: 9999,
    canUseOCR: true,
    priority: "high",
  },
};
