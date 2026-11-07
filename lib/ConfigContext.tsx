"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  SiteConfig,
  defaultSiteConfig,
  getClientConfig,
  saveClientConfig,
} from "./siteConfig";

interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: SiteConfig) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType>({
  config: defaultSiteConfig,
  updateConfig: async () => false,
  resetToDefaults: async () => false,
  isLoading: false,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  // Start with localStorage immediately — zero flash/delay for the user
  const [config, setConfig] = useState<SiteConfig>(() => getClientConfig());
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch from server once per page load
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Background sync with server config (non-blocking)
    const controller = new AbortController();
    fetch("/api/config", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((serverConfig) => {
        if (serverConfig?.person) {
          setConfig(serverConfig);
          saveClientConfig(serverConfig);
        }
      })
      .catch(() => {/* silently ignore — localStorage fallback already shown */});

    // Listen to changes triggered from admin panel or other tabs
    const handleStorageChange = () => setConfig(getClientConfig());
    window.addEventListener("site_config_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      controller.abort();
      window.removeEventListener("site_config_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateConfig = async (newConfig: SiteConfig): Promise<boolean> => {
    setConfig(newConfig);
    saveClientConfig(newConfig);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      return res.ok;
    } catch {
      return true; // localStorage saved — that's enough
    }
  };

  const resetToDefaults = async () => updateConfig(defaultSiteConfig);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetToDefaults, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};
