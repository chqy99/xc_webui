import axios from 'axios'

const BASE_URL = 'http://localhost:8200/api'

/**
 * 上传图像 base64，返回 uid
 * @param {string} image_base64
 * @returns {Promise<string>} uid
 */
export async function uploadImage(image_base64) {
  const res = await axios.post(`${BASE_URL}/upload_image`, {
    image_base64
  })
  return res.data.uid
}

/**
 * 通过 uid 发起解析请求
 * @param {{ uid: string, mode: string, prompt?: string }} options
 * @returns {Promise<Object>} 解析结果
 */
export async function parseImage({ uid, mode, prompt }) {
  const res = await axios.post(`${BASE_URL}/parse`, {
    uid,
    mode,
    ...(prompt && { prompt })
  })
  return res.data
}

export async function assistLabel({ uid, mode, prompt }) {
  const res = await axios.post(`${BASE_URL}/labeling/assist`, {
    uid,
    mode,
    ...(prompt && { prompt })
  })
  return res.data
}
