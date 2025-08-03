// types/sam_prompt.ts
export interface SamPrompt {
  id: string

  points?: {
    x: number
    y: number
    label: number  // 1: 正向提示，0: 负向提示
  }[]

  boxes?: {
    x: number
    y: number
    width: number
    height: number
  }[]
}
