"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchVideoAnalysis } from "@/services/analysis"
import { Loader2, Copy, Sparkles, Scissors, Hash } from "lucide-react"

interface ViralClipsProps {
  videoId: string | number
  onExtractClip?: (start: string, end: string) => void
}

export function ViralClips({ videoId, onExtractClip }: ViralClipsProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash")

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["videoAnalysis", videoId, selectedModel],
    queryFn: () => fetchVideoAnalysis(videoId, selectedModel),
    enabled: false, // Wait for user to trigger it to save LLM costs if not needed immediately
  })

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
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="groq-llama-3.1-8b-instant">Groq Llama-3.1 8B (Fast/Free)</option>
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
              <div key={idx} className="rounded-lg border bg-blue-50/50 border-blue-100 text-slate-950 shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">Clip #{idx + 1}</h3>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 border-transparent">Hook: {clip.hook_score}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-transparent">Viral: {clip.viral_score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    {clip.start_time} - {clip.end_time}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <p className="text-sm text-slate-500 mb-4">{clip.rationale}</p>
                  <button 
                    onClick={() => onExtractClip && onExtractClip(clip.start_time, clip.end_time)}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Extract This Clip
                  </button>
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

