"use client";

import { createContext, useContext, useState } from "react";
import type { ProjectCategory } from "@/data/projects";

export type WorkFilterValue = "all" | ProjectCategory;

const WorkFilterContext = createContext<WorkFilterValue>("all");
const SetWorkFilterContext = createContext<(filter: WorkFilterValue) => void>(() => {});

export function useWorkFilter() {
  return useContext(WorkFilterContext);
}

export function useSetWorkFilter() {
  return useContext(SetWorkFilterContext);
}

// The filter buttons live in the header (centered, aligned with the Work
// page's own top row) rather than in WorkPage itself, so the selected
// value has to be shared through context between the two.
export default function WorkFilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<WorkFilterValue>("all");

  return (
    <SetWorkFilterContext.Provider value={setFilter}>
      <WorkFilterContext.Provider value={filter}>{children}</WorkFilterContext.Provider>
    </SetWorkFilterContext.Provider>
  );
}
