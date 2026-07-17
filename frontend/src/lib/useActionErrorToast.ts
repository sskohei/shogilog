"use client";

import { useEffect } from "react";

import { showErrorToast } from "@/lib/toast";

export function useActionErrorToast(message: string | undefined) {
  useEffect(() => {
    if (message) {
      showErrorToast(message);
    }
  }, [message]);
}
