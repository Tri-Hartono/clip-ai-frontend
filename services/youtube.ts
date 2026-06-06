import { api } from "./api"

export async function processYoutube(url: string) {
  const response = await api.post("/api/youtube/process", {
    url,
  })
  return response.data
}
