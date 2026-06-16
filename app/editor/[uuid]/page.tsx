"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import Sidebar from "@/components/Sidebar"
import SubtitleEditor, { SubtitleItem } from "@/components/SubtitleEditor"
import ExportModal from "@/components/ExportModal"
import PublishModal from "@/components/PublishModal"
import { ViralClips } from "@/components/ViralClips"
import VideoTimeline, { VideoClip } from "@/components/VideoTimeline"
import IntroBuilderModal from "@/components/IntroBuilderModal"
import { ArrowLeft, Video, Download, RefreshCw, Sparkles, X, Scissors, Play as PlayIcon, Pause as PauseIcon, Smartphone, Monitor, RotateCcw, RotateCw, Settings2, Share2 } from "lucide-react"
import { api } from "@/services/api"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.uuid || params.id
  
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")
  
  const [video, setVideo] = useState<any>(null)
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [srtContent, setSrtContent] = useState("")
  const [subtitleStyleOpen, setSubtitleStyleOpen] = useState(false)

  // Intro Builder States
  const [introModalTarget, setIntroModalTarget] = useState<"merge" | "clip" | null>(null)
  const [pendingClipParams, setPendingClipParams] = useState<{ start: string, end: string, format: "landscape"|"portrait", color: string } | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  // Watermark States
  const [wmImage, setWmImage] = useState<string | null>(null)
  const [wmOpacity, setWmOpacity] = useState(100)
  const [wmScale, setWmScale] = useState(25)
  const [wmPosition, setWmPosition] = useState("top-right")

  // Playback Control States
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const seekRelative = (seconds: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds
      const videoDuration = videoRef.current.duration || duration
      if (newTime < 0) newTime = 0
      if (newTime > videoDuration) newTime = videoDuration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        seekRelative(-5)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        seekRelative(5)
      } else if (e.key === " ") {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Timeline Trimming states
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(10) 
  const [clipFormat, setClipFormat] = useState<"landscape" | "portrait">("landscape") 
  const [selectedColor, setSelectedColor] = useState<"yellow" | "white" | "green" | "cyan">("yellow") // Subtitle color picker
  const [burnSubtitles, setBurnSubtitles] = useState(true) // Option to burn subtitles
  const [activeSubId, setActiveSubId] = useState<number | null>(null) // Active subtitle segment highlights

  // Multi-clip timeline editor states
  const [clips, setClips] = useState<VideoClip[]>([{ id: "clip-0", startTime: 0, endTime: 10, order: 0 }])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isMerging, setIsMerging] = useState(false)
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null)
  const clipIdCounter = useRef(1)

  // Subtitle Customizer States (Real-time preview and export hardburn)
  const [captionUppercase, setCaptionUppercase] = useState(true)
  const [captionFontsize, setCaptionFontsize] = useState(20) 
  const [captionOutline, setCaptionOutline] = useState(2.5)
  const [captionMarginV, setCaptionMarginV] = useState(30)
  const [singleWordMode, setSingleWordMode] = useState(true)
  const [useFaceAI, setUseFaceAI] = useState(false)
  const [captionBackground, setCaptionBackground] = useState(false)
  const [captionFontname, setCaptionFontname] = useState("Impact")

  useEffect(() => {
    if (clipFormat === "portrait") {
      setCaptionFontsize(28)
      setCaptionOutline(3.5)
      setCaptionMarginV(55)
    } else {
      setCaptionFontsize(20)
      setCaptionOutline(2.5)
      setCaptionMarginV(30)
      if (videoRef.current) {
        videoRef.current.style.objectPosition = "center"
      }
    }
  }, [clipFormat])

  // AI Clip states
  const [clipping, setClipping] = useState(false)
  const [activeClipUrl, setActiveClipUrl] = useState<string | null>(null)
  const [clipStatusMsg, setClipStatusMsg] = useState("")
  
  // Dynamic Live Preview Tracking States
  const [trackingData, setTrackingData] = useState<{t: number, p: number}[] | null>(null)
  const [isTrackingLoading, setIsTrackingLoading] = useState(false)
  const animationRef = useRef<number | null>(null)

  // 60FPS Live Preview Panning using requestAnimationFrame
  useEffect(() => {
    if (clipFormat !== "portrait" || !useFaceAI || !trackingData || trackingData.length === 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (clipFormat === "portrait" && !useFaceAI && videoRef.current) {
        videoRef.current.style.objectPosition = "center"
      }
      return
    }

    const updatePosition = () => {
      if (!videoRef.current) {
        animationRef.current = requestAnimationFrame(updatePosition)
        return
      }
      
      const curTime = videoRef.current.currentTime
      
      // Binary search to find enclosing frames
      let low = 0
      let high = trackingData.length - 1
      let mid = 0
      let found = false
      while (low <= high) {
        mid = Math.floor((low + high) / 2)
        if (trackingData[mid].t < curTime) {
          low = mid + 1
        } else if (trackingData[mid].t > curTime) {
          high = mid - 1
        } else {
          found = true
          break
        }
      }
      
      let point1, point2
      if (found) {
        point1 = trackingData[mid]
        point2 = trackingData[mid]
      } else {
        const idx1 = Math.max(0, Math.min(trackingData.length - 1, high))
        const idx2 = Math.max(0, Math.min(trackingData.length - 1, low))
        point1 = trackingData[idx1]
        point2 = trackingData[idx2]
      }
      
      let p = point1.p
      if (point2.t > point1.t) {
        // Linear interpolation between the two closest frames
        const ratio = (curTime - point1.t) / (point2.t - point1.t)
        const clampedRatio = Math.max(0, Math.min(1, ratio))
        p = point1.p + (point2.p - point1.p) * clampedRatio
      }
      
      videoRef.current.style.objectPosition = `${p}% center`
      
      animationRef.current = requestAnimationFrame(updatePosition)
    }

    animationRef.current = requestAnimationFrame(updatePosition)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [clipFormat, useFaceAI, trackingData])

  useEffect(() => {
    if (clipFormat === "portrait" && useFaceAI && !trackingData && !isTrackingLoading && video?.id) {
      const fetchTracking = async () => {
        setIsTrackingLoading(true)
        try {
          const res = await api.get(`/api/videos/${id}/tracking?t=${Date.now()}`)
          if (res.data && res.data.data) {
            setTrackingData(res.data.data)
          }
        } catch (e) {
          console.error("Failed to load tracking data for live preview", e)
        } finally {
          setIsTrackingLoading(false)
        }
      }
      fetchTracking()
    }
  }, [clipFormat, useFaceAI, trackingData, isTrackingLoading, id, video?.id])

  // Recovery Draft States
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [savedDraft, setSavedDraft] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const videoResp = await api.get(`/api/videos/${id}`)
        setVideo(videoResp.data)

        if (videoResp.data.draftState) {
          try {
            const draft = JSON.parse(videoResp.data.draftState)
            setSavedDraft(draft)
            setShowRecoveryModal(true)
          } catch (e) {}
        }
        
        const subsResp = await api.get(`/api/videos/${id}/subtitles`)
        if (subsResp.data && subsResp.data.length > 0) {
          setSubtitles(subsResp.data)
        }
      } catch (error) {
        console.error("Editor backend request failed, mounting sandbox mockup", error)
        setVideo({
          id: id,
          title: "Product Launch Walkthrough.mp4",
          status: "completed",
        })
        setSubtitles([
          { id: 1, startTime: "00:00:01,000", endTime: "00:00:04,000", text: "Hello, welcome to Clippers!" },
          { id: 2, startTime: "00:00:04,500", endTime: "00:00:08,000", text: "Enjoy advanced high-performance web timeline trimming." }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [id])

  // Auto-Save Cloud Draft Engine (Debounced 2s)
  const draftStateTimeout = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current || showRecoveryModal) {
      if (!showRecoveryModal) {
        isInitialMount.current = false
      }
      return
    }

    if (draftStateTimeout.current) {
      clearTimeout(draftStateTimeout.current)
    }

    draftStateTimeout.current = setTimeout(async () => {
      try {
        const draftObj = {
          subtitles,
          clips,
          clipFormat,
          selectedColor,
          captionUppercase,
          captionFontsize,
          captionOutline,
          captionMarginV,
          wmImage,
          wmOpacity,
          wmScale,
          wmPosition,
          useFaceAI
        }
        await api.put(`/api/videos/${id}/draft`, { draftState: JSON.stringify(draftObj) })
      } catch (err) {
        console.warn("Auto-save draft failed", err)
      }
    }, 2000)

  }, [subtitles, clips, clipFormat, selectedColor, captionUppercase, captionFontsize, captionOutline, captionMarginV, wmImage, wmOpacity, wmScale, wmPosition, showRecoveryModal, useFaceAI])

  const handleSubtitlesSave = async (subs: SubtitleItem[]) => {
    setSubtitles(subs)
    const srt = subs.map((sub) => {
      return `${sub.id}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`
    }).join("\n")
    setSrtContent(srt)

    try {
      await api.put(`/api/videos/${id}/subtitles`, subs)
    } catch (err) {
      console.error("Failed to save edited subtitles to backend", err)
    }
  }

  const formatTimeStrWithMs = (sec: number) => {
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec - hours * 3600) / 60)
    const seconds = Math.floor(sec - hours * 3600 - minutes * 60)
    const ms = Math.floor((sec % 1) * 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

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

  const generateMappedData = (exportClips: VideoClip[], currentSubtitles: SubtitleItem[]) => {
    const sortedClips = [...exportClips].sort((a, b) => a.order - b.order)
    let srtLines: string[] = []
    let mappedJson: SubtitleItem[] = []
    let srtCounter = 1
    let jsonCounter = 1
    let currentTimeOffset = 0 // Seconds from the start of the final video

    for (const clip of sortedClips) {
      for (const sub of currentSubtitles) {
        const subStart = parseTimeStrToSeconds(sub.startTime)
        const subEnd = parseTimeStrToSeconds(sub.endTime)

        if (subEnd > clip.startTime && subStart < clip.endTime) {
          const effectiveStart = Math.max(subStart, clip.startTime)
          const effectiveEnd = Math.min(subEnd, clip.endTime)
          const mappedStart = (effectiveStart - clip.startTime) + currentTimeOffset
          const mappedEnd = (effectiveEnd - clip.startTime) + currentTimeOffset

          let mappedWords: {word: string; start: number; end: number}[] = []
          if (sub.words && sub.words.length > 0) {
            for (const word of sub.words) {
              const wordStart = word.start
              let wordEnd = word.end
              if (wordStart >= wordEnd) wordEnd = wordStart + 0.1

              if (wordEnd > clip.startTime && wordStart < clip.endTime) {
                const wStart = Math.max(wordStart, clip.startTime)
                const wEnd = Math.min(wordEnd, clip.endTime)
                mappedWords.push({
                  word: word.word,
                  start: wStart - clip.startTime + currentTimeOffset,
                  end: wEnd - clip.startTime + currentTimeOffset
                })
              }
            }
          }

          mappedJson.push({
            id: jsonCounter++,
            startTime: formatTimeStrWithMs(mappedStart),
            endTime: formatTimeStrWithMs(mappedEnd),
            text: sub.text,
            words: mappedWords
          })

          if (singleWordMode && mappedWords.length > 0) {
            // Output each word as a separate SRT block
            for (const word of mappedWords) {
              srtLines.push(`${srtCounter}`)
              srtLines.push(`${formatTimeStrWithMs(word.start)} --> ${formatTimeStrWithMs(word.end)}`)
              srtLines.push(`${word.word}\n`)
              srtCounter++
            }
          } else {
            // Output full sentence
            srtLines.push(`${srtCounter}`)
            srtLines.push(`${formatTimeStrWithMs(mappedStart)} --> ${formatTimeStrWithMs(mappedEnd)}`)
            srtLines.push(`${sub.text}\n`)
            srtCounter++
          }
        }
      }
      currentTimeOffset += (clip.endTime - clip.startTime)
    }

    return {
      customSrt: srtLines.join("\n"),
      customJson: JSON.stringify(mappedJson)
    }
  }

  const handleCutTimeline = () => {
    const startTimeStr = formatTimeStrWithMs(trimStart)
    const endTimeStr = formatTimeStrWithMs(trimEnd)
    triggerClipGenerate(startTimeStr, endTimeStr, clipFormat, selectedColor)
  }

  const triggerClipGenerate = (start: string, end: string, format: "landscape" | "portrait" = "landscape", color: string = "yellow") => {
    setPendingClipParams({ start, end, format, color })
    setIntroModalTarget("clip")
  }

  // --- Multi-clip timeline functions ---

  // Initialize clips when duration loads
  const initClipsDone = useRef(false)
  useEffect(() => {
    if (duration > 0 && !initClipsDone.current) {
      const initStart = startParam ? parseFloat(startParam) : 0
      const initEnd = endParam ? parseFloat(endParam) : duration
      
      setClips([{ id: "clip-0", startTime: initStart, endTime: initEnd, order: 0 }])
      setTrimStart(initStart)
      setTrimEnd(initEnd)
      
      // Also seek playhead to start time
      if (videoRef.current) {
        videoRef.current.currentTime = initStart
        setCurrentTime(initStart)
      }
      
      initClipsDone.current = true
    }
  }, [duration, startParam, endParam])

  const handleLoadClipToTimeline = (startStr: string, endStr: string) => {
    console.log("EditorPage: handleLoadClipToTimeline called with", startStr, endStr)
    const startSec = parseTimeStrToSeconds(startStr)
    const endSec = parseTimeStrToSeconds(endStr)
    console.log("EditorPage: Parsed range in seconds:", startSec, endSec)
    
    setClips([{ id: "clip-0", startTime: startSec, endTime: endSec, order: 0 }])
    setTrimStart(startSec)
    setTrimEnd(endSec)
    
    if (videoRef.current) {
      console.log("EditorPage: Seeking video player to:", startSec)
      videoRef.current.currentTime = startSec
      setCurrentTime(startSec)
    } else {
      console.warn("EditorPage: videoRef.current is not available!")
    }

    console.log("EditorPage: Scrolling window to top...")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Split clip at current playhead position
  const handleSplitAtPlayhead = useCallback(() => {
    const sorted = [...clips].sort((a, b) => a.order - b.order)
    const clipAtPlayhead = sorted.find(c => currentTime >= c.startTime && currentTime <= c.endTime)
    if (!clipAtPlayhead) return
    // Don't split if too close to edges
    if (currentTime - clipAtPlayhead.startTime < 0.5 || clipAtPlayhead.endTime - currentTime < 0.5) return

    const newId = `clip-${clipIdCounter.current++}`
    const leftClip: VideoClip = { ...clipAtPlayhead, endTime: currentTime }
    const rightClip: VideoClip = { id: newId, startTime: currentTime, endTime: clipAtPlayhead.endTime, order: clipAtPlayhead.order + 0.5 }
    
    const updated = clips
      .map(c => c.id === clipAtPlayhead.id ? leftClip : c)
      .concat(rightClip)
      .sort((a, b) => a.order - b.order)
      .map((c, i) => ({ ...c, order: i }))
    
    setClips(updated)
    setSelectedClipId(newId)
  }, [clips, currentTime])

  // Merge & Export: call backend to concat clips
  const triggerMergeExport = () => {
    if (clips.length === 0) return
    setIntroModalTarget("merge")
  }

  const handleMergeExport = async (introOverlayBase64: string | null = null) => {
    const sorted = [...clips].sort((a, b) => a.order - b.order)
    if (sorted.length === 0) return

    setIsMerging(true)
    setClipping(true)
    setClipStatusMsg("Merging clips & exporting final video...")

    try {
      const { customSrt, customJson } = generateMappedData(sorted, subtitles)

      const response = await api.post(`/api/videos/${id}/merge`, {
        clips: sorted.map(c => ({
          startTime: formatTimeStrWithMs(c.startTime),
          endTime: formatTimeStrWithMs(c.endTime)
        })),
        format: clipFormat,
        faceTracking: useFaceAI,
        color: selectedColor,
        noSubtitles: !burnSubtitles,
        uppercase: captionUppercase,
        fontsize: captionFontsize,
        outline: captionOutline,
        marginv: captionMarginV,
        singleWord: singleWordMode,
        watermark: wmImage ? {
          imagePath: wmImage,
          opacity: wmOpacity,
          scale: wmScale,
          position: wmPosition
        } : null,
        borderstyle: captionBackground ? 3 : 1,
        fontname: captionFontname,
        customSrt,
        customJson,
        introOverlay: introOverlayBase64
      })
      if (response.data && response.data.clipUrl) {
        const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${response.data.clipUrl}`
        setMergedVideoUrl(fullUrl)
        setActiveClipUrl(fullUrl)
      }
    } catch (e: any) {
      console.error("Merge failed:", e)
      alert("Merge failed. Make sure your backend is running and FFmpeg is installed.")
    } finally {
      setIsMerging(false)
      setClipping(false)
    }
  }

  // Clip-aware playback: skip sections that are not in any clip
  useEffect(() => {
    if (!videoRef.current || !isPlaying) return
    const sorted = [...clips].sort((a, b) => a.order - b.order)
    if (sorted.length === 0) return

    const curTime = videoRef.current.currentTime
    const inClip = sorted.find(c => curTime >= c.startTime && curTime <= c.endTime)
    if (!inClip) {
      // Find the next clip after current time
      const nextClip = sorted.find(c => c.startTime > curTime)
      if (nextClip) {
        videoRef.current.currentTime = nextClip.startTime
        setCurrentTime(nextClip.startTime)
      } else {
        // No more clips, pause at end
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [currentTime, clips, isPlaying])

  const handleClipGenerate = async (startTime: string, endTime: string, format: "landscape" | "portrait" = "landscape", color: string = "yellow", introOverlayBase64: string | null = null) => {
    setClipping(true)
    setClipStatusMsg("Clippers AI cutting video & hardburning subtitles...")
    
    try {
      const singleClip: VideoClip = { id: "clip-1", startTime: parseTimeStrToSeconds(startTime), endTime: parseTimeStrToSeconds(endTime), order: 0 }
      const { customSrt, customJson } = generateMappedData([singleClip], subtitles)

      const response = await api.post(`/api/videos/${id}/clip`, {
        startTime,
        endTime,
        format,
        faceTracking: useFaceAI,
        color,
        noSubtitles: !burnSubtitles,
        uppercase: captionUppercase,
        fontsize: captionFontsize,
        outline: captionOutline,
        marginv: captionMarginV,
        singleWord: singleWordMode,
        watermark: wmImage ? {
          imagePath: wmImage,
          opacity: wmOpacity,
          scale: wmScale,
          position: wmPosition
        } : null,
        borderstyle: captionBackground ? 3 : 1,
        fontname: captionFontname,
        customSrt,
        customJson,
        introOverlay: introOverlayBase64
      })
      if (response.data && response.data.clipUrl) {
        const fullClipUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${response.data.clipUrl}`
        setActiveClipUrl(fullClipUrl)
      }
    } catch (e: any) {
      console.error("Clipping failed:", e)
      alert("Clipping failed. Make sure your video path is valid.")
    } finally {
      setClipping(false)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      const activeClip = clips[0]
      if (videoRef.current.paused) {
        // Enforce seeking to start of clip if playing from outside boundaries
        if (activeClip && (videoRef.current.currentTime < activeClip.startTime || videoRef.current.currentTime >= activeClip.endTime)) {
          videoRef.current.currentTime = activeClip.startTime
          setCurrentTime(activeClip.startTime)
        }
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime
      setCurrentTime(curTime)

      // Enforce active clip bounds during preview playback
      const activeClip = clips[0]
      if (activeClip) {
        if (curTime < activeClip.startTime) {
          videoRef.current.currentTime = activeClip.startTime
          setCurrentTime(activeClip.startTime)
        } else if (curTime >= activeClip.endTime) {
          videoRef.current.pause()
          setIsPlaying(false)
          videoRef.current.currentTime = activeClip.startTime
          setCurrentTime(activeClip.startTime)
        }
      }

      // Dynamic Preview logic is now handled smoothly by requestAnimationFrame
      // we only reset position if not in portrait mode
      if (clipFormat !== "portrait" && videoRef.current) {
        videoRef.current.style.objectPosition = "center"
      }

      // Dynamically locate the active subtitle segment based on playback time
      const active = subtitles.find(s => {
        const [sh, sm, ss] = s.startTime.split(":")
        const startSec = parseInt(sh) * 3600 + parseInt(sm) * 60 + parseFloat(ss.replace(",", "."))
        const [eh, em, es] = s.endTime.split(":")
        const endSec = parseInt(eh) * 3600 + parseInt(em) * 60 + parseFloat(es.replace(",", "."))
        return curTime >= startSec && curTime <= endSec
      })

      if (active && active.id !== activeSubId) {
        setActiveSubId(active.id)
        
        // Auto-scroll active subtitle card into view
        const subCard = document.getElementById(`sub-card-${active.id}`)
        if (subCard) {
          subCard.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const durationSec = videoRef.current.duration
      setDuration(durationSec)
      setTrimEnd(durationSec > 15 ? 15 : durationSec) 
    }
  }

  const formatDurationDisplay = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      {/* Clippers full screen workspace layout container */}
      <main className="flex-1 flex flex-col max-h-screen overflow-y-auto pb-16 md:pb-0">
        
        {/* Sleek top editor navbar */}
        <div className="h-16 border-b border-slate-200/60 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/projects")}
              className="p-2 bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-550 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-brand/10 text-brand font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wide">Clippers Studio</span>
              <span className="font-extrabold text-slate-800 text-sm tracking-tight truncate max-w-[160px] sm:max-w-xs">{video?.title || "Project Studio"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Subtitle Style Color Picker */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 gap-2 mr-1">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 px-1 tracking-wider">Sub Color:</span>
              <button 
                onClick={() => setSelectedColor("yellow")}
                className={`w-4 h-4 rounded-full bg-yellow-400 transition-all border ${selectedColor === "yellow" ? "ring-2 ring-brand scale-110 border-white" : "border-transparent opacity-80"}`}
                title="Yellow Text"
              />
              <button 
                onClick={() => setSelectedColor("white")}
                className={`w-4 h-4 rounded-full bg-white transition-all border-slate-300 border ${selectedColor === "white" ? "ring-2 ring-brand scale-110" : "opacity-85"}`}
                title="White Text"
              />
              <button 
                onClick={() => setSelectedColor("green")}
                className={`w-4 h-4 rounded-full bg-emerald-400 transition-all border ${selectedColor === "green" ? "ring-2 ring-brand scale-110 border-white" : "border-transparent opacity-85"}`}
                title="Green Text"
              />
              <button 
                onClick={() => setSelectedColor("cyan")}
                className={`w-4 h-4 rounded-full bg-cyan-400 transition-all border ${selectedColor === "cyan" ? "ring-2 ring-brand scale-110 border-white" : "border-transparent opacity-85"}`}
                title="Cyan Text"
              />
            </div>

            {/* Opsi Pakai Subtitle Toggle */}
            <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer active:scale-95 transition-all mr-1" title="Aktifkan untuk membakar subtitle ke dalam video secara permanen">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Burn Subtitle:</span>
              <input 
                type="checkbox"
                checked={burnSubtitles}
                onChange={(e) => setBurnSubtitles(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">{burnSubtitles ? "On" : "Off"}</span>
            </label>

            {/* Opsi Face AI Tracking Toggle */}
            {clipFormat === "portrait" && (
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer active:scale-95 transition-all mr-1" title="Aktifkan kecerdasan buatan untuk melacak wajah agar tetap di tengah frame">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Face AI:</span>
                <input 
                  type="checkbox"
                  checked={useFaceAI}
                  onChange={(e) => setUseFaceAI(e.target.checked)}
                  className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">{useFaceAI ? "On" : "Off"}</span>
              </label>
            )}

            {/* Aspect Ratio Picker */}
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 mr-1 gap-1">
              <button
                onClick={() => setClipFormat("landscape")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  clipFormat === "landscape" ? "bg-white text-slate-800 border border-slate-200 shadow-sm" : "text-slate-450 hover:text-slate-650"
                }`}
                title="Landscape 16:9 (Standard)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">16:9</span>
              </button>
              <button
                onClick={() => setClipFormat("portrait")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  clipFormat === "portrait" ? "bg-brand text-white shadow-sm shadow-brand/10" : "text-slate-450 hover:text-slate-650"
                }`}
                title="Portrait 9:16 (YouTube Shorts)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shorts 9:16</span>
              </button>
            </div>

            {/* Customizer Modal Trigger */}
            <button
              onClick={() => setSubtitleStyleOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-brand/40 hover:bg-brand/5 text-slate-600 hover:text-brand rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 mr-1"
              title="Kustomisasi Gaya & Watermark"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">Export Subtitle</span>
            </button>
            <button
              onClick={triggerMergeExport}
              disabled={isMerging || clips.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95 ${
                isMerging ? "bg-slate-400 text-slate-200 cursor-wait" : "bg-brand hover:bg-brand-dark text-white shadow-brand/20"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{isMerging ? "Merging..." : clips.length > 1 ? "Merge & Export" : "Cut Selected Video"}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[50vh]">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Center Section: Player (Left) + Subtitles (Right) split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[600px]">
              
              {/* Left Column: Premium VEED style media window preview */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-start items-center bg-slate-100/40 border-r border-slate-200/60 overflow-y-auto">
                <div className={`transition-all duration-500 rounded-[28px] bg-slate-900 border border-slate-300/80 flex items-center justify-center relative overflow-hidden shadow-xl group shrink-0 ${
                  clipFormat === "portrait" ? "w-[280px] h-[498px]" : "aspect-video w-full max-w-4xl"
                }`}>
                  {/* Dynamic Preview Loading Indicator */}
                  {isTrackingLoading && clipFormat === "portrait" && (
                    <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                      <RefreshCw className="w-8 h-8 animate-spin mb-3 text-brand" />
                      <span className="text-xs font-bold tracking-widest uppercase">AI Face Tracking...</span>
                      <span className="text-[10px] text-slate-300 mt-1">Generating live preview</span>
                    </div>
                  )}

                  {video?.originalPath ? (
                    <video 
                      ref={videoRef}
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${video.originalPath.replace("./", "").replace("backend/", "")}`}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      className={`w-full h-full rounded-[26px] bg-slate-900 ${
                        clipFormat === "portrait" ? "object-cover" : "object-contain"
                      }`}
                      style={{
                        // Use transition for dimensions/colors, but NOT object-position 
                        // so our 60fps requestAnimationFrame doesn't stutter!
                        transition: "width 0.5s, height 0.5s, border-radius 0.5s, background-color 0.5s"
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Video className="w-10 h-10 mb-2 stroke-[1.5] text-brand" />
                      <p className="text-xs font-semibold">Mock Offline Player active</p>
                    </div>
                  )}

                  {/* Live Watermark Overlay Preview */}
                  {wmImage && (
                    <img 
                      src={wmImage} 
                      alt="Watermark Preview"
                      className="absolute pointer-events-none z-10 transition-all duration-300"
                      style={{
                        opacity: wmOpacity / 100,
                        width: `${wmScale}%`,
                        ...(wmPosition === "top-left" ? { top: "4%", left: "4%" } : {}),
                        ...(wmPosition === "top-right" ? { top: "4%", right: "4%" } : {}),
                        ...(wmPosition === "bottom-left" ? { bottom: "4%", left: "4%" } : {}),
                        ...(wmPosition === "bottom-right" ? { bottom: "4%", right: "4%" } : {}),
                        ...(wmPosition === "center" ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } : {}),
                      }}
                    />
                  )}

                  {/* Dynamic subtitle overlays (matching the screenshot's thick black outline style) */}
                  {burnSubtitles && (() => {
                    const activeSegment = subtitles.find(s => {
                      const [sh, sm, ss] = s.startTime.split(":")
                      const startSec = parseInt(sh) * 3600 + parseInt(sm) * 60 + parseFloat(ss.replace(",", "."))
                      const [eh, em, es] = s.endTime.split(":")
                      const endSec = parseInt(eh) * 3600 + parseInt(em) * 60 + parseFloat(es.replace(",", "."))
                      return currentTime >= startSec && currentTime <= endSec
                    })
                    if (!activeSegment) return null

                    const hasWords = activeSegment.words && activeSegment.words.length > 0
                    const containerColorClass = hasWords ? "text-white" : (
                      selectedColor === "yellow" ? "text-yellow-400" :
                      selectedColor === "white" ? "text-white" :
                      selectedColor === "green" ? "text-green-400" :
                      selectedColor === "cyan" ? "text-cyan-400" : "text-white"
                    )

                    const highlightColorClass = 
                      selectedColor === "yellow" ? "text-yellow-400" :
                      selectedColor === "white" ? "text-white" :
                      selectedColor === "green" ? "text-green-400" :
                      selectedColor === "cyan" ? "text-cyan-400" : "text-white"

                    return (
                      <div 
                        className={`absolute left-2 right-2 flex flex-col justify-end items-center text-center font-black tracking-wider z-20 select-none pointer-events-none transition-all duration-300 ${containerColorClass}`}
                        style={{
                          fontFamily: `"${captionFontname}", Impact, Arial Black, sans-serif`,
                          fontSize: `${clipFormat === 'portrait' ? captionFontsize * 0.55 : captionFontsize}px`,
                          bottom: `${clipFormat === 'portrait' ? captionMarginV * 0.7 : captionMarginV}px`,
                          textTransform: captionUppercase ? 'uppercase' : 'none',
                          lineHeight: '1.2',
                          wordBreak: 'break-word',
                          textShadow: captionBackground ? 'none' : `${captionOutline}px ${captionOutline}px 0 #000, -${captionOutline}px -${captionOutline}px 0 #000, ${captionOutline}px -${captionOutline}px 0 #000, -${captionOutline}px ${captionOutline}px 0 #000, 0 ${captionOutline}px 0 #000, 0 -${captionOutline}px 0 #000, ${captionOutline}px 0 0 #000, -${captionOutline}px 0 0 #000, 0px 0px 8px rgba(0,0,0,0.8)`
                        }}
                      >
                        <span className={captionBackground ? "bg-black/60 px-4 py-2 rounded-2xl border border-black/15 shadow-xl backdrop-blur-sm inline-block" : ""}>
                          {hasWords ? (
                            singleWordMode ? (
                              (() => {
                                const activeWord = activeSegment.words!.find(w => currentTime >= w.start && currentTime <= w.end)
                                if (activeWord) {
                                  return <span className={highlightColorClass}>{activeWord.word}</span>
                                }
                                // Fallback to the closest word before the currentTime
                                const pastWords = activeSegment.words!.filter(w => currentTime >= w.end)
                                if (pastWords.length > 0) {
                                  return <span className={highlightColorClass}>{pastWords[pastWords.length - 1].word}</span>
                                }
                                // Fallback to the first word
                                return <span className={highlightColorClass}>{activeSegment.words![0].word}</span>
                              })()
                            ) : (
                              <div className="flex flex-wrap justify-center gap-x-1.5 row-gap-1">
                                {activeSegment.words!.map((w, idx) => {
                                  const isWordActive = currentTime >= w.start && currentTime <= w.end
                                  return (
                                    <span
                                      key={idx}
                                      className={isWordActive ? highlightColorClass : "text-white"}
                                    >
                                      {w.word}
                                    </span>
                                  )
                                })}
                              </div>
                            )
                          ) : activeSegment.text}
                        </span>
                      </div>
                    )
                  })()}
                </div>

                {/* Playback Controls & Seek Slider */}
                <div className="mt-4 flex flex-col items-center gap-3 bg-white border border-slate-200/80 p-4 rounded-3xl w-full max-w-lg shadow-sm">
                  {/* Slider & Time display */}
                  {(() => {
                    const activeClip = clips[0]
                    const clipStart = activeClip?.startTime || 0
                    const clipEnd = activeClip?.endTime || duration || 1
                    const clipLen = clipEnd - clipStart
                    const relativeCurrent = Math.max(0, currentTime - clipStart)

                    return (
                      <div className="w-full flex items-center gap-3 px-2">
                        <input 
                          type="range"
                          min={clipStart}
                          max={clipEnd}
                          step={0.1}
                          value={Math.max(clipStart, Math.min(currentTime, clipEnd))}
                          onChange={(e) => {
                            const sec = parseFloat(e.target.value)
                            if (videoRef.current) {
                              videoRef.current.currentTime = sec
                              setCurrentTime(sec)
                            }
                          }}
                          className="flex-1 h-1.5 bg-slate-200 hover:h-2 rounded-lg appearance-none cursor-pointer accent-brand transition-all"
                        />
                        <span className="text-xs font-extrabold font-mono text-slate-500 shrink-0">
                          {formatDurationDisplay(relativeCurrent)} / {formatDurationDisplay(clipLen)}
                        </span>
                      </div>
                    )
                  })()}

                  {/* Playback action buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => seekRelative(-5)}
                      className="px-2.5 py-1.5 hover:bg-slate-50 text-slate-500 rounded-xl transition-all active:scale-90 flex items-center gap-1"
                      title="Rewind 5s (Arrow Left)"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[10px] font-extrabold text-slate-500">-5s</span>
                    </button>
                    
                    <button 
                      onClick={togglePlay}
                      className="p-2.5 bg-brand hover:bg-brand/95 text-white rounded-full transition-all active:scale-95 shadow-md shadow-brand/20 flex items-center justify-center"
                    >
                      {isPlaying ? <PauseIcon className="w-4.5 h-4.5 fill-current" /> : <PlayIcon className="w-4.5 h-4.5 fill-current ml-0.5" />}
                    </button>
                    
                    <button 
                      onClick={() => seekRelative(5)}
                      className="px-2.5 py-1.5 hover:bg-slate-50 text-slate-500 rounded-xl transition-all active:scale-90 flex items-center gap-1"
                      title="Forward 5s (Arrow Right)"
                    >
                      <span className="text-[10px] font-extrabold text-slate-500">+5s</span>
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Timelines list */}
              <div className="lg:col-span-5 p-6 bg-slate-50 overflow-y-auto max-h-full">
                <SubtitleEditor 
                  initialSubtitles={subtitles} 
                  onSave={handleSubtitlesSave}
                  onClipGenerate={(start, end) => {
                    setPendingClipParams({ start, end, format: clipFormat, color: selectedColor })
                    setIntroModalTarget("clip")
                  }}
                  activeSubId={activeSubId}
                  onSeekTo={(sec) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = sec
                      setCurrentTime(sec)
                    }
                  }}
                  onOpenSettings={() => setSubtitleStyleOpen(true)}
                />
              </div>
            </div>

            {/* Bottom Section: Multi-Clip Timeline Editor */}
            <div className="bg-slate-50 border-t border-slate-200/60 px-6 py-4 shrink-0 z-10">
              <VideoTimeline
                duration={duration}
                currentTime={currentTime}
                clips={clips}
                onClipsChange={setClips}
                onSeekTo={(sec) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = sec
                    setCurrentTime(sec)
                  }
                }}
                onSplitAtPlayhead={handleSplitAtPlayhead}
                onMergeExport={triggerMergeExport}
                isMerging={isMerging}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
                onOpenSettings={() => setSubtitleStyleOpen(true)}
              />
            </div>

            {/* AI Analysis Section */}
            <div className="p-8 bg-white border-t border-slate-200/60">
              <ViralClips 
                videoId={id as string} 
                videoPath={video?.originalPath}
                onExtractClip={(start, end) => {
                    setPendingClipParams({ start, end, format: clipFormat, color: selectedColor })
                    setIntroModalTarget("clip")
                }}
                onEditClip={handleLoadClipToTimeline}
              />
            </div>
          </div>
        )}

        {/* Global Loading overlay for clipping */}
        {clipping && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center font-sans animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand animate-spin mb-4 shadow-lg shadow-brand/10">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">Creating Subtitled Short</h3>
            <p className="text-xs text-slate-350 font-semibold">{clipStatusMsg}</p>
          </div>
        )}

        {/* Live Cut Video Preview Modal */}
        {activeClipUrl && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
              <button
                onClick={() => setActiveClipUrl(null)}
                className="absolute top-4 right-4 p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-slate-800 rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-sm">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">AI Hardburned Short</h3>
                  <p className="text-[10px] text-slate-450 font-semibold">
                    {clipFormat === "portrait" ? "Cropped 9:16 & Subtitled" : "Landscape clip subtitled successfully"}
                  </p>
                </div>
              </div>

              {/* Real Cut Video Clip Player (Dynamic aspect-ratio display) */}
              <div className={`w-full bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden mb-5 flex items-center justify-center ${
                clipFormat === "portrait" ? "aspect-[9/16] max-h-[500px]" : "aspect-video"
              }`}>
                <video 
                  src={activeClipUrl} 
                  controls 
                  autoPlay
                  className={`w-full h-full rounded-2xl ${
                    clipFormat === "portrait" ? "object-cover" : "object-contain"
                  }`}
                />
              </div>

              {/* Download Option CTA */}
              <a
                href={activeClipUrl}
                download={clipFormat === "portrait" ? "clippers_shorts_subtitled.mp4" : "clippers_clip_subtitled.mp4"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20 text-xs active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download YouTube Short</span>
              </a>

              {/* Publish Option CTA */}
              <button
                onClick={() => setPublishOpen(true)}
                className="w-full mt-3 py-4 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-xs active:scale-98 border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-brand-accent" />
                <span>Publish to Social Media</span>
              </button>
            </div>
          </div>
        )}

        <ExportModal 
          isOpen={exportOpen} 
          onClose={() => setExportOpen(false)} 
          srtContent={srtContent}
        />

        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          videoUrl={activeClipUrl || ""}
          defaultTitle={video?.title || "My Generated Short"}
        />

        {/* Customizer Modal & Overlays */}
        <IntroBuilderModal 
          isOpen={introModalTarget !== null}
          format={clipFormat}
          onClose={() => setIntroModalTarget(null)}
          onExport={(base64) => {
            setIntroModalTarget(null)
            if (introModalTarget === "merge") {
              handleMergeExport(base64)
            } else if (introModalTarget === "clip" && pendingClipParams) {
              handleClipGenerate(pendingClipParams.start, pendingClipParams.end, pendingClipParams.format, pendingClipParams.color, base64)
            }
          }}
        />

        {/* Cloud Session Recovery Modal */}
        {showRecoveryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-6">
                <h2 className="text-xl font-extrabold text-slate-800 mb-2">Cloud Save Ditemukan ☁️</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">
                  Kami menemukan sesi editan Anda yang belum selesai sebelumnya. Apakah Anda ingin melanjutkannya?
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      if (savedDraft.subtitles) setSubtitles(savedDraft.subtitles)
                      if (savedDraft.clips) setClips(savedDraft.clips)
                      if (savedDraft.clipFormat) setClipFormat(savedDraft.clipFormat)
                      if (savedDraft.selectedColor) setSelectedColor(savedDraft.selectedColor)
                      if (savedDraft.captionUppercase !== undefined) setCaptionUppercase(savedDraft.captionUppercase)
                      if (savedDraft.captionFontsize) setCaptionFontsize(savedDraft.captionFontsize)
                      if (savedDraft.captionOutline) setCaptionOutline(savedDraft.captionOutline)
                      if (savedDraft.captionMarginV) setCaptionMarginV(savedDraft.captionMarginV)
                      if (savedDraft.wmImage) setWmImage(savedDraft.wmImage)
                      if (savedDraft.wmOpacity) setWmOpacity(savedDraft.wmOpacity)
                      if (savedDraft.wmScale) setWmScale(savedDraft.wmScale)
                      if (savedDraft.wmPosition) setWmPosition(savedDraft.wmPosition)
                      if (savedDraft.useFaceAI !== undefined) setUseFaceAI(savedDraft.useFaceAI)
                      setShowRecoveryModal(false)
                    }}
                    className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                  >
                    Ya, Lanjutkan Editan
                  </button>
                  <button 
                    onClick={async () => {
                      setShowRecoveryModal(false)
                      await api.put(`/api/videos/${id}/draft`, { draftState: "" })
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all active:scale-95"
                  >
                    Tidak, Mulai Baru Saja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtitle Style Customizer Sidebar */}
        {subtitleStyleOpen && (
          <div className="fixed inset-0 z-50 flex justify-end backdrop-blur-[1px] bg-slate-900/15 pointer-events-none animate-in fade-in">
            {/* Clickable backdrop area to close */}
            <div className="flex-1 pointer-events-auto" onClick={() => setSubtitleStyleOpen(false)} />
            
            <div className="bg-white border-l border-slate-200/80 w-full max-w-md shadow-2xl relative flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <span className="text-[12px] text-brand font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  KUSTOMISASI GAYA & WATERMARK
                </span>
                <button
                  onClick={() => setSubtitleStyleOpen(false)}
                  className="p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-slate-800 rounded-xl transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex flex-wrap items-center gap-6 justify-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-600 select-none">
                    <input 
                      type="checkbox"
                      checked={singleWordMode}
                      onChange={(e) => setSingleWordMode(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                    <span>MODE SATU KATA</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-600 select-none">
                    <input 
                      type="checkbox"
                      checked={captionUppercase}
                      onChange={(e) => setCaptionUppercase(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                    <span>TEKS KAPITAL (ALL-CAPS)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-600 select-none">
                    <input 
                      type="checkbox"
                      checked={captionBackground}
                      onChange={(e) => setCaptionBackground(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                    <span>BACKGROUND HITAM</span>
                  </label>
                </div>

                {/* Preset Gaya Video Terkenal */}
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Preset Gaya Video Terkenal:</span>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedColor("yellow");
                        setCaptionUppercase(true);
                        setCaptionFontsize(32);
                        setCaptionOutline(4.5);
                        setCaptionMarginV(50);
                        setSingleWordMode(false);
                        setCaptionFontname("Impact");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>🔥</span>
                      <span>Alex Hormozi</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("white");
                        setCaptionUppercase(false);
                        setCaptionFontsize(18);
                        setCaptionOutline(2.0);
                        setCaptionMarginV(25);
                        setSingleWordMode(false);
                        setCaptionFontname("Georgia");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>🎓</span>
                      <span>Ali Abdaal</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("yellow");
                        setCaptionUppercase(true);
                        setCaptionFontsize(35);
                        setCaptionOutline(5.0);
                        setCaptionMarginV(55);
                        setSingleWordMode(true); // MrBeast rapid single-word flash
                        setCaptionFontname("Impact");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>🐯</span>
                      <span>MrBeast</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("white");
                        setCaptionUppercase(true);
                        setCaptionFontsize(22);
                        setCaptionOutline(2.0);
                        setCaptionMarginV(35);
                        setSingleWordMode(false);
                        setCaptionFontname("Avenir Next");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>👔</span>
                      <span>Iman Gadzhi</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("green");
                        setCaptionUppercase(true);
                        setCaptionFontsize(26);
                        setCaptionOutline(3.5);
                        setCaptionMarginV(40);
                        setSingleWordMode(false);
                        setCaptionFontname("Arial Black");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>🌍</span>
                      <span>Nas Daily</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("yellow");
                        setCaptionUppercase(true);
                        setCaptionFontsize(30);
                        setCaptionOutline(4.0);
                        setCaptionMarginV(45);
                        setSingleWordMode(false);
                        setCaptionFontname("Arial Black");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>📢</span>
                      <span>GaryVee</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedColor("cyan");
                        setCaptionUppercase(true);
                        setCaptionFontsize(28);
                        setCaptionOutline(3.5);
                        setCaptionMarginV(45);
                        setSingleWordMode(false);
                        setCaptionFontname("Arial Black");
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-brand text-xs font-extrabold rounded-xl transition-all hover:bg-brand/5 hover:text-brand flex items-center gap-2"
                    >
                      <span>⚡</span>
                      <span>Karaoke Neon</span>
                    </button>
                  </div>
                </div>

                {/* Font Selection Dropdown */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Jenis Huruf (Font Family):</span>
                  <select 
                    value={captionFontname}
                    onChange={(e) => setCaptionFontname(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="Impact">Impact (Bold, High Energy - Hormozi/MrBeast Style)</option>
                    <option value="Futura">Futura (Premium Geometric Sans-Serif)</option>
                    <option value="Avenir Next">Avenir Next (Sleek Modern Sans-Serif - Iman Gadzhi Style)</option>
                    <option value="Helvetica Neue">Helvetica Neue (Clean, Neutral Minimalist)</option>
                    <option value="Arial Black">Arial Black (Heavy, Clean & Clear - Nas Daily/GaryVee Style)</option>
                    <option value="Trebuchet MS">Trebuchet MS (Solid Sans-Serif)</option>
                    <option value="Georgia">Georgia (Premium Editorial Serif - Ali Abdaal Style)</option>
                    <option value="Comic Sans MS">Comic Sans MS (Playful, Meme Style)</option>
                    <option value="Courier New">Courier New (Classic Retro Typewriter)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Control 1: Font Size slider */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      <span>Ukuran Huruf</span>
                      <span className="text-brand font-mono font-bold text-xs">{captionFontsize}px</span>
                    </div>
                    <input 
                      type="range"
                      min={10}
                      max={42}
                      value={captionFontsize}
                      onChange={(e) => setCaptionFontsize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>

                  {/* Control 2: Outline thickness slider */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      <span>Tebal Outline</span>
                      <span className="text-brand font-mono font-bold text-xs">{captionOutline}px</span>
                    </div>
                    <input 
                      type="range"
                      min={1.0}
                      max={5.5}
                      step={0.5}
                      value={captionOutline}
                      onChange={(e) => setCaptionOutline(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>

                  {/* Control 3: Vertical Position / Margin slider */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      <span>Posisi Vertikal</span>
                      <span className="text-brand font-mono font-bold text-xs">{captionMarginV}px</span>
                    </div>
                    <input 
                      type="range"
                      min={10}
                      max={100}
                      value={captionMarginV}
                      onChange={(e) => setCaptionMarginV(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>
                </div>

                {/* AI Translation Selector */}
                <div className="space-y-2 border-t border-slate-100 pt-5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Penerjemah AI (Auto Translate):</span>
                  <div className="flex gap-3 items-center">
                    <select
                      onChange={async (e) => {
                        const lang = e.target.value;
                        if (!lang) return;
                        setSubtitleStyleOpen(false); // Close modal when starting translation
                        
                        setClipping(true);
                        setClipStatusMsg("AI Worker translating subtitles...");
                        try {
                          const res = await api.post(`/api/videos/${id}/subtitles/translate`, { language: lang });
                          if (res.data) {
                            setSubtitles(res.data);
                            const srt = res.data.map((sub: any) => {
                              return `${sub.id}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`
                            }).join("\n");
                            setSrtContent(srt);
                          }
                        } catch (err) {
                          console.error("Translation failed:", err);
                          alert("Translation failed. Make sure your backend service is running.");
                        } finally {
                          setClipping(false);
                        }
                      }}
                      className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-slate-700 focus:border-brand cursor-pointer hover:border-slate-300 transition-colors"
                      defaultValue=""
                    >
                      <option value="" disabled>Pilih Bahasa Terjemahan...</option>
                      <option value="id">🇮🇩 Bahasa Indonesia</option>
                      <option value="en">🇺🇸 Bahasa Inggris (English)</option>
                      <option value="ja">🇯🇵 Bahasa Jepang (Japanese)</option>
                      <option value="es">🇪🇸 Bahasa Spanyol (Spanish)</option>
                      <option value="ar">🇸🇦 Bahasa Arab (Arabic)</option>
                    </select>
                    <span className="text-[10px] text-slate-450 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Powered by Google Translate AI</span>
                  </div>
                </div>

                {/* Watermark Section */}
                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Custom Watermark / Logo:</span>
                  
                  {/* File Upload & Preview */}
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand/50 rounded-xl p-4 flex flex-col items-center justify-center w-32 h-32 transition-colors">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => setWmImage(reader.result as string)
                          reader.readAsDataURL(file)
                        }}
                      />
                      {wmImage ? (
                        <img src={wmImage} alt="Watermark" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                            <span className="text-xl">+</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold text-center">Upload Logo<br/>(PNG Transparan)</span>
                        </>
                      )}
                    </label>

                    {wmImage && (
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <button 
                            onClick={() => setWmImage(null)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1 rounded-lg"
                          >
                            Hapus Logo
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Opacity */}
                          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                              <span>Opacity</span>
                              <span className="text-brand font-mono font-bold text-xs">{wmOpacity}%</span>
                            </div>
                            <input 
                              type="range" min={10} max={100} value={wmOpacity}
                              onChange={(e) => setWmOpacity(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                          </div>
                          {/* Size */}
                          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                              <span>Ukuran</span>
                              <span className="text-brand font-mono font-bold text-xs">{wmScale}%</span>
                            </div>
                            <input 
                              type="range" min={5} max={100} value={wmScale}
                              onChange={(e) => setWmScale(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                          </div>
                        </div>

                        {/* Position Grid */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Posisi Logo</span>
                          <div className="flex flex-wrap gap-2">
                            {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map(pos => (
                              <button
                                key={pos}
                                onClick={() => setWmPosition(pos)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors border ${
                                  wmPosition === pos ? 'bg-brand text-white border-brand' : 'bg-white text-slate-500 border-slate-200 hover:border-brand/30'
                                }`}
                              >
                                {pos.replace('-', ' ').toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSubtitleStyleOpen(false)}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand/20 transition-all active:scale-95"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
