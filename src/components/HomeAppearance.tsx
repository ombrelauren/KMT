"use client";

import { createContext, useContext, useState } from "react";
import type { TextColor } from "@/data/projects";

type Appearance = { headerColor: TextColor; captionColor: TextColor };

const defaultAppearance: Appearance = { headerColor: "white", captionColor: "white" };

const AppearanceContext = createContext<Appearance>(defaultAppearance);
const SetAppearanceContext = createContext<(appearance: Appearance) => void>(() => {});

export function useHomeAppearance() {
  return useContext(AppearanceContext);
}

export function useSetHomeAppearance() {
  return useContext(SetAppearanceContext);
}

export default function HomeAppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);

  return (
    <SetAppearanceContext.Provider value={setAppearance}>
      <AppearanceContext.Provider value={appearance}>{children}</AppearanceContext.Provider>
    </SetAppearanceContext.Provider>
  );
}
