import axios from 'axios'

export async function parseImage({ image_base64, mode, prompt }) {
  const res = await axios.post('http://localhost:8200/api/parse', {
    image_base64,
    mode,
    ...(prompt && { prompt })
  })
  return res.data
}
