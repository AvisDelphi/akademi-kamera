"use client";
// components/instructor/useLoad.js — memuat data async dengan status loading/error dan reload.
import { useCallback, useEffect, useState } from "react";

export function useLoad(loader, deps) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus((previous) => (previous === "done" && tick > 0 ? "done" : "loading"));
    loader()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
        setStatus("done");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { data, status, error, reload };
}
