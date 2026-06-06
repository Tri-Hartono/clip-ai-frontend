"use client"

import { useState } from "react"
import { X, Download, FileText, Globe, Video, Sparkles, CheckCircle2 } from "lucide-react"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  srtContent?: string
}

export default function ExportModal({ isOpen, onClose, srtContent }: ExportModalProps) {
  const [exporting, setExporting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleDownload = (format: "srt" | "vtt") => {
    setExporting(true)
    setTimeout(() => {
      // Mock download logic using local file generator blob links
      const content = srtContent || `1\n00:00:01,000 --> 00:00:04,000\nHello, welcome to GDVideo AI!\n\n2\n00:00:04,500 --> 00:00:08,000\nThis is automated subtitle generation.`
      const processed = format === "vtt" 
        ? "WEBVTT\n\n" + content.replace(/,/g, ".")
        : content

      const blob = new Blob([processed], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `subtitles.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setExporting(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-950/60 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Export Results</h2>
            <p className="text-xs text-slate-500">Choose your desired output format</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Subtitles exported successfully!</span>
          </div>
        )}

        {/* Options list */}
        <div className="space-y-3">
          {/* SRT download option */}
          <button
            onClick={() => handleDownload("srt")}
            disabled={exporting}
            className="w-full p-4 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-850 hover:border-slate-750 text-left rounded-2xl flex items-center justify-between transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Download SRT Subtitle</h4>
                <p className="text-xs text-slate-500">Standard SubRip format, highly compatible</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* VTT download option */}
          <button
            onClick={() => handleDownload("vtt")}
            disabled={exporting}
            className="w-full p-4 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-850 hover:border-slate-750 text-left rounded-2xl flex items-center justify-between transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Download WebVTT (VTT)</h4>
                <p className="text-xs text-slate-500">Optimized for standard HTML5 web players</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Burn / render video option (Phase 2 preview placeholder) */}
          <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-2xl flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-900 text-slate-500">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-400">Burn Subtitles into Video</h4>
                <p className="text-xs text-slate-600">Export mp4 with styled captions (PRO Feature)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
              PRO
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
