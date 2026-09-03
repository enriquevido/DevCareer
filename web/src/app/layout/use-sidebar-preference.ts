import { useCallback, useEffect, useState } from "react";

const SIDEBAR_PREFERENCE_KEY = "devcareer.sidebar.collapsed";

function readSidebarPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeSidebarPreference(isCollapsed: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(isCollapsed));
  } catch {
    // The sidebar still works when storage is unavailable.
  }
}

export function useSidebarPreference() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    readSidebarPreference,
  );

  useEffect(() => {
    writeSidebarPreference(isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((currentValue) => !currentValue);
  }, []);

  return {
    isSidebarCollapsed,
    toggleSidebar,
  };
}
