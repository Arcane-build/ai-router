export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const TRENDING_MODELS: AIModel[] = [
  {
    id: 'claude-v2.1',
    name: 'Claude v2.1',
    description: 'This is low latency version of Claude v2.1.',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'Gpt-3.5 Turbo',
    description: "GPT-3.5 Turbo is OpenAI's fastest model.",
  },
  {
    id: 'llava-13b',
    name: 'Llava 13B',
    description: 'LLava is a large multimodal model that combines a vision...',
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    description: 'Zephyr is a series of language models that are trained to act...',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: "Google's most capable AI model for text and reasoning tasks.",
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    description: 'A powerful open-source model with excellent performance.',
  },
];
