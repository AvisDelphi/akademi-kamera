"use client";
// components/lms/useToast.js — satu toast aktif, hilang sendiri setelah 4 detik (UIUX_GUIDELINE §8.11).
import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    setMessage(null);
  }, []);

  const show = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, show, close };
}
