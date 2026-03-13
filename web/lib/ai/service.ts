import 'server-only'

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// ── Provider Types ──

interface Provider {
  id: string
  type: 'anthropic' | 'openai'
  client: Anthropic | OpenAI
  model: string
  available: boolean
  unavailableUntil: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  content: string
  provider: string
  model: string
  tokens?: { input: number; output: number }
}

// ── Provider Pool ──

const COOLDOWN_MS = 5 * 60 * 1000 // 5 min cooldown on error

function buildProviders(): Provider[] {
  const providers: Provider[] = []

  // Anthropic keys — supports both numbered (multi-key rotation) and single key
  const anthropicKeys = [
    process.env.ANTHROPIC_API_KEY_1,
    process.env.ANTHROPIC_API_KEY_2,
    process.env.ANTHROPIC_API_KEY_3,
    process.env.ANTHROPIC_API_KEY,
  ].filter(Boolean) as string[]
  // Deduplicate in case ANTHROPIC_API_KEY === ANTHROPIC_API_KEY_1
  const uniqueAnthropicKeys = [...new Set(anthropicKeys)]

  for (let i = 0; i < uniqueAnthropicKeys.length; i++) {
    providers.push({
      id: `anthropic-${i + 1}`,
      type: 'anthropic',
      client: new Anthropic({ apiKey: uniqueAnthropicKeys[i] }),
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      available: true,
      unavailableUntil: 0,
    })
  }

  // OpenAI key
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: 'openai-1',
      type: 'openai',
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-4o',
      available: true,
      unavailableUntil: 0,
    })
  }

  return providers
}

let providers: Provider[] | null = null
let nextIndex = 0

function getProviders(): Provider[] {
  if (!providers) {
    providers = buildProviders()
  }
  return providers
}

// ── Round-robin selection ──

function selectProvider(): Provider | null {
  const pool = getProviders()
  if (pool.length === 0) return null

  const now = Date.now()
  // Reset any providers whose cooldown has expired
  for (const p of pool) {
    if (!p.available && now >= p.unavailableUntil) {
      p.available = true
    }
  }

  const available = pool.filter((p) => p.available)
  if (available.length === 0) return null

  const provider = available[nextIndex % available.length]
  nextIndex = (nextIndex + 1) % available.length
  return provider
}

function markUnavailable(provider: Provider): void {
  provider.available = false
  provider.unavailableUntil = Date.now() + COOLDOWN_MS
}

// ── Chat API ──

export async function chat(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ChatResponse> {
  const maxAttempts = getProviders().length
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const provider = selectProvider()
    if (!provider) {
      throw new Error('No AI providers available. Check API keys in .env.local.')
    }

    try {
      if (provider.type === 'anthropic') {
        return await chatAnthropic(provider, messages, options)
      } else {
        return await chatOpenAI(provider, messages, options)
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      markUnavailable(provider)
    }
  }

  throw lastError || new Error('All AI providers failed.')
}

async function chatAnthropic(
  provider: Provider,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ChatResponse> {
  const client = provider.client as Anthropic

  // Extract system message
  const systemMsg = messages.find((m) => m.role === 'system')
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  const response = await client.messages.create({
    model: provider.model,
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature ?? 0.3,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: userMessages,
  })

  const textBlock = response.content.find((b) => b.type === 'text')

  return {
    content: textBlock?.text || '',
    provider: provider.id,
    model: provider.model,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  }
}

async function chatOpenAI(
  provider: Provider,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ChatResponse> {
  const client = provider.client as OpenAI

  const response = await client.chat.completions.create({
    model: provider.model,
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature ?? 0.3,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const choice = response.choices[0]

  return {
    content: choice?.message?.content || '',
    provider: provider.id,
    model: provider.model,
    tokens: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
  }
}

// ── Status ──

export function getProviderStatus(): {
  id: string
  type: string
  model: string
  available: boolean
}[] {
  return getProviders().map((p) => ({
    id: p.id,
    type: p.type,
    model: p.model,
    available: p.available && Date.now() >= p.unavailableUntil,
  }))
}

export function getAvailableProviderCount(): number {
  return getProviders().filter(
    (p) => p.available || Date.now() >= p.unavailableUntil
  ).length
}
