"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "@/lib/ConfigContext";
import { SiteConfig, defaultSiteConfig } from "@/lib/siteConfig";
import {
  Lock,
  Unlock,
  Save,
  RefreshCw,
  Eye,
  Copy,
  Check,
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
} from "lucide-react";

export default function AdminPage() {
  const { config, updateConfig, resetToDefaults, isLoading } = useConfig();
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
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
  const autoSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync formData when config changes from another tab
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  // Auto-save: debounced 800ms after any formData change
  useEffect(() => {
    if (!autoSave || !isAuthenticated) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      const ok = await updateConfig(formData);
      setSaveStatus(ok ? "saved" : "error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (enteredPin === correctPin) {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem("admin_authenticated", "true");
    } else {
      setPinError(true);
    }
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
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFileUpload = async (file: File, type: "image" | "audio", targetIndex?: number) => {
    const data = new FormData();
    data.append("file", file);

    try {
      if (type === "audio") setUploadingSong(true);
      if (type === "image" && targetIndex !== undefined) setUploadingIndex(targetIndex);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();

      if (type === "audio") {
        setFormData((prev) => ({
          ...prev,
          music: {
            ...prev.music,
            songSrc: json.url,
          },
        }));
      } else if (type === "image" && targetIndex !== undefined) {
        setFormData((prev) => {
          const newPhotos = [...(prev.photos || [])];
          newPhotos[targetIndex] = json.url;
          return { ...prev, photos: newPhotos };
        });
      }
    } catch (err) {
      alert("Failed to upload file. Please try again.");
      console.error(err);
    } finally {
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
      <div className="min-h-screen bg-[#0e0c0b] text-[#f4ecd8] flex items-center justify-center font-mono">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Secret PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0d0c] text-[#f4ecd8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1614] border border-[#2e2620] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">Birthday Admin Panel</h1>
          <p className="text-center text-sm text-[#a89b8d] mb-6">
            Enter your secret PIN to customize this birthday website.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#a89b8d] mb-1 font-mono">
                Admin PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Default: 1111"
                className={`w-full px-4 py-3 rounded-xl bg-[#120f0e] border ${
                  pinError ? "border-red-500 focus:ring-red-500" : "border-[#3b322a] focus:border-amber-500"
                } text-white text-center text-xl tracking-[0.3em] font-mono outline-none transition`}
                autoFocus
              />
              {pinError && (
                <p className="text-red-400 text-xs mt-1.5 text-center font-mono">
                  Incorrect PIN. Try 1111 if not changed.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-semibold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2e2620] text-center">
            <a
              href="/"
              className="text-xs text-[#8e8174] hover:text-amber-400 transition inline-flex items-center gap-1"
            >
              ← Back to Birthday Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0c0b] text-[#f4ecd8] pb-24 font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#151210]/90 backdrop-blur-md border-b border-[#29221c] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            🎂
          </div>
          <div>
            <h1 className="font-bold text-white text-base sm:text-lg leading-tight flex items-center gap-2">
              <span>Admin Hub</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Full Control
              </span>
            </h1>
            <p className="text-xs text-[#9a8c7e]">Customize everything for any person</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3.5 py-1.5 rounded-lg bg-[#221c18] hover:bg-[#2c241f] border border-[#3b3028] text-xs font-medium text-[#d8cab7] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Copy link to send to the birthday person"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-[#221c18] hover:bg-[#2c241f] border border-[#3b3028] text-xs font-medium text-[#d8cab7] hover:text-white flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Preview</span>
            <ExternalLink className="w-3 h-3 text-[#776b5f]" />
          </a>

          {/* Auto-Save toggle */}
          <button
            type="button"
            onClick={() => setAutoSave((v) => !v)}
            title={autoSave ? "Auto-Save is ON — changes apply instantly" : "Auto-Save is OFF — click Save manually"}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              autoSave
                ? "bg-green-900/30 border-green-700/50 text-green-300 hover:bg-green-800/40"
                : "bg-[#221c18] border-[#3b3028] text-[#a89b8d] hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoSave ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
            <span>{autoSave ? "Auto-Save ON" : "Auto-Save OFF"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-900/40 text-xs font-medium text-red-300 transition cursor-pointer flex items-center gap-1"
            title="Reset to original template content"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {saveStatus === "saving" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Important notice banner */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Private & Safe Sharing: </span>
            When you share your website link (<code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono">/</code>),
            the birthday person will <strong>only see their birthday surprise</strong>. The admin panel at{" "}
            <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono">/admin</code> is strictly hidden and password-protected!
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#29221c]">
          {[
            { id: "person", label: "👤 Person & Name", icon: User },
            { id: "countdown", label: "⏳ Countdown & Curtain", icon: Calendar },
            { id: "music", label: "🎵 Song & Music", icon: Music },
            { id: "photos", label: "🖼️ 12 Photos Gallery", icon: ImageIcon },
            { id: "cards", label: "💌 Notes & Captions", icon: Heart },
            { id: "chat", label: "📱 iMessage Finale", icon: MessageSquare },
            { id: "settings", label: "⚙️ Security & Export", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                    : "bg-[#181412] text-[#ad9e8e] hover:bg-[#231d19] hover:text-white border border-[#2a231d]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-amber-400/80"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Person & Name */}
        {activeTab === "person" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Birthday Person Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Appears in bold amber color: &ldquo;Happy Birthday [Name]&rdquo;
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Shown in the subtle top-left date badge of Section 2
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    Age revealed in Section 1 fire-burn effect
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
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm leading-relaxed"
                  placeholder="Write your heartful birthday message here..."
                />
                <p className="text-[11px] text-[#7d7165] mt-1">
                  Shown right beneath the film trail in Section 2
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Countdown & Curtain */}
        {activeTab === "countdown" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Curtain &amp; Lock Screen Countdown</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-mono"
                  />
                  <p className="text-[11px] text-[#7d7165] mt-1">
                    When countdown reaches zero, cinema curtain smoothly opens!
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
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
                  <label htmlFor="showPreviewBtn" className="text-sm font-medium text-white cursor-pointer select-none">
                    Show &ldquo;Preview&rdquo; button on curtain (lets you bypass countdown anytime)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Song & Music */}
        {activeTab === "music" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <span>Background Song &amp; Mini Player</span>
              </h2>

              <div className="p-4 rounded-xl bg-[#0f0d0c] border border-[#29221c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSongPreview}
                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition cursor-pointer shadow-lg shadow-amber-500/30"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <div className="font-semibold text-white">{formData.music.songTitle || "Song Title"}</div>
                    <div className="text-xs text-[#8f8174]">{formData.music.songArtist || "Artist"}</div>
                    <div className="text-[11px] font-mono text-amber-400/80 truncate max-w-xs sm:max-w-md mt-0.5">
                      {formData.music.songSrc}
                    </div>
                  </div>
                </div>

                {/* Upload MP3 */}
                <label className="px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2b221c] border border-[#3b3028] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition">
                  {uploadingSong ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{uploadingSong ? "Uploading Audio..." : "Upload New MP3 Song"}</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-1">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-1">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-1">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Photos Gallery (12 Photos) */}
        {activeTab === "photos" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-400" />
                    <span>Personal Photos Collection (12 Photos)</span>
                  </h2>
                  <p className="text-xs text-[#9a8c7e] mt-0.5">
                    These 12 photos power the Film Trail, Draggable Cards, Scrapbook, Galaxy 3D gallery, and background effects!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                {(formData.photos || []).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0f0d0c] border border-[#2c241e] rounded-xl p-2.5 flex flex-col items-center gap-2 group hover:border-amber-500/50 transition relative"
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
                      <label className="w-full py-1.5 px-2 rounded-lg bg-[#201a16] hover:bg-[#2e241e] border border-[#3b3028] text-[11px] font-medium text-center text-white flex items-center justify-center gap-1 cursor-pointer transition">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "image", idx);
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
          <div className="space-y-6 animate-fadeIn">
            {/* Butterfly Floating Notes */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Butterfly Flying Notes (5 Romantic/Personal Notes)</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                These flutter around like butterflies and reveal lovely notes when tapped!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.butterflyNotes || []).map((note, index) => (
                  <div key={note.id || index} className="p-4 rounded-xl bg-[#0f0d0c] border border-[#29221c] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Note #{note.title || `0${index + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[#7d7165]">Wing Color:</label>
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
                      className="w-full px-3 py-2 rounded-lg bg-[#181412] border border-[#332a22] text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Love Gallery Captions */}
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>Draggable Polaroid Photo Captions (10 Captions)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white outline-none transition text-sm font-mono"
                  />
                </div>
              </div>

              {/* Chat Message Sequence */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Chat Message Sequence (Typed in order)</h3>
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
                    className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Message</span>
                  </button>
                </div>

                {(formData.chatStory.messages || []).map((msg, index) => (
                  <div key={index} className="flex items-center gap-3">
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
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#332a22] text-sm text-white focus:border-amber-500 outline-none"
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

        {/* TAB 7: Settings & Export */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Admin Security PIN</span>
              </h2>

              <div className="max-w-xs">
                <label className="block text-xs uppercase font-mono tracking-wider text-[#a89b8d] mb-1.5">
                  Change Admin PIN
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f0d0c] border border-[#3b322a] focus:border-amber-500 text-white font-mono text-center text-lg tracking-widest outline-none"
                />
                <p className="text-[11px] text-[#7d7165] mt-1">
                  Remember this PIN to access the admin panel in the future.
                </p>
              </div>
            </div>

            <div className="bg-[#161210] border border-[#2e2620] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-amber-400" />
                <span>Backup &amp; Export Configuration</span>
              </h2>
              <p className="text-xs text-[#9a8c7e]">
                You can download all your customizations as a JSON file, or restore from a previously saved JSON file.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
                    const dl = document.createElement("a");
                    dl.setAttribute("href", dataStr);
                    dl.setAttribute("download", `birthday-config-${formData.person.name || "person"}.json`);
                    dl.click();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2c241e] border border-[#3b3028] text-xs font-semibold text-white flex items-center gap-2 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="px-4 py-2.5 rounded-xl bg-[#201a16] hover:bg-[#2c241e] border border-[#3b3028] text-xs font-semibold text-white flex items-center gap-2 transition cursor-pointer">
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
                          alert("Configuration loaded! Click 'Save Changes' to apply.");
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
    </div>
  );
}

