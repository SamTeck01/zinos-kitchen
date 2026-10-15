"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MENUS, LOCATIONS, type City } from "@/data/menu";
type CityContextValue = { city: City; setCity: (city: City) => void; menu: typeof MENUS[City]; locations: (typeof LOCATIONS)[City] };
const CityContext = createContext<CityContextValue | undefined>(undefined);
export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<City>("ilorin");
  useEffect(() => { const saved = window.localStorage.getItem("zk-city"); if (saved === "ilorin" || saved === "lagos") {
    // Storage rehydration must happen after the server-default first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCity(saved);
  } }, []);
  useEffect(() => { window.localStorage.setItem("zk-city", city); }, [city]);
  const value = useMemo(() => ({ city, setCity, menu: MENUS[city], locations: LOCATIONS[city] }), [city]);
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}
export function useCity() { const context = useContext(CityContext); if (!context) throw new Error("useCity must be used within a CityProvider"); return context; }

