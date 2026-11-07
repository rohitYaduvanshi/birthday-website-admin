"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  isLoading: true,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      // 1. First fast-load from localStorage
      const cached = getClientConfig();
      setConfig(cached);

      // 2. Fetch fresh config from server
      try {
        const res = await fetch("/api/config", { cache: "no-store" });
        if (res.ok) {
          const serverConfig = await res.json();
          if (serverConfig && serverConfig.person) {
            setConfig(serverConfig);
            saveClientConfig(serverConfig);
          }
        }
      } catch (err) {
        console.warn("Could not fetch server config, using local cache:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();

    // Listen to changes triggered from admin or other tabs
    const handleStorageChange = () => {
      setConfig(getClientConfig());
    };

    window.addEventListener("site_config_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
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
    } catch (err) {
      console.warn("Failed to persist config to server file:", err);
      // Still true because localStorage was updated successfully!
      return true;
    }
  };

  const resetToDefaults = async (): Promise<boolean> => {
    return await updateConfig(defaultSiteConfig);
  };

  return (
    <ConfigContext.Provider
      value={{ config, updateConfig, resetToDefaults, isLoading }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

