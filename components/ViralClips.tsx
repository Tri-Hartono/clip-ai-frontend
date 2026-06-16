"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchVideoAnalysis, fetchActiveModels } from "@/services/analysis"
import { Loader2, Copy, Sparkles, Scissors, Hash, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

interface ViralClipsProps {
  videoId: string | number
  videoPath?: string
  onExtractClip?: (start: string, end: string) => void
  onEditClip?: (start: string, end: string) => void
}

export function ViralClips({ videoId, videoPath, onExtractClip, onEditClip }: ViralClipsProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash")

  const { data: activeModels } = useQuery({
    queryKey: ["activeModels"],
    queryFn: fetchActiveModels,
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["videoAnalysis", videoId, selectedModel],
    queryFn: () => fetchVideoAnalysis(videoId, selectedModel),
    enabled: false, // Wait for user to trigger it to save LLM costs if not needed immediately
  })

  useEffect(() => {
    if (activeModels && activeModels.length > 0) {
      const exists = activeModels.some((m) => m.name === selectedModel)
      if (!exists) {
        setSelectedModel(activeModels[0].name)
      }
    }
  }, [activeModels, selectedModel])

  const getErrorMessage = () => {
    if (!error) return "Failed to load analysis. Make sure the backend and AI worker are running, and Gemini API key is configured."
    const err = error as any
    if (err.response?.data?.error) {
       return `AI Analysis Error: ${err.response.data.error}`
    }
    return err.message || "Failed to load analysis."
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const videoUrl = videoPath 
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${videoPath.replace("./", "").replace("backend/", "")}`
    : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-500" /> AI Video Analysis
          </h2>
          <p className="text-muted-foreground text-sm text-slate-500">Extract viral clips, hooks, and SEO metadata using Gemini AI.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-700 outline-none focus:border-brand"
          >
            {activeModels && activeModels.length > 0 ? (
              activeModels.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.displayName}
                </option>
              ))
            ) : (
              <>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="groq-llama-3.1-8b-instant">Groq Llama-3.1 8B (Fast/Free)</option>
              </>
            )}
          </select>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Video"}
          </button>
        </div>
      </div>

      {isError && (
        <div className="text-red-500 bg-red-50 p-4 rounded-md text-sm font-medium whitespace-pre-wrap border border-red-100">
          {getErrorMessage()}
        </div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Viral Clips Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended Clips
            </h3>
            {data.viral_clips.map((clip, idx) => (
              <div key={idx} className="rounded-lg border bg-blue-50/50 border-blue-100 text-slate-950 shadow-sm overflow-hidden">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">Clip #{idx + 1}</h3>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 border-transparent">Hook: {clip.hook_score}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-transparent">Viral: {clip.viral_score}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {clip.start_time} - {clip.end_time}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  {videoUrl && (
                    <ClipVideoPlayer 
                      videoUrl={videoUrl}
                      startTimeStr={clip.start_time}
                      endTimeStr={clip.end_time}
                    />
                  )}
                  {clip.title && (
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{clip.title}</h4>
                  )}
                  <p className="text-sm text-slate-500 mb-4">{clip.rationale}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        console.log("ViralClips: Edit This Clip clicked", clip.start_time, clip.end_time)
                        if (onEditClip) {
                          onEditClip(clip.start_time, clip.end_time)
                        } else {
                          console.warn("ViralClips: onEditClip prop is missing!")
                        }
                      }}
                      className="flex-1 h-9 px-3 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Edit This Clip
                    </button>
                    <button 
                      onClick={() => onExtractClip && onExtractClip(clip.start_time, clip.end_time)}
                      className="h-9 px-3 rounded-md border border-slate-200 bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-4 h-4" /> Extract Clip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="rounded-lg border bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-500" /> SEO Metadata
                </h3>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Suggested Title</span>
                    <button className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-slate-100" onClick={() => handleCopy(data.title)}>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm border p-2 rounded-md bg-slate-50 text-slate-700">{data.title}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Description</span>
                    <button className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-slate-100" onClick={() => handleCopy(data.description)}>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm border p-2 rounded-md bg-slate-50 text-slate-700 whitespace-pre-wrap">{data.description}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Hashtags</span>
                    <button className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-slate-100" onClick={() => handleCopy(data.hashtags.join(" "))}>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {data.hashtags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cuts Section */}
            <div className="rounded-lg border bg-white text-slate-950 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-red-500" /> Recommended Cuts
                </h3>
              </div>
              <div className="p-6 pt-0">
                <ul className="space-y-2">
                  {data.recommended_cuts.map((cut, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="font-medium">{cut.start_time} - {cut.end_time}</span>
                      <span className="text-slate-500">{cut.reason}</span>
                    </li>
                  ))}
                  {data.recommended_cuts.length === 0 && (
                    <p className="text-sm text-slate-500">No cuts recommended.</p>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

// Helper to convert time strings (MM:SS or HH:MM:SS) to seconds
const parseTimeStrToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0
  const parts = timeStr.split(":")
  if (parts.length === 3) {
    const [sh, sm, ss] = parts
    return parseInt(sh) * 3600 + parseInt(sm) * 60 + parseFloat(ss.replace(",", "."))
  } else if (parts.length === 2) {
    const [sm, ss] = parts
    return parseInt(sm) * 60 + parseFloat(ss.replace(",", "."))
  } else {
    return parseFloat(timeStr.replace(",", ".")) || 0
  }
}

interface ClipVideoPlayerProps {
  videoUrl: string
  startTimeStr: string
  endTimeStr: string
}

const formatSeconds = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function ClipVideoPlayer({ videoUrl, startTimeStr, endTimeStr }: ClipVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const startSec = parseTimeStrToSeconds(startTimeStr)
  const endSec = parseTimeStrToSeconds(endTimeStr)
  const clipDuration = endSec - startSec

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startSec)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = startSec
    setCurrentTime(startSec)
    setIsPlaying(false)
  }, [videoUrl, startSec])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    const curr = video.currentTime
    setCurrentTime(curr)

    if (curr < startSec) {
      video.currentTime = startSec
      setCurrentTime(startSec)
    } else if (curr >= endSec) {
      video.pause()
      video.currentTime = startSec
      setCurrentTime(startSec)
      setIsPlaying(false)
    }
  }

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      if (video.currentTime >= endSec || video.currentTime < startSec) {
        video.currentTime = startSec
      }
      video.play().then(() => {
        setIsPlaying(true)
      }).catch(err => console.log("Playback error:", err))
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const relativeTime = parseFloat(e.target.value)
    const newTime = startSec + relativeTime
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const relativeCurrentTime = Math.max(0, currentTime - startSec)

  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video mb-3 shadow-inner group flex flex-col justify-end">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain cursor-pointer absolute inset-0"
        onTimeUpdate={handleTimeUpdate}
        onClick={() => togglePlay()}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Large Center Play Overlay (only when paused) */}
      {!isPlaying && (
        <div 
          onClick={(e) => togglePlay(e)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer hover:bg-black/30 transition-all duration-200"
        >
          <div className="p-3 bg-brand hover:bg-brand/95 text-white rounded-full shadow-xl transform hover:scale-105 transition-all">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Custom Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-sm p-3 flex flex-col gap-2 transition-all">
        {/* Timeline Slider */}
        <input
          type="range"
          min={0}
          max={clipDuration > 0 ? clipDuration : 1}
          step={0.1}
          value={relativeCurrentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-700 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-brand transition-all"
        />

        {/* Buttons and Time */}
        <div className="flex items-center justify-between text-white text-xs select-none">
          <div className="flex items-center gap-3">
            <button onClick={(e) => togglePlay(e)} className="hover:text-brand transition-colors">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button onClick={toggleMute} className="hover:text-brand transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="font-mono">
              {formatSeconds(relativeCurrentTime)} / {formatSeconds(clipDuration)}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation()
              const video = videoRef.current
              if (video) {
                video.currentTime = startSec
                if (!isPlaying) {
                  video.play().then(() => setIsPlaying(true))
                }
              }
            }}
            className="flex items-center gap-1 hover:text-brand transition-colors text-[10px] uppercase font-bold"
            title="Replay from start"
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
        </div>
      </div>
    </div>
  )
}


