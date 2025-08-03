// src/types/image_parse_data.ts

export interface BBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ImageParseUnit {
  uid?: string
  bbox: BBox
  source_module: string

  type?: string
  text?: string
  label?: string
  score?: number

  image?: string         // base64 encoded full image (optional)
  bbox_image?: string    // base64 encoded cropped image
  mask_image?: string    // base64 encoded masked region
  mask?: string          // base64 encoded binary mask

  metadata: Record<string, any>
}

export interface ImageParseResult {
  uid?: string
  image?: string          // base64 full image
  summary_text?: string

  units: ImageParseUnit[]

  bboxs_image?: string    // base64 image with drawn bboxes
  masks?: string          // base64 combined mask
  masks_image?: string    // base64 image with masks rendered

  metadata: Record<string, any>
}

// 字段 label 映射表（用于前端显示）
export const imageParseUnitFieldLabels: Record<string, string> = {
  uid: 'UID',
  source_module: '来源模块',
  type: '类型',
  label: '标签',
  text: '文本',
  score: '置信度',
  bbox_image: 'bbox图',
  mask_image: '掩膜图',
  metadata: '元数据',
  bbox: '边界框',
}
