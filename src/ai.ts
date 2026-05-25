import OpenAI from 'openai'
import type { MoodType } from './types'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true,
  maxRetries: 0,       // 不重试，失败立刻返回
  timeout: 20000,      // 20 秒超时
})

export async function analyzeMood(text: string, mood: MoodType): Promise<string> {
  const moodLabels: Record<MoodType, string> = {
    happy: '开心',
    calm: '平静',
    sad: '难过',
    anxious: '焦虑',
    angry: '烦躁',
  }

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `你是一个温暖、细腻、有真实情感的心情日记陪伴者。
用户会和你分享他们某一天的心情与经历，请你认真阅读他们写的内容，给出一段真诚、有深度的回应。

回应要求：
- 先共情：真实感受到对方的情绪，说出你"听"到了什么，让对方感到被理解
- 再回应：针对他们具体写的事情或细节做出回应，不要泛泛而谈
- 最后给一点温暖的力量或视角，但不说教、不灌鸡汤
- 语气像一个真正关心对方的朋友，自然、亲近，偶尔可以有点小幽默
- 用中文，150～250字左右，分2～3段`,
        },
        {
          role: 'user',
          content: `心情状态：${moodLabels[mood]}\n\n${text}`,
        },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  } catch (err: unknown) {
    // 把错误信息抛出，让调用方决定如何展示
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(msg)
  }
}
