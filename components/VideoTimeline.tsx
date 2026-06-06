"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Scissors, Trash2, Plus, ZoomIn, ZoomOut, Film, Merge, GripVertical, Play, Clock, Settings } from "lucide-react"

export interface VideoClip {
  id: string
  startTime: number // seconds
  endTime: number   // seconds
  order: number
}

interface VideoTimelineProps {
  duration: number
  currentTime: number
  clips: VideoClip[]
  onClipsChange: (clips: VideoClip[]) => void
  onSeekTo: (time: number) => void
  onSplitAtPlayhead: () => void
  onMergeExport: () => void
  isMerging?: boolean
  selectedClipId: string | null
  onSelectClip: (id: string | null) => void
  onOpenSettings?: () => void
}

const formatTime = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? "0" : ""}${s}`
}

const formatTimePrecise = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1)
  return `${m}:${parseFloat(s) < 10 ? "0" : ""}${s}`
}

export default function VideoTimeline({
  duration,
  currentTime,
  clips,
  onClipsChange,
  onSeekTo,
  onSplitAtPlayhead,
  onMergeExport,
  isMerging = false,
  selectedClipId,
  onSelectClip,
  onOpenSettings
}: VideoTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [trimming, setTrimming] = useState<{ clipId: string; side: "left" | "right" } | null>(null)
  const [enteringClipId, setEnteringClipId] = useState<string | null>(null)

  // Compute total duration of all clips
  const totalClipsDuration = clips.reduce((sum, c) => sum + (c.endTime - c.startTime), 0)

  // Pixels per second (zoomed)
  const pixelsPerSecond = Math.max(8, 12 * zoom)
  const trackWidth = Math.max(600, duration * pixelsPerSecond)

  // Ruler marks
  const rulerInterval = zoom >= 2 ? 5 : zoom >= 1 ? 10 : 15
  const rulerMarks: number[] = []
  for (let t = 0; t <= duration; t += rulerInterval) {
    rulerMarks.push(t)
  }

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, clipId: string) => {
    setDraggedClipId(clipId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", clipId)
  }

  const handleDragEnd = () => {
    if (draggedClipId && dropTargetIndex !== null) {
      const sorted = [...clips].sort((a, b) => a.order - b.order)
      const draggedIdx = sorted.findIndex(c => c.id === draggedClipId)
      if (draggedIdx !== -1 && dropTargetIndex !== draggedIdx) {
        const moved = sorted.splice(draggedIdx, 1)[0]
        const insertIdx = dropTargetIndex > draggedIdx ? dropTargetIndex - 1 : dropTargetIndex
        sorted.splice(insertIdx, 0, moved)
        const reordered = sorted.map((c, i) => ({ ...c, order: i }))
        onClipsChange(reordered)
      }
    }
    setDraggedClipId(null)
    setDropTargetIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDropTargetIndex(index)
  }

  const handleDragLeave = () => {
    setDropTargetIndex(null)
  }

  // --- Trim handles ---
  const handleTrimStart = useCallback((e: React.MouseEvent, clipId: string, side: "left" | "right") => {
    e.stopPropagation()
    e.preventDefault()
    setTrimming({ clipId, side })
  }, [])

  useEffect(() => {
    if (!trimming) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const scrollLeft = trackRef.current.scrollLeft
      const x = e.clientX - rect.left + scrollLeft
      const timeAtX = (x / trackWidth) * duration

      onClipsChange(clips.map(c => {
        if (c.id !== trimming.clipId) return c
        if (trimming.side === "left") {
          const newStart = Math.max(0, Math.min(timeAtX, c.endTime - 0.5))
          return { ...c, startTime: newStart }
        } else {
          const newEnd = Math.min(duration, Math.max(timeAtX, c.startTime + 0.5))
          return { ...c, endTime: newEnd }
        }
      }))
    }

    const handleMouseUp = () => {
      setTrimming(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [trimming, clips, duration, trackWidth, onClipsChange])

  // --- Delete clip ---
  const handleDeleteClip = (clipId: string) => {
    const filtered = clips.filter(c => c.id !== clipId)
    const reordered = filtered
      .sort((a, b) => a.order - b.order)
      .map((c, i) => ({ ...c, order: i }))
    onClipsChange(reordered)
    if (selectedClipId === clipId) onSelectClip(null)
  }

  // --- Track click to seek ---
  const handleTrackClick = (e: React.MouseEvent) => {
    if (trimming) return
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const scrollLeft = trackRef.current.scrollLeft
    const x = e.clientX - rect.left + scrollLeft
    const timeAtX = Math.max(0, Math.min((x / trackWidth) * duration, duration))
    onSeekTo(timeAtX)
  }

  // Sorted clips for display
  const sortedClips = [...clips].sort((a, b) => a.order - b.order)

  // Playhead position
  const playheadLeft = duration > 0 ? (currentTime / duration) * trackWidth : 0

  // Find which clip is currently playing
  const activeClip = sortedClips.find(c => currentTime >= c.startTime && currentTime <= c.endTime)

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col gap-3 font-sans shadow-md">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-xl">
            <Film className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-extrabold text-brand uppercase tracking-wider">Timeline Editor</span>
          </div>
          
          {/* Clip count */}
          <div className="bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-lg">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
              {sortedClips.length} Clip{sortedClips.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Total duration of clips */}
          <div className="bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
              {formatTime(totalClipsDuration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Split at Playhead */}
          <button
            onClick={onSplitAtPlayhead}
            disabled={!activeClip}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 ${
              activeClip
                ? "bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100"
                : "bg-slate-50 border border-slate-200/60 text-slate-400 cursor-not-allowed"
            }`}
            title="Split clip at current playhead position"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {/* Delete Selected */}
          <button
            onClick={() => selectedClipId && handleDeleteClip(selectedClipId)}
            disabled={!selectedClipId || sortedClips.length <= 1}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 ${
              selectedClipId && sortedClips.length > 1
                ? "bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100"
                : "bg-slate-50 border border-slate-200/60 text-slate-400 cursor-not-allowed"
            }`}
            title="Delete selected clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Reset to Full */}
          <button
            onClick={() => {
              onClipsChange([{ id: "clip-0", startTime: 0, endTime: duration, order: 0 }])
              onSelectClip(null)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-700 hover:border-slate-300 rounded-xl text-[10px] font-extrabold transition-all active:scale-95"
            title="Reset timeline to full video"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden ml-1">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-extrabold w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Customizer Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-700 hover:border-brand/40 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 ml-1"
              title="Buka pengaturan gaya subtitle dan watermark"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Track */}
      <div
        ref={trackRef}
        className="timeline-track cursor-crosshair"
        onClick={handleTrackClick}
        style={{ width: "100%", position: "relative" }}
      >
        {/* Inner scrollable content */}
        <div style={{ width: `${trackWidth}px`, position: "relative", minHeight: "90px" }}>
          
          {/* Ruler */}
          <div className="timeline-ruler" style={{ width: "100%" }}>
            {rulerMarks.map(t => (
              <div key={t} style={{ left: `${(t / duration) * 100}%` }}>
                <div
                  className="timeline-ruler-mark"
                  style={{
                    left: `${(t / duration) * 100}%`,
                    height: t % 30 === 0 ? "12px" : "6px",
                    position: "absolute",
                    bottom: 0
                  }}
                />
                <span
                  className="timeline-ruler-label"
                  style={{ left: `${(t / duration) * 100}%` }}
                >
                  {formatTime(t)}
                </span>
              </div>
            ))}
          </div>

          {/* Clips Track */}
          <div className="flex items-stretch gap-0 px-1 py-2" style={{ minHeight: "60px", position: "relative" }}>
            {/* Background: full video as faded reference */}
            <div
              className="absolute inset-x-0 top-2 bottom-2 rounded-lg opacity-[0.06]"
              style={{
                background: "repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 1px, transparent 1px, transparent 8px)",
              }}
            />

            {/* Clips rendered at their absolute time positions */}
            {sortedClips.map((clip, idx) => {
              const clipLeft = (clip.startTime / duration) * 100
              const clipWidth = ((clip.endTime - clip.startTime) / duration) * 100
              const isSelected = selectedClipId === clip.id
              const isDragging = draggedClipId === clip.id
              const isEntering = enteringClipId === clip.id
              const clipDuration = clip.endTime - clip.startTime

              return (
                <div key={clip.id}>
                  {/* Drop zone before this clip */}
                  <div
                    className={`timeline-drop-zone ${dropTargetIndex === idx ? "active" : ""}`}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => {}}
                    style={{
                      position: "absolute",
                      left: `calc(${clipLeft}% - 12px)`,
                      top: "8px",
                      bottom: "8px",
                      width: "8px",
                      zIndex: 5
                    }}
                  />

                  {/* Clip card */}
                  <div
                    className={`timeline-clip ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""} ${isEntering ? "timeline-clip-enter" : ""}`}
                    style={{
                      position: "absolute",
                      left: `${clipLeft}%`,
                      width: `${clipWidth}%`,
                      top: "8px",
                      bottom: "8px",
                      minWidth: "40px"
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, clip.id)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectClip(clip.id)
                    }}
                    onAnimationEnd={() => {
                      if (enteringClipId === clip.id) setEnteringClipId(null)
                    }}
                  >
                    {/* Trim handles */}
                    <div
                      className="clip-trim-handle left"
                      onMouseDown={(e) => handleTrimStart(e, clip.id, "left")}
                    />
                    <div
                      className="clip-trim-handle right"
                      onMouseDown={(e) => handleTrimStart(e, clip.id, "right")}
                    />

                    {/* Clip content */}
                    <div className="flex items-center justify-between h-full px-3 pointer-events-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3 h-3 text-white/30 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-extrabold text-white/70 truncate">
                            Clip {idx + 1}
                          </span>
                          <span className="text-[8px] font-mono text-white/40 truncate">
                            {formatTimePrecise(clip.startTime)} → {formatTimePrecise(clip.endTime)}
                          </span>
                        </div>
                      </div>
                      {clipWidth > 6 && (
                        <span className="text-[8px] font-mono font-bold text-brand/80 shrink-0 ml-1">
                          {formatTime(clipDuration)}
                        </span>
                      )}
                    </div>

                    {/* Waveform-like visual decoration inside clip */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none flex items-end px-1 gap-[1px]">
                      {Array.from({ length: Math.min(Math.max(Math.floor(clipWidth * 2), 5), 80) }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-full w-full"
                          style={{ height: `${Math.sin(i * 0.5 + clip.startTime) * 40 + 45}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Drop zone after last clip */}
                  {idx === sortedClips.length - 1 && (
                    <div
                      className={`timeline-drop-zone ${dropTargetIndex === idx + 1 ? "active" : ""}`}
                      onDragOver={(e) => handleDragOver(e, idx + 1)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => {}}
                      style={{
                        position: "absolute",
                        left: `calc(${clipLeft + clipWidth}% + 4px)`,
                        top: "8px",
                        bottom: "8px",
                        width: "8px",
                        zIndex: 5
                      }}
                    />
                  )}
                </div>
              )
            })}

            {/* Playhead */}
            <div
              className="timeline-playhead"
              style={{ left: `${playheadLeft}px` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom info bar: Merge / Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[9px] text-slate-400 font-bold tracking-wide">
            Drag klip untuk mengatur ulang urutan • Klik pada timeline untuk seek • Geser trim handle untuk menyesuaikan
          </p>
        </div>

        <button
          onClick={onMergeExport}
          disabled={isMerging || sortedClips.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-lg ${
            isMerging
              ? "bg-slate-200 text-slate-400 cursor-wait"
              : "bg-brand hover:bg-brand-dark text-white shadow-brand/25"
          }`}
        >
          {isMerging ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Merging...</span>
            </>
          ) : (
            <>
              <Merge className="w-4 h-4" />
              <span>Merge & Export</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
