"use client";
import { useEffect, useState } from "react";
import { nextCookDay, fmtDay } from "../data/menu";
export default function CookDay() {
  const [d, setD] = useState("this Saturday");
  useEffect(() => setD(fmtDay(nextCookDay())), []);
  return <>{d}</>;
}
