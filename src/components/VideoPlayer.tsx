"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_VOLUME = 0.25;

export default function VideoPlayer({
  src,
  fit = "cover",
  onAspectRatio,
}: {
  src: string;
  // "cover" fills its container edge-to-edge, cropping top/bottom as needed
  // (the usual case). "natural" instead renders at the video's own aspect
  // ratio, full width, however tall that makes it — used for non-16:9
  // clips so nothing gets cropped; the controls bar becomes sticky so it
  // stays on screen while scrolling through a taller-than-viewport video.
  fit?: "cover" | "natural";
  onAspectRatio?: (ratio: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const seekingRef = useRef(false);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [progress, setProgress] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(true);
  const [volumeHovering, setVolumeHovering] = useState(false);
  const userPausedRef = useRef(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The controls bar stays visible while the cursor is actually moving, and
  // fades out after a couple seconds of stillness — same idea as YouTube.
  const wakeUp = () => {
    setActive(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => setActive(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Browsers block (or silently re-pause) autoplay-with-sound outside a
  // user gesture, so we always start muted — which is reliably allowed —
  // then try to unmute right away. If the browser rejects or reverts that,
  // the "unexpected pause" handler below falls back to staying muted.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = DEFAULT_VOLUME;
    video.muted = true;
    video.play().then(() => {
      video.muted = false;
      setMuted(false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onAspectRatio) return;

    const reportRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        onAspectRatio(video.videoWidth / video.videoHeight);
      }
    };
    if (video.readyState >= 1) reportRatio();
    video.addEventListener("loadedmetadata", reportRatio);
    return () => video.removeEventListener("loadedmetadata", reportRatio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (seekingRef.current || !video.duration) return;
      setProgress(video.currentTime / video.duration);
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => {
      setPlaying(false);
      // An unmuted video pausing itself (not via the pause button) means
      // the browser's autoplay policy rejected it after the fact — retry
      // muted rather than leaving playback stuck.
      if (!userPausedRef.current && !video.muted) {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      }
      userPausedRef.current = false;
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    const wasPlaying = !video.paused;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted && video.volume === 0) {
      video.volume = DEFAULT_VOLUME;
      setVolume(DEFAULT_VOLUME);
    }
    // Chrome pauses media that gets unmuted outside a tight user-gesture ->
    // play() call, so re-assert play() synchronously within this handler.
    if (wasPlaying) video.play().catch(() => {});
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const wasPlaying = !video.paused;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
    if (wasPlaying) video.play().catch(() => {});
  };

  const seekToClientX = (clientX: number) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  };

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekingRef.current = true;
    seekToClientX(e.clientX);
    const handleMove = (moveEvent: PointerEvent) => seekToClientX(moveEvent.clientX);
    // Releasing the mouse should always end the drag — a stray pointercancel
    // (fast movement, trackpad quirks, focus changes) must clean up too, or
    // the bar keeps following the cursor until the next click "releases" it.
    const stop = () => {
      seekingRef.current = false;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };

  const setVolumeFromClientY = (clientY: number) => {
    const bar = volumeBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
    handleVolumeChange(ratio);
  };

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setVolumeFromClientY(e.clientY);
    const handleMove = (moveEvent: PointerEvent) => setVolumeFromClientY(moveEvent.clientY);
    const stop = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else container.requestFullscreen().catch(() => {});
  };

  const showBar = !playing || (hovering && active);

  return (
    <div
      ref={containerRef}
      className={`group relative bg-black ${fit === "cover" ? "h-full w-full" : "w-full"}`}
      onMouseEnter={() => {
        setHovering(true);
        wakeUp();
      }}
      onMouseMove={wakeUp}
      onMouseLeave={() => {
        setHovering(false);
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className={fit === "cover" ? "absolute inset-0 h-full w-full object-cover" : "block h-auto w-full"}
        loop
        playsInline
        onClick={togglePlay}
      />

      <div
        className={`inset-x-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 transition-opacity duration-200 ${
          fit === "cover" ? "absolute bottom-0" : "sticky bottom-0"
        } ${showBar ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Lecture"}
          className="shrink-0 text-white"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* The clickable/draggable hit area (h-4) is taller than the visible
            bar (h-0.5) so dragging doesn't require pixel-precise aim. */}
        <div
          ref={progressBarRef}
          onPointerDown={handleSeekPointerDown}
          className="relative flex h-4 flex-1 cursor-pointer items-center"
        >
          <div className="relative h-0.5 w-full rounded-full bg-white/30">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{ left: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div
          className="relative flex shrink-0 items-center"
          onMouseEnter={() => setVolumeHovering(true)}
          onMouseLeave={() => setVolumeHovering(false)}
        >
          {/* pb-3 (instead of a margin on the box below) keeps the hoverable
              area continuous from the button up through the slider, so the
              pointer never crosses a dead zone and loses hover state. */}
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-3 transition-opacity duration-150 ${
              volumeHovering ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* Same widened-hit-area trick as the seek bar, rotated: w-4 is
                the clickable width, w-0.5 inside it is the visible bar. */}
            <div
              ref={volumeBarRef}
              onPointerDown={handleVolumePointerDown}
              className="relative flex h-24 w-4 cursor-pointer items-center justify-center"
            >
              <div className="relative h-full w-0.5 rounded-full bg-white/30">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-white"
                  style={{ height: `${(muted ? 0 : volume) * 100}%` }}
                />
                <div
                  className="absolute left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-white"
                  style={{ bottom: `${(muted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Activer le son" : "Couper le son"}
            className="text-white"
          >
            {muted ? <VolumeMuteIcon /> : <VolumeOnIcon />}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Plein écran"
          className="shrink-0 text-white"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z" />
      <path d="M14 4.13v2.07c2.35.75 4 2.99 4 5.8s-1.65 5.05-4 5.8v2.07c3.45-.83 6-3.95 6-7.87s-2.55-7.04-6-7.87z" />
    </svg>
  );
}

function VolumeMuteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <line x1="16" y1="8" x2="22" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="22" y1="8" x2="16" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
