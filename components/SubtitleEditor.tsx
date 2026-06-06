"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2, Check, Layers, Sparkles } from "lucide-react"

export interface SubtitleItem {
  id: number
  startTime: string
  endTime: string
  text: string
  words?: { word: string; start: number; end: number }[]
}

interface SubtitleEditorProps {
  initialSubtitles: SubtitleItem[]
  onSave: (subs: SubtitleItem[]) => void
  onClipGenerate?: (startTime: string, endTime: string) => void
  activeSubId?: number | null
  onSeekTo?: (time: number) => void
  onOpenSettings?: () => void
}

const parseTimeStrToSeconds = (timeStr: string): number => {
  const [sh, sm, ss] = timeStr.split(":")
  return parseInt(sh) * 3600 + parseInt(sm) * 60 + parseFloat(ss.replace(",", "."))
}

export default function SubtitleEditor({ initialSubtitles, onSave, onClipGenerate, activeSubId, onSeekTo, onOpenSettings }: SubtitleEditorProps) {
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>(
    initialSubtitles.length > 0 
      ? initialSubtitles 
      : [
          { id: 1, startTime: "00:00:01,000", endTime: "00:00:04,000", text: "Hello, welcome to Clippers!" },
          { id: 2, startTime: "00:00:04,500", endTime: "00:00:08,000", text: "Enjoy advanced high-performance web timeline trimming." }
        ]
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")

  const handleEditStart = (item: SubtitleItem) => {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  const handleEditSave = (id: number) => {
    const updated = subtitles.map((sub) => {
      if (sub.id === id) {
        let updatedWords = sub.words
        if (sub.words && sub.words.length > 0) {
          const newWords = editingText.trim().split(/\s+/).filter(Boolean)
          if (newWords.length === sub.words.length) {
            updatedWords = sub.words.map((w, idx) => ({
              ...w,
              word: newWords[idx]
            }))
          } else {
            const startSec = parseTimeStrToSeconds(sub.startTime)
            const endSec = parseTimeStrToSeconds(sub.endTime)
            const wordDuration = (endSec - startSec) / Math.max(1, newWords.length)
            updatedWords = newWords.map((word, idx) => ({
              word,
              start: startSec + idx * wordDuration,
              end: startSec + (idx + 1) * wordDuration
            }))
          }
        }
        return { ...sub, text: editingText, words: updatedWords }
      }
      return sub
    })
    setSubtitles(updated)
    setEditingId(null)
    onSave(updated)
  }

  const handleDelete = (id: number) => {
    const updated = subtitles.filter((sub) => sub.id !== id)
    setSubtitles(updated)
    onSave(updated)
  }

  const handleAdd = () => {
    const lastSub = subtitles[subtitles.length - 1]
    const nextId = subtitles.length > 0 ? lastSub.id + 1 : 1
    const newSub: SubtitleItem = {
      id: nextId,
      startTime: "00:00:08,000",
      endTime: "00:00:11,000",
      text: "New subtitle segment text."
    }
    const updated = [...subtitles, newSub]
    setSubtitles(updated)
    onSave(updated)
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md flex flex-col h-full font-sans">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800">Subtitle Timelines</h2>
            <p className="text-[10px] text-slate-400 font-semibold">Sunting teks & durasi dari AI</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Gaya & Watermark</span>
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md shadow-brand/10 transition-all duration-300 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Segment</span>
          </button>
        </div>
      </div>

      {/* Subtitles Segments List */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-2">
        {subtitles.map((sub) => (
          <div 
            key={sub.id} 
            id={`sub-card-${sub.id}`}
            className={`p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 border ${
              activeSubId === sub.id
                ? "bg-brand/5 border-brand/50 ring-1 ring-brand/10 shadow-sm"
                : "bg-slate-50 border-slate-100 hover:border-brand/30"
            }`}
          >
            {/* Index label button */}
            <button
              onClick={() => onSeekTo?.(parseTimeStrToSeconds(sub.startTime))}
              title="Lompat ke awal segmen ini"
              className={`text-xs font-extrabold px-2.5 py-1.5 rounded-lg border shadow-sm transition-all duration-300 active:scale-95 hover:bg-brand hover:text-white hover:border-transparent cursor-pointer ${
                activeSubId === sub.id
                  ? "bg-brand text-white border-transparent"
                  : "bg-white text-slate-500 border-slate-200/60"
              }`}
            >
              {sub.id}
            </button>

            {/* Time / Editable inputs */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <button
                  onClick={() => onSeekTo?.(parseTimeStrToSeconds(sub.startTime))}
                  className="bg-white hover:bg-slate-50 hover:border-brand/30 px-2 py-1 rounded-lg border border-slate-200/60 font-mono text-slate-550 hover:text-brand transition-colors active:scale-95 cursor-pointer"
                  title="Lompat ke waktu mulai"
                >
                  {sub.startTime}
                </button>
                <span className="font-semibold text-slate-400">to</span>
                <button
                  onClick={() => onSeekTo?.(parseTimeStrToSeconds(sub.endTime))}
                  className="bg-white hover:bg-slate-50 hover:border-brand/30 px-2 py-1 rounded-lg border border-slate-200/60 font-mono text-slate-550 hover:text-brand transition-colors active:scale-95 cursor-pointer"
                  title="Lompat ke waktu akhir"
                >
                  {sub.endTime}
                </button>
              </div>

              {editingId === sub.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditSave(sub.id)}
                    className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => handleEditStart(sub)}
                  className="text-xs text-slate-700 font-bold cursor-pointer hover:text-brand transition-colors py-1 leading-relaxed"
                >
                  {sub.text}
                </div>
              )}
            </div>

            {/* Edit / Trash / Generate Short Actions */}
            <div className="flex items-center gap-1">
              {onClipGenerate && (
                <button
                  onClick={() => onClipGenerate(sub.startTime, sub.endTime)}
                  title="Cut AI Short dari segmen ini"
                  className="p-2 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl transition-all border border-brand/20 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleEditStart(sub)}
                className="p-2 hover:bg-slate-200/60 text-slate-450 hover:text-slate-800 rounded-xl transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(sub.id)}
                className="p-2 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
