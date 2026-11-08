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
  sessionId: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: defaultSiteConfig,
  updateConfig: async () => false,
  resetToDefaults: async () => false,
  isLoading: false,
  sessionId: null,
});

export const useConfig = () => useContext(ConfigContext);

function isAdminPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SiteConfig>(() => getClientConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();

    if (isAdminPage()) {
      // ── ADMIN PAGE: Fetch server configuration
      setIsLoading(true);
      fetch("/api/config", { cache: "no-store", signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((serverConfig: SiteConfig | null) => {
          if (serverConfig?.person) {
            setConfig(serverConfig);
            saveClientConfig(serverConfig);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      // ── MAIN WEBSITE:
      // Config comes ONLY from:
      // 1. URL ?s=SESSION_ID  → fetched from /api/session
      // 2. URL #cfg=base64    → decoded inline
      // 3. ?preview=1         → admin previewing their current local state
      // 4. Default            → clean template (no personal photos of anyone)

      const params = new URLSearchParams(window.location.search);
      const sId = params.get("s");

      if (sId) {
        setSessionId(sId);
        setIsLoading(true);
        fetch(`/api/session?s=${encodeURIComponent(sId)}`, {
          cache: "no-store",
          signal: controller.signal,
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((sessionConfig: SiteConfig | null) => {
            if (sessionConfig?.person) {
              setConfig(sessionConfig);
              try {
                sessionStorage.setItem(`bday_session_${sId}`, JSON.stringify(sessionConfig));
              } catch (_) {}
              // Broadcast to iframes
              window.dispatchEvent(new Event("site_config_updated"));
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      }
    }

    // Cross-tab sync for active preview
    const handleConfigUpdate = () => setConfig(getClientConfig());
    window.addEventListener("site_config_updated", handleConfigUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("birthday_config_sync");
      channel.onmessage = (e) => {
        if (e.data?.type === "config_updated" && e.data?.config) {
          // Only update if in admin, preview, or current session matches
          const params = new URLSearchParams(window.location.search);
          if (isAdminPage() || params.get("preview") === "1") {
            setConfig(e.data.config);
            saveClientConfig(e.data.config);
          }
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONFIG_STORAGE_KEY || !e.key) {
        const params = new URLSearchParams(window.location.search);
        if (isAdminPage() || params.get("preview") === "1") {
          setConfig(getClientConfig());
        }
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
    setConfig(newConfig);
    saveClientConfig(newConfig);
    try {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      }).catch(() => {});
    } catch (_) {}
    return true;
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
    } catch (_) {}
    return true;
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetToDefaults, isLoading, sessionId }}>
      {children}
    </ConfigContext.Provider>
  );
};
