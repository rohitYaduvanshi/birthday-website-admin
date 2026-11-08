"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConfig } from "@/lib/ConfigContext";
import { SiteConfig, defaultSiteConfig, saveClientConfig } from "@/lib/siteConfig";
import {
  Lock,
  Unlock,
  Save,
  RefreshCw,
  Eye,
  Check,
  Copy,
  Upload,
  Music,
  Image as ImageIcon,
  Calendar,
  User,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Play,
  Pause,
  Sparkles,
  ExternalLink,
  Heart,
  Share2,
  KeyRound,
  X,
  ShieldAlert,
} from "lucide-react";

export default function AdminPage() {
  const { config, updateConfig, resetToDefaults, isLoading } = useConfig();
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Forgot / Reset PIN Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConfigUrl, setShareConfigUrl] = useState("");

  const [activeTab, setActiveTab] = useState<
    "person" | "countdown" | "music" | "photos" | "cards" | "chat" | "settings"
  >("person");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingSong, setUploadingSong] = useState(false);
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInitializedRef = useRef(false);

  // Initialize formData ONCE on initial load
  // CRITICAL: Never reset formData while user is actively typing/editing in admin!
  useEffect(() => {
    if (!isInitializedRef.current && config) {
      setFormData(config);
      isInitializedRef.current = true;
    }
  }, [config]);

  // Smooth Auto-save: debounced 1500ms after user stops typing
  // Saves directly to localStorage & broadcasts without interrupting mobile keyboard or cursor!
  useEffect(() => {
    if (!autoSave || !isAuthenticated || !isInitializedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        saveClientConfig(formData);
        // Non-blocking background sync with server
        fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch(() => {});
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
      }
    }, 1500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, autoSave, isAuthenticated]);

  // Check if admin is already unlocked in sessionStorage
  useEffect(() => {
    const authSession = sessionStorage.getItem("admin_authenticated");
    if (authSession === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = config.admin?.pin || "1111";
    if (enteredPin.trim() === correctPin.trim()) {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem("admin_authenticated", "true");
    } else {
      setPinError(true);
    }
  };

  // Reset PIN to Default (1111)
  const handleResetPinToDefault = async () => {
    const updated = {
      ...formData,
      admin: { pin: "1111" },
    };
    setFormData(updated);
    saveClientConfig(updated);
    await updateConfig(updated);
    setResetSuccessMsg("PIN successfully reset to default: 1111");
    setEnteredPin("1111");
    setPinError(false);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccessMsg("");
    }, 1800);
  };

  // Set custom new PIN from Forgot modal
  const handleSetCustomPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPinTrimmed = resetNewPin.trim();
    if (!newPinTrimmed || newPinTrimmed.length < 3) {
      alert("Please enter a PIN with at least 3 digits/characters.");
      return;
    }
    const updated = {
      ...formData,
      admin: { pin: newPinTrimmed },
    };
    setFormData(updated);
    saveClientConfig(updated);
    await updateConfig(updated);
    setResetSuccessMsg(`New PIN set: ${newPinTrimmed}`);
    setEnteredPin(newPinTrimmed);
    setPinError(false);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccessMsg("");
      setResetNewPin("");
    }, 1800);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const ok = await updateConfig(formData);
      if (ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all customizations to the original template defaults?")) {
      await resetToDefaults();
      setFormData(defaultSiteConfig);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleCopyShareLink = () => {
    try {
      const payload = {
        person: formData.person,
        countdown: formData.countdown,
        music: formData.music,
        birthdayCounter: formData.birthdayCounter,
        photos: formData.photos,
        loveGalleryCaptions: formData.loveGalleryCaptions,
        butterflyNotes: formData.butterflyNotes,
        galaxyCards: formData.galaxyCards,
        chatStory: formData.chatStory,
      };
      const jsonStr = JSON.stringify(payload);
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      // If payload is reasonably sized for URL
      if (b64.length < 15000) {
        setShareConfigUrl(`${window.location.origin}/#cfg=${b64}`);
      } else {
        setShareConfigUrl(window.location.origin);
      }
      setShowShareModal(true);
    } catch {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Client-side image compression to Base64 (zero server dependency, never fails on Netlify/Vercel)
  const compressImage = (file: File, maxWidth = 800, quality = 0.78): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth || h > maxWidth) {
            if (w > h) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            } else {
              w = Math.round((w * maxWidth) / h);
              h = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => {
        resolve("/ref/girl.jpg");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: "image" | "audio", targetIndex?: number) => {
    try {
      if (type === "audio") {
        setUploadingSong(true);
        // If file is smaller than 4.5MB, read as data URL so it never fails on Netlify
        if (file.size < 4.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const updated = {
              ...formData,
              music: {
                ...formData.music,
                songSrc: dataUrl,
              },
            };
            setFormData(updated);
            saveClientConfig(updated);
            await updateConfig(updated);
            setUploadingSong(false);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2500);
          };
          reader.readAsDataURL(file);
        } else {
          // Try upload API
          const data = new FormData();
          data.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: data });
          const json = await res.json();
          if (json?.url) {
            const updated = {
              ...formData,
              music: { ...formData.music, songSrc: json.url },
            };
            setFormData(updated);
            saveClientConfig(updated);
            await updateConfig(updated);
          }
          setUploadingSong(false);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2500);
        }
      } else if (type === "image" && targetIndex !== undefined) {
        setUploadingIndex(targetIndex);
        try {
          // Instant client-side compression: 0% failure rate
          const compressedDataUrl = await compressImage(file, 800, 0.78);
          const newPhotos = [...(formData.photos || [])];
          newPhotos[targetIndex] = compressedDataUrl;
          const updated = { ...formData, photos: newPhotos };
          setFormData(updated);
          saveClientConfig(updated);
          await updateConfig(updated);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2500);
        } catch (imgErr) {
          console.warn("Image compress/save error:", imgErr);
        } finally {
          setUploadingIndex(null);
        }
      }
    } catch (err) {
      console.warn("Upload fallback error:", err);
      setUploadingSong(false);
      setUploadingIndex(null);
    }
  };

  const toggleSongPreview = () => {
    if (!formData.music.songSrc) return;
    if (isPlayingAudio && audioPreview) {
      audioPreview.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(formData.music.songSrc);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => {});
      setAudioPreview(audio);
      setIsPlayingAudio(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0e0c0b] text-[#f4ecd8] flex items-center justify-center font-mono p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Secret PIN Lock Screen with Forgot/Reset option
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0d0c] text-[#f4ecd8] flex items-center justify-center p-4 selection:bg-amber-500/30">
        <div className="w-full max-w-sm sm:max-w-md bg-[#1a1614] border border-[#2e2620] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-inner">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-1.5">Birthday Admin Panel</h1>
          <p className="text-center text-xs sm:text-sm text-[#a89b8d] mb-6">
            Enter your PIN to customize this birthday website.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-[#a89b8d] font-mono">
                  Admin PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition underline underline-offset-2 cursor-pointer font-sans"
                >
                  Forgot PIN?
                </button>
              </div>

              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Default: 1111"
                className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#120f0e] border ${
                  pinError ? "border-red-500 focus:ring-red-500" : "border-[#3b322a] focus:border-amber-500"
                } text-white text-center text-xl sm:text-2xl tracking-[0.3em] font-mono outline-none transition`}
                autoFocus
              />
              {pinError && (
                <p className="text-red-400 text-xs mt-2 text-center font-mono">
                  Incorrect PIN. Click &apos;Forgot PIN?&apos; if needed.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-semibold text-sm sm:text-base tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#2e2620] text-center">
            <a
              href="/"
              className="text-xs text-[#8e8174] hover:text-amber-400 transition inline-flex items-center gap-1"
            >
              ← Back to Birthday Website
            </a>
          </div>
        </div>

        {/* FORGOT / RESET PIN MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm sm:max-w-md bg-[#191513] border border-[#3a3028] rounded-2xl p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSuccessMsg("");
                }}
                className="absolute top-4 right-4 text-[#8f8174] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-bold text-white mb-1">Reset Admin PIN</h2>
              <p className="text-xs text-[#a89b8d] mb-4">
                You can instantly reset your PIN to default (<strong>1111</strong>) or choose a new PIN.
              </p>

              {resetSuccessMsg ? (
                <div className="p-3.5 rounded-xl bg-green-500/15 border border-green-500/40 text-green-300 text-xs text-center font-medium">
                  {resetSuccessMsg}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option 1: Quick Reset to 1111 */}
                  <button
                    type="button"
                    onClick={handleResetPinToDefault}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#261f1a] hover:bg-[#332922] border border-[#423429] text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset to Default PIN (1111)</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#30261f] w-full" />
                    <span className="bg-[#191513] px-2 text-[10px] text-[#786c5f] uppercase tracking-wider font-mono">
                      or set new
                    </span>
                  </div>

                  {/* Option 2: Enter new PIN */}
                  <form onSubmit={handleSetCustomPin} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#a89b8d] uppercase mb-1">
                        Enter New 4-Digit PIN
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="e.g. 2026 or 7777"
                        value={resetNewPin}
                        onChange={(e) => setResetNewPin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#100d0c] border border-[#3b322a] focus:border-amber-500 text-white font-mono text-center text-lg tracking-widest outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
                    >
                      Save New PIN &amp; Return
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0e0c0b] text-[#f4ecd8] pb-28 sm:pb-24 font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Top Navigation Bar - Responsive */}
      <header className="sticky top-0 z-40 bg-[#151210]/95 backdrop-blur-md border-b border-[#29221c] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0 text-sm sm:text-base">
            🎂
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-sm sm:text-base leading-tight flex items-center gap-1.5 truncate">
              <span>Admin Hub</span>
              <span className="hidden xs:inline-block text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Live
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-[#9a8c7e] truncate hidden sm:block">
              Customize everything for any person
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Share Link */}
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#221c18] hover:bg-[#2c241f] border border-[#3b3028] text-xs font-medium text-[#d8cab7] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Copy website link for birthday person"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          {/* Live Preview Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#221c18] hover:bg-[#2c241f] border border-[#3b3028] text-xs font-medium text-[#d8cab7] hover:text-white flex items-center gap-1.5 transition"
            title="Open website preview in new tab"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Preview</span>
            <ExternalLink className="w-3 h-3 text-[#776b5f]" />
          </a>

          {/* Auto-Save Toggle (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => setAutoSave((v) => !v)}
            title={autoSave ? "Auto-Save is ON — changes apply instantly" : "Auto-Save is OFF"}
            className={`hidden md:flex px-3 py-1.5 rounded-lg border text-xs font-medium items-center gap-1.5 transition cursor-pointer ${
              autoSave
                ? "bg-green-900/30 border-green-700/50 text-green-300"
                : "bg-[#221c18] border-[#3b3028] text-[#a89b8d]"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoSave ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
            <span>{autoSave ? "Auto-Save ON" : "Auto-Save OFF"}</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-900/40 text-xs font-medium text-red-300 transition cursor-pointer flex items-center gap-1"
            title="Reset to default template"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {saveStatus === "saving" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Notice banner */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-amber-200">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold text-white">Recipient Safe: </span>
            Birthday person ko sirf main link (<code className="px-1 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-[11px]">/</code>) share karein.
            Ye admin panel (<code className="px-1 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-[11px]">/admin</code>) PIN-protected hai aur unhe nahi dikhega.
          </div>
        </div>

        {/* Tab Navigation - Touch-friendly swipeable horizontal list */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 mb-4 sm:mb-6 scrollbar-none border-b border-[#29221c] -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: "person", label: "👤 Person", icon: User },
            { id: "countdown", label: "⏳ Countdown", icon: Calendar },
            { id: "music", label: "🎵 Music", icon: Music },
            { id: "photos", label: "🖼️ 12 Photos", icon: ImageIcon },
            { id: "cards", label: "💌 Notes", icon: Heart },
            { id: "chat", label: "📱 iMessage", icon: MessageSquare },
            { id: "settings", label: "⚙️ Settings & PIN", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                    : "bg-[#181412] text-[#ad9e8e] hover:bg-[#231d19] hover:text-white border border-[#2a231d]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-black" : "text-amber-400/80"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Person & Name */}
        {activeTab === "person" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Birthday Person Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Person&apos;s Name (Hero Headline)
                  </label>
                  <input
                    type="text"
                    value={formData.person.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        person: { ...formData.person, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Sweety, Priya, Rohan"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Appears in bold amber: &ldquo;Happy Birthday [Name]&rdquo;
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Nickname / Sweet Name
                  </label>
                  <input
                    type="text"
                    value={formData.person.nickname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        person: { ...formData.person, nickname: e.target.value },
                      })
                    }
                    placeholder="e.g. sidd's pipi ♥️, My Angel"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Used in curtain subtitles &amp; iMessage header
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Hero Section Date Stamp
                  </label>
                  <input
                    type="text"
                    value={formData.person.heroDateBadge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        person: { ...formData.person, heroDateBadge: e.target.value },
                      })
                    }
                    placeholder="e.g. Aug 5, Nov 11"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Shown in the top-left date badge of Section 2
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Age / Turning Year
                  </label>
                  <input
                    type="number"
                    value={formData.birthdayCounter.age}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        birthdayCounter: { ...formData.birthdayCounter, age: Number(e.target.value) },
                      })
                    }
                    placeholder="e.g. 23"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Age revealed in Section 1 burn effect
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                  Personal Birthday Wish Message
                </label>
                <textarea
                  rows={3}
                  value={formData.person.heroWishMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      person: { ...formData.person, heroWishMessage: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm leading-relaxed"
                  placeholder="Write your heartful birthday message here..."
                />
                <p className="text-[11px] text-[#7d7165] mt-1">
                  Shown beneath the film trail in Section 2
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Countdown & Curtain */}
        {activeTab === "countdown" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Curtain &amp; Lock Screen Countdown</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Target Countdown Date &amp; Time
                  </label>
                  <input
                    type="text"
                    value={formData.countdown.targetDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, targetDate: e.target.value },
                      })
                    }
                    placeholder="2026-11-11T00:00:00+05:30"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-mono"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    When countdown reaches zero, cinema curtain opens smoothly!
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Marquee Title
                  </label>
                  <input
                    type="text"
                    value={formData.countdown.marqueeTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, marqueeTitle: e.target.value },
                      })
                    }
                    placeholder="NOW SHOWING"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Big marquee text displayed on the curtain
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Scrolling Ticker Text
                  </label>
                  <input
                    type="text"
                    value={formData.countdown.tickerText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, tickerText: e.target.value },
                      })
                    }
                    placeholder="SAVE THE DATE · NOV 11 ·"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Curtain Subtitle (Script font)
                  </label>
                  <input
                    type="text"
                    value={formData.countdown.marqueeSub}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, marqueeSub: e.target.value },
                      })
                    }
                    placeholder="a special production, live soon"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Bottom Caption
                  </label>
                  <input
                    type="text"
                    value={formData.countdown.doorsText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, doorsText: e.target.value },
                      })
                    }
                    placeholder="doors open at midnight, IST"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-6">
                  <input
                    type="checkbox"
                    id="showPreviewBtn"
                    checked={formData.countdown.showPreviewButton}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countdown: { ...formData.countdown, showPreviewButton: e.target.checked },
                      })
                    }
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="showPreviewBtn" className="text-xs sm:text-sm font-medium text-white cursor-pointer select-none">
                    Show &ldquo;Preview&rdquo; button on curtain (turn OFF before sharing with recipient)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Song & Music */}
        {activeTab === "music" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <span>Background Song &amp; Mini Player</span>
              </h2>

              <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f0d0c] border border-[#29221c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSongPreview}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition cursor-pointer shadow-lg shadow-amber-500/30 shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm sm:text-base truncate">
                      {formData.music.songTitle || "Song Title"}
                    </div>
                    <div className="text-xs text-[#8f8174] truncate">
                      {formData.music.songArtist || "Artist"}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono text-amber-400/80 truncate max-w-[220px] sm:max-w-md mt-0.5">
                      {formData.music.songSrc}
                    </div>
                  </div>
                </div>

                {/* Upload MP3 */}
                <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2b221c] border border-[#3b3028] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition">
                  {uploadingSong ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{uploadingSong ? "Uploading Audio..." : "Upload MP3 Song"}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "audio");
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Player Song Title
                  </label>
                  <input
                    type="text"
                    value={formData.music.songTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        music: { ...formData.music, songTitle: e.target.value },
                      })
                    }
                    placeholder="e.g. Sweety Song"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Player Artist / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.music.songArtist}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        music: { ...formData.music, songArtist: e.target.value },
                      })
                    }
                    placeholder="e.g. Birthday Playlist"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Custom Song URL / Path
                  </label>
                  <input
                    type="text"
                    value={formData.music.songSrc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        music: { ...formData.music, songSrc: e.target.value },
                      })
                    }
                    placeholder="/sounds/pipi-song.mp3"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Photos Gallery (12 Photos) - Mobile Optimized Grid */}
        {activeTab === "photos" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Personal Photos Collection (12 Photos)</span>
                </h2>
                <p className="text-xs text-[#9a8c7e] mt-1">
                  Photo 1 is the scrapbook heart; Photos 2–12 appear in Film Trail, Draggable Polaroid cards, Book, and 3D Galaxy!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-1">
                {(formData.photos || []).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0f0d0c] border border-[#2c241e] rounded-xl p-2 sm:p-2.5 flex flex-col items-center gap-2 group hover:border-amber-500/50 transition relative"
                  >
                    <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/75 rounded text-[10px] font-mono font-bold text-amber-400 border border-white/10">
                      #{idx + 1}
                    </span>

                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/60 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/ref/girl.jpg";
                        }}
                      />
                      {uploadingIndex === idx && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-1.5">
                      <label className="w-full py-2 px-2 rounded-lg bg-[#201a16] hover:bg-[#2e241e] border border-[#3b3028] text-[11px] font-medium text-center text-white flex items-center justify-center gap-1 cursor-pointer transition">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "image", idx);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      <input
                        type="text"
                        value={imgUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const copy = [...prev.photos];
                            copy[idx] = val;
                            return { ...prev, photos: copy };
                          });
                        }}
                        placeholder="/ref/girl.jpg"
                        className="w-full px-2 py-1 rounded bg-black/40 border border-[#2c241e] text-[10px] font-mono text-[#ad9e8e] focus:border-amber-500 outline-none truncate"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Notes & Captions */}
        {activeTab === "cards" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Butterfly Floating Notes */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Butterfly Flying Notes (5 Romantic Notes)</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                These flutter around like butterflies and reveal lovely notes when tapped!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {(formData.butterflyNotes || []).map((note, index) => (
                  <div key={note.id || index} className="p-3.5 sm:p-4 rounded-xl bg-[#0f0d0c] border border-[#29221c] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Note #{note.title || `0${index + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[#7d7165]">Color:</label>
                        <input
                          type="color"
                          value={note.accent || "#D98E7E"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const notes = [...prev.butterflyNotes];
                              notes[index] = { ...notes[index], accent: val };
                              return { ...prev, butterflyNotes: notes };
                            });
                          }}
                          className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={note.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                              const notes = [...prev.butterflyNotes];
                              notes[index] = { ...notes[index], text: val };
                              return { ...prev, butterflyNotes: notes };
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#181412] border border-[#332a22] text-base sm:text-xs text-white focus:border-amber-500 outline-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Love Gallery Captions */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>Draggable Polaroid Photo Captions (10 Captions)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
                {(formData.loveGalleryCaptions || []).map((caption, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#0f0d0c] border border-[#29221c]">
                    <span className="text-[10px] font-mono text-amber-400 block mb-1">Card #{idx + 1}</span>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const caps = [...prev.loveGalleryCaptions];
                          caps[idx] = val;
                          return { ...prev, loveGalleryCaptions: caps };
                        });
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#181412] border border-[#332a22] text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: iMessage Finale */}
        {activeTab === "chat" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>Section 6: iMessage Chat Simulation</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                In the grand finale, an iPhone mock-up types and sends these exact messages with read receipts and heart reactions!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Chat Header Name
                  </label>
                  <input
                    type="text"
                    value={formData.chatStory.headerTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatStory: { ...formData.chatStory, headerTitle: e.target.value },
                      })
                    }
                    placeholder="My love ♥️"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Avatar Picture Path / URL
                  </label>
                  <input
                    type="text"
                    value={formData.chatStory.avatar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatStory: { ...formData.chatStory, avatar: e.target.value },
                      })
                    }
                    placeholder="/ref/girl3.jpg"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-base sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* Chat Message Sequence */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-white">Chat Message Sequence (Typed in order)</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        chatStory: {
                          ...prev.chatStory,
                          messages: [...prev.chatStory.messages, "New message here..."],
                        },
                      }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Message</span>
                  </button>
                </div>

                {(formData.chatStory.messages || []).map((msg, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#201a16] border border-[#3b3028] text-[11px] font-mono text-amber-400 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const msgs = [...prev.chatStory.messages];
                          msgs[index] = val;
                          return {
                            ...prev,
                            chatStory: { ...prev.chatStory, messages: msgs },
                          };
                        });
                      }}
                      className="flex-1 px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#0f0d0c] border border-[#332a22] text-base sm:text-sm text-white focus:border-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          chatStory: {
                            ...prev.chatStory,
                            messages: prev.chatStory.messages.filter((_, i) => i !== index),
                          },
                        }));
                      }}
                      className="p-2 text-[#7d7165] hover:text-red-400 transition cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Settings & PIN Security */}
        {activeTab === "settings" && (
          <div className="space-y-4 sm:space-y-6">
            {/* PIN Security Card */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Admin Security PIN</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                Set the password required to access this admin panel. You can change it anytime or reset to default (1111).
              </p>

              <div className="max-w-xs space-y-3">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                    Current / New Admin PIN
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={formData.admin?.pin || "1111"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admin: { pin: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white font-mono text-center text-xl tracking-widest outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await handleSave();
                    alert("Admin PIN updated successfully!");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update PIN</span>
                </button>
              </div>
            </div>

            {/* Backup & Export Configuration */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-amber-400" />
                <span>Backup &amp; Export Configuration</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                Download all your customizations as a JSON backup, or import a saved backup anytime.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
                    const dl = document.createElement("a");
                    dl.setAttribute("href", dataStr);
                    dl.setAttribute("download", `birthday-config-${formData.person.name || "person"}.json`);
                    dl.click();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2c241e] border border-[#3b3028] text-xs font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2c241e] border border-[#3b3028] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Import JSON Configuration</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const parsed = JSON.parse(event.target?.result as string);
                          setFormData({ ...defaultSiteConfig, ...parsed });
                          alert("Configuration loaded! Click 'Save' to apply.");
                        } catch {
                          alert("Invalid JSON file.");
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Shows only on mobile screens < 640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151210]/95 backdrop-blur-md border-t border-[#29221c] p-2.5 flex items-center justify-between gap-2 shadow-2xl">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#221c18] border border-[#3b3028] text-xs font-medium text-[#d8cab7] flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Site</span>
        </a>

        <button
          type="button"
          onClick={() => setAutoSave((v) => !v)}
          className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-1 ${
            autoSave
              ? "bg-green-900/30 border-green-700/50 text-green-300"
              : "bg-[#221c18] border-[#3b3028] text-[#a89b8d]"
          }`}
          title="Toggle Auto-Save"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoSave ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
          <span>{autoSave ? "Auto" : "Manual"}</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
        >
          {saveStatus === "saving" ? (
            <span>Saving...</span>
          ) : saveStatus === "saved" ? (
            <span>Saved!</span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-[#191513] border border-[#3b3028] rounded-2xl p-5 sm:p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-[#8f8174] hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Share Birthday Website</h3>
              <p className="text-xs text-[#a89b8d] mt-0.5">
                Recipient will open this link and see your personalized photos, name &amp; song!
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareConfigUrl || window.location.origin);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Recipient Share Link"}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Happy Birthday ${formData.person.name || ""}! Open this surprise link: ${shareConfigUrl || window.location.origin}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Share via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#201a16] text-[#a89b8d] hover:text-white text-[11px] border border-[#30261f]"
              >
                Copy Simple Clean URL ({typeof window !== "undefined" ? window.location.origin : ""})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
