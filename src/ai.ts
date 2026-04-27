import OpenAI from 'openai'
import type { MoodType } from './types'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true,
})

export async function analyzeMood(text: string, mood: MoodType): Promise<string> {
  const moodLabels: Record<MoodType, string> = {
    happy: '开心',
    calm: '平静',
    sad: '难过',
    anxious: '焦虑',
    angry: '烦躁',
  }

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 200,
    messages: [
      {
        role: 'system',
        content: '你是一个温暖、有同理心的心情日记助手。用户会分享他们今天的感受，请给出一句简短温暖的回应（50字以内），用中文，不要说教，要像朋友一样说话。',
      },
      {
        role: 'user',
        content: `今天的心情：${moodLabels[mood]}。日记内容：${text}`,
      },
    ],
  })

  return response.choices[0]?.message?.content ?? '谢谢你愿意记录今天的心情。'
}
