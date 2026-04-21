/**
 * AI Provider Service
 * Routes AI requests to Google Gemini.
 * Falls back to a deterministic demo mode when no API key is configured.
 */

import prisma from '../prismaClient.js';

// ─── Provider call implementations ──────────────────────────────────────────

async function callGemini({ apiKey, model, messages, systemPrompt }) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = model || 'gemini-1.5-flash';
  const geminiModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  // Build conversation history for Gemini
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = geminiModel.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

async function callOpenAI({ apiKey, model, messages, systemPrompt, baseUrl }) {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ 
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}) 
  });
  
  const openaiMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: openaiMessages,
  });

  return response.choices[0].message.content;
}

async function callAnthropic({ apiKey, model, messages, systemPrompt }) {
  const { Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20240620',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
  });

  return response.content[0].text;
}

async function callGroq({ apiKey, model, messages, systemPrompt }) {
  const { OpenAI } = await import('openai'); // Groq uses OpenAI-compatible API
  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const openaiMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await groq.chat.completions.create({
    model: model || 'llama3-70b-8192',
    messages: openaiMessages,
  });

  return response.choices[0].message.content;
}

async function callOllama({ model, messages, systemPrompt, baseUrl }) {
  const response = await fetch(`${baseUrl || 'http://localhost:11434'}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages
      ],
      stream: false,
    }),
  });

  const data = await response.json();
  return data.message.content;
}

// ─── Demo mode (no AI provider needed) ──────────────────────────────────────

function callDemoMode(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('leave') && (msg.includes('apply') || msg.includes('request'))) {
    return JSON.stringify({
      intent: 'APPLY_LEAVE',
      response: "Sure! I'll help you apply for leave. What type of leave would you like? (Annual / Sick / Comp-Off / Maternity / Paternity)",
      action: null,
      missingFields: ['leaveType', 'startDate', 'endDate', 'reason'],
    });
  }
  if (msg.includes('permission')) {
    return JSON.stringify({
      intent: 'APPLY_PERMISSION',
      response: "I'll help you apply for permission. For which date?",
      action: null,
      missingFields: ['date', 'startTime', 'endTime', 'reason'],
    });
  }
  if (msg.includes('balance') || msg.includes('leave balance')) {
    return JSON.stringify({
      intent: 'CHECK_LEAVE_BALANCE',
      response: 'Let me check your leave balance.',
      action: 'CHECK_LEAVE_BALANCE',
      missingFields: [],
    });
  }
  if (msg.includes('holiday')) {
    return JSON.stringify({
      intent: 'HOLIDAY_LIST',
      response: 'Let me fetch the holiday list for you.',
      action: 'HOLIDAY_LIST',
      missingFields: [],
    });
  }
  if (msg.includes('pending') || msg.includes('approval')) {
    return JSON.stringify({
      intent: 'VIEW_PENDING_REQUESTS',
      response: "Let me pull up your pending requests.",
      action: 'VIEW_PENDING_REQUESTS',
      missingFields: [],
    });
  }
  if (msg.includes('add employee') || msg.includes('new employee') || msg.includes('onboard')) {
    return JSON.stringify({
      intent: 'ADD_EMPLOYEE',
      response: "I'll help you add a new employee. What is their full name?",
      action: null,
      missingFields: ['name', 'email', 'password', 'gender', 'designation', 'teamId', 'joiningDate'],
    });
  }
  if (msg.includes('policy') || msg.includes('leave policy')) {
    return JSON.stringify({
      intent: 'LEAVE_POLICY_FAQ',
      response: '📋 **Leave Policy Summary:**\n\n• **Annual Leave**: 12 days/year\n• **Sick Leave**: 12 days/year\n• **Comp-Off**: Earned by working on weekends\n• **Maternity**: 180 days\n• **Paternity**: 15 days\n\nLeave must be applied at least 1 day in advance (except sick leave). LOP applies when balance is exhausted.',
      action: null,
      missingFields: [],
    });
  }

  return JSON.stringify({
    intent: 'GENERAL_HR_FAQ',
    response: "Hello! I'm your HR Assistant. I can help you with:\n\n• Applying for **leave, permission, or comp-off**\n• Checking your **leave balance**\n• Viewing **holiday list**\n• HR **policy questions**\n• **Approval** of pending requests (managers)\n• **Employee management** (admins)\n\nWhat would you like to do?",
    action: null,
    missingFields: [],
  });
}

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Get AI settings for an organization.
 * @param {number} organizationId
 */
export const getAiSettings = async (organizationId) => {
  try {
    const settings = await prisma.aiSettings.findUnique({
      where: { organizationId },
    });
    return settings || { provider: 'demo', isEnabled: true };
  } catch {
    return { provider: 'demo', isEnabled: true };
  }
};

/**
 * Call the configured AI provider (Gemini).
 * @param {object} params
 * @param {number} params.organizationId
 * @param {string} params.systemPrompt
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {string} params.userMessage - Raw user message for demo fallback
 * @returns {Promise<string>} Raw text response from the AI
 */
export const callAI = async ({ organizationId, systemPrompt, messages, userMessage }) => {
  const settings = await getAiSettings(organizationId);

  if (!settings.isEnabled) {
    return JSON.stringify({
      intent: 'DISABLED',
      response: 'The AI Assistant has been disabled by your administrator.',
      action: null,
      missingFields: [],
    });
  }

  const provider = settings.provider || 'demo';

  try {
    if (provider === 'gemini') {
      return await callGemini({
        apiKey: settings.apiKey,
        model: settings.model || 'gemini-1.5-flash',
        messages,
        systemPrompt: settings.systemPrompt || systemPrompt,
      });
    }

    if (provider === 'openai') {
      return await callOpenAI({
        apiKey: settings.apiKey,
        model: settings.model || 'gpt-4o-mini',
        messages,
        systemPrompt: settings.systemPrompt || systemPrompt,
        baseUrl: settings.baseUrl,
      });
    }

    if (provider === 'anthropic') {
      return await callAnthropic({
        apiKey: settings.apiKey,
        model: settings.model || 'claude-3-5-sonnet-20240620',
        messages,
        systemPrompt: settings.systemPrompt || systemPrompt,
      });
    }

    if (provider === 'groq') {
      return await callGroq({
        apiKey: settings.apiKey,
        model: settings.model || 'llama3-70b-8192',
        messages,
        systemPrompt: settings.systemPrompt || systemPrompt,
      });
    }

    if (provider === 'ollama') {
      return await callOllama({
        model: settings.model || 'llama3',
        messages,
        systemPrompt: settings.systemPrompt || systemPrompt,
        baseUrl: settings.baseUrl,
      });
    }

    // Default to Demo mode
    return callDemoMode(userMessage || messages[messages.length - 1]?.content || '');
  } catch (err) {
    console.error(`[AI Provider: ${provider}] Error:`, err.message);
    return JSON.stringify({
      intent: 'ERROR',
      response: `⚠️ AI error: ${err.message.substring(0, 100)}. Falling back to basic mode.`,
      action: null,
      missingFields: [],
    });
  }
};
