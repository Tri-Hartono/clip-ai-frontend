import { api } from "./api"

export interface ViralClip {
  start_time: string
  end_time: string
  hook_score: number
  viral_score: number
  rationale: string
}

export interface RecommendedCut {
  start_time: string
  end_time: string
  reason: string
}

export interface VideoAnalysis {
  viral_clips: ViralClip[]
  recommended_cuts: RecommendedCut[]
  title: string
  description: string
  hashtags: string[]
}

export async function fetchVideoAnalysis(videoId: string | number, model: string = "gemini-2.0-flash"): Promise<VideoAnalysis> {
  const response = await api.post(`/api/videos/${videoId}/analyze`, { model })
  // The backend wraps it in {"status": "success", "data": {...}} or direct if mapped differently
  // Since our handler returns `result` which is unmarshalled from python:
  // Python returns {"status": "success", "data": {...}}
  if (response.data && response.data.data) {
    return response.data.data as VideoAnalysis
  }
  return response.data as VideoAnalysis
}
