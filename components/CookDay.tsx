"use client";
import { useEffect, useState } from "react";
import { nextDeliveryDay, fmtDay } from "../data/menu";
export default function CookDay() {
  const [d, setD] = useState("this weekend");
  // Date must be computed on the client after first paint to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setD(fmtDay(nextDeliveryDay())), []);
  return <>{d}</>;
}
