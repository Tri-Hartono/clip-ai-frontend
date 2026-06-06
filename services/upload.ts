import { api } from "./api"

export async function uploadVideo(file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData()
  formData.append("video", file)

  const response = await api.post("/api/videos/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
  })

  return response.data
}
