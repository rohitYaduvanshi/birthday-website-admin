"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  SiteConfig,
  defaultSiteConfig,
  getClientConfig,
  saveClientConfig,
  CONFIG_STORAGE_KEY,
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
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Always fetch fresh config from server (Netlify Blobs now stores real data!)
    // This ensures ANY device sees the latest admin changes immediately on load.
    const controller = new AbortController();
    fetch("/api/config", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((serverConfig: SiteConfig | null) => {
        if (serverConfig?.person) {
          // Server has real data → use it and cache locally
          setConfig(serverConfig);
          saveClientConfig(serverConfig);
        }
        // If server returns defaults (no blob saved yet), keep localStorage version
      })
      .catch(() => {
        // Network error — localStorage fallback already shown, that's fine
      });

    // Listen for changes from admin panel in SAME tab (custom event)
    const handleConfigUpdate = () => setConfig(getClientConfig());
    window.addEventListener("site_config_updated", handleConfigUpdate);

    // Listen for changes from admin in OTHER tabs (BroadcastChannel — instant)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("birthday_config_sync");
      channel.onmessage = (e) => {
        if (e.data?.type === "config_updated" && e.data?.config) {
          setConfig(e.data.config);
          saveClientConfig(e.data.config);
        }
      };
    } catch {
      // BroadcastChannel not supported — storage event fallback below
    }

    // storage event: fires when localStorage changes in another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONFIG_STORAGE_KEY || !e.key) {
        setConfig(getClientConfig());
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      controller.abort();
      channel?.close();
      window.removeEventListener("site_config_updated", handleConfigUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateConfig = async (newConfig: SiteConfig): Promise<boolean> => {
    // 1. Update React state immediately (UI feels instant)
    setConfig(newConfig);
    // 2. Save to localStorage + broadcast to other tabs
    saveClientConfig(newConfig);
    // 3. Persist to server (Netlify Blobs) in background — non-blocking
    try {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      }).catch(() => {});
    } catch {
      // Non-fatal
    }
    return true; // Always success from user's perspective
  };

  const resetToDefaults = async (): Promise<boolean> => {
    setConfig(defaultSiteConfig);
    saveClientConfig(defaultSiteConfig);
    try {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultSiteConfig),
      }).catch(() => {});
    } catch {
      // Non-fatal
    }
    return true;
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetToDefaults, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};
