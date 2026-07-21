import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Cache for provider status (5 minutes)
const statusCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Validate provider format
const VALID_PROVIDERS = ['openai', 'openrouter', 'anthropic', 'gemini', 'local'];

function validateProvider(provider) {
  if (!provider || typeof provider !== 'string') {
    throw new Error('Provider must be a non-empty string');
  }
  const normalized = provider.toLowerCase().trim();
  if (!VALID_PROVIDERS.includes(normalized)) {
    throw new Error(`Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`);
  }
  return normalized;
}

function validateApiKey(apiKey, provider) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('API key must be a non-empty string');
  }
  // Basic validation - keys should have minimum length
  if (apiKey.trim().length < 10) {
    throw new Error('API key appears to be invalid (too short)');
  }
  return apiKey.trim();
}

function getEnvKeyName(provider) {
  const keyMap = {
    openai: 'OPENAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
    local: 'LOCAL_AI_ENDPOINT',
  };
  return keyMap[provider];
}

// (1) POST /ai/configure-provider
router.post('/configure-provider', async (req, res) => {
  const { provider, apiKey, model, endpoint } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  const normalizedProvider = validateProvider(provider);
  const validatedKey = validateApiKey(apiKey, normalizedProvider);

  // For local provider, endpoint is required
  if (normalizedProvider === 'local' && !endpoint) {
    return res.status(400).json({ error: 'Endpoint is required for local provider' });
  }

  try {
    const envKeyName = getEnvKeyName(normalizedProvider);
    
    // Store in environment (in production, this would update .env file)
    process.env[envKeyName] = validatedKey;
    if (normalizedProvider === 'local' && endpoint) {
      process.env.LOCAL_AI_ENDPOINT = endpoint;
    }
    if (model) {
      process.env[`${normalizedProvider.toUpperCase()}_MODEL`] = model;
    }

    logger.info(`Provider configured: ${normalizedProvider}`);

    // Clear cache for this provider
    statusCache.delete(normalizedProvider);

    res.json({
      success: true,
      provider: normalizedProvider,
      status: 'configured',
      message: `${normalizedProvider} provider configured successfully`,
    });
  } catch (error) {
    logger.error(`Failed to configure provider ${normalizedProvider}:`, error.message);
    throw new Error('Failed to configure provider');
  }
});

// (2) POST /ai/test-connection
router.post('/test-connection', async (req, res) => {
  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    let success = false;
    let message = '';

    switch (normalizedProvider) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        success = response.ok;
        message = success ? 'Connected to OpenAI' : 'Failed to connect to OpenAI';
        break;
      }
      case 'openrouter': {
        const response = await fetch('https://openrouter.io/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        success = response.ok;
        message = success ? 'Connected to OpenRouter' : 'Failed to connect to OpenRouter';
        break;
      }
      case 'anthropic': {
        const response = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': apiKey },
        });
        success = response.ok;
        message = success ? 'Connected to Anthropic' : 'Failed to connect to Anthropic';
        break;
      }
      case 'gemini': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        success = response.ok;
        message = success ? 'Connected to Gemini' : 'Failed to connect to Gemini';
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          return res.status(400).json({
            error: 'Local endpoint not configured',
          });
        }
        const response = await fetch(`${endpoint}/health`, {
          method: 'GET',
        });
        success = response.ok;
        message = success ? 'Connected to local AI' : 'Failed to connect to local AI';
        break;
      }
    }

    // Update cache
    statusCache.set(normalizedProvider, {
      status: success ? 'connected' : 'disconnected',
      lastTested: new Date().toISOString(),
      timestamp: Date.now(),
    });

    logger.info(`Connection test for ${normalizedProvider}: ${success ? 'success' : 'failed'}`);

    res.json({
      success,
      provider: normalizedProvider,
      status: success ? 'connected' : 'disconnected',
      message,
    });
  } catch (error) {
    logger.error(`Connection test failed for ${normalizedProvider}:`, error.message);
    throw new Error(`Failed to test connection to ${normalizedProvider}`);
  }
});

// (3) GET /ai/provider-status
router.get('/provider-status', async (req, res) => {
  try {
    const providers = [];

    for (const provider of VALID_PROVIDERS) {
      const envKeyName = getEnvKeyName(provider);
      const isConfigured = !!process.env[envKeyName];

      if (!isConfigured) {
        providers.push({
          name: provider,
          status: 'not-configured',
          model: null,
          lastTested: null,
        });
        continue;
      }

      // Check cache
      let cached = statusCache.get(provider);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const modelKey = `${provider.toUpperCase()}_MODEL`;
        providers.push({
          name: provider,
          status: cached.status,
          model: process.env[modelKey] || null,
          lastTested: cached.lastTested,
        });
        continue;
      }

      // Test connection if not cached
      let status = 'unknown';
      let lastTested = null;

      try {
        let testResponse;
        switch (provider) {
          case 'openai':
            testResponse = await fetch('https://api.openai.com/v1/models', {
              headers: { 'Authorization': `Bearer ${process.env[envKeyName]}` },
            });
            break;
          case 'openrouter':
            testResponse = await fetch('https://openrouter.io/api/v1/models', {
              headers: { 'Authorization': `Bearer ${process.env[envKeyName]}` },
            });
            break;
          case 'anthropic':
            testResponse = await fetch('https://api.anthropic.com/v1/models', {
              headers: { 'x-api-key': process.env[envKeyName] },
            });
            break;
          case 'gemini':
            testResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env[envKeyName]}`
            );
            break;
          case 'local':
            testResponse = await fetch(`${process.env.LOCAL_AI_ENDPOINT}/health`);
            break;
        }

        status = testResponse.ok ? 'connected' : 'disconnected';
        lastTested = new Date().toISOString();

        // Update cache
        statusCache.set(provider, {
          status,
          lastTested,
          timestamp: Date.now(),
        });
      } catch (error) {
        status = 'error';
        lastTested = new Date().toISOString();
        statusCache.set(provider, {
          status,
          lastTested,
          timestamp: Date.now(),
        });
      }

      const modelKey = `${provider.toUpperCase()}_MODEL`;
      providers.push({
        name: provider,
        status,
        model: process.env[modelKey] || null,
        lastTested,
      });
    }

    res.json({ providers });
  } catch (error) {
    logger.error('Failed to get provider status:', error.message);
    throw new Error('Failed to get provider status');
  }
});

// (4) POST /ai/generate-content
router.post('/generate-content', async (req, res) => {
  const { provider, prompt, contentType, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt must be a non-empty string' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    let content = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = context
      ? `You are a helpful AI assistant. Context: ${context}`
      : 'You are a helpful AI assistant.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.candidates[0].content.parts[0].text;
        tokens = 0; // Gemini doesn't return token count in this endpoint
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        content = data.content || data.text;
        tokens = data.tokens || 0;
        break;
      }
    }

    // Log usage to PocketBase
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: contentType || 'general',
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Generated content with ${normalizedProvider} (${tokens} tokens)`);

    res.json({
      success: true,
      content,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to generate content with ${normalizedProvider}:`, error.message);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
});

// (5) POST /ai/repurpose-content
router.post('/repurpose-content', async (req, res) => {
  const { provider, originalContent, targetFormat, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!originalContent || typeof originalContent !== 'string' || originalContent.trim().length === 0) {
    return res.status(400).json({ error: 'Original content must be a non-empty string' });
  }
  if (!targetFormat || typeof targetFormat !== 'string' || targetFormat.trim().length === 0) {
    return res.status(400).json({ error: 'Target format must be a non-empty string' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    const prompt = `Repurpose the following content into ${targetFormat} format:\n\n${originalContent}${context ? `\n\nContext: ${context}` : ''}`;

    let content = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = 'You are an expert content strategist. Repurpose content while maintaining the core message and optimizing for the target format.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.candidates[0].content.parts[0].text;
        tokens = 0;
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        content = data.content || data.text;
        tokens = data.tokens || 0;
        break;
      }
    }

    // Log usage
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: `repurpose_to_${targetFormat}`,
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Repurposed content with ${normalizedProvider} (${tokens} tokens)`);

    res.json({
      success: true,
      content,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to repurpose content with ${normalizedProvider}:`, error.message);
    throw new Error(`Failed to repurpose content: ${error.message}`);
  }
});

// (6) POST /ai/summarize-campaign
router.post('/summarize-campaign', async (req, res) => {
  const { provider, campaignId, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
    return res.status(400).json({ error: 'Campaign ID must be a non-empty string' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    // Fetch campaign from PocketBase
    const campaign = await pb.collection('campaigns').getOne(campaignId);

    const campaignContent = `
Campaign: ${campaign.name || 'Untitled'}
Description: ${campaign.description || 'No description'}
Status: ${campaign.status || 'Unknown'}
Created: ${campaign.created || 'Unknown'}
Content: ${campaign.content || 'No content'}
    `;

    const prompt = `Summarize the following campaign and provide key insights:\n${campaignContent}${context ? `\n\nAdditional context: ${context}` : ''}`;

    let summary = '';
    let insights = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = 'You are an expert marketing analyst. Provide a concise summary and actionable insights.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        tokens = data.usage.total_tokens;

        // Parse response into summary and insights
        const parts = responseText.split('\n\n');
        summary = parts[0] || responseText;
        insights = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        tokens = data.usage.total_tokens;

        const parts = responseText.split('\n\n');
        summary = parts[0] || responseText;
        insights = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;

        const parts = responseText.split('\n\n');
        summary = parts[0] || responseText;
        insights = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        tokens = 0;

        const parts = responseText.split('\n\n');
        summary = parts[0] || responseText;
        insights = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content || data.text;
        tokens = data.tokens || 0;

        const parts = responseText.split('\n\n');
        summary = parts[0] || responseText;
        insights = parts.slice(1).join('\n\n') || '';
        break;
      }
    }

    // Log usage
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: 'campaign_summary',
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Summarized campaign ${campaignId} with ${normalizedProvider}`);

    res.json({
      success: true,
      summary,
      insights,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to summarize campaign:`, error.message);
    throw new Error(`Failed to summarize campaign: ${error.message}`);
  }
});

// (7) POST /ai/draft-follow-up
router.post('/draft-follow-up', async (req, res) => {
  const { provider, contactId, lastInteraction, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!contactId || typeof contactId !== 'string' || contactId.trim().length === 0) {
    return res.status(400).json({ error: 'Contact ID must be a non-empty string' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    // Fetch contact from PocketBase
    const contact = await pb.collection('contacts_opportunities').getOne(contactId);

    const contactInfo = `
Contact: ${contact.name || 'Unknown'}
Email: ${contact.email || 'Unknown'}
Company: ${contact.company || 'Unknown'}
Last Interaction: ${lastInteraction || contact.lastInteraction || 'Unknown'}
Status: ${contact.status || 'Unknown'}
    `;

    const prompt = `Draft a professional follow-up message for the following contact:\n${contactInfo}${context ? `\n\nContext: ${context}` : ''}`;

    let draftMessage = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = 'You are an expert sales professional. Draft a personalized, professional follow-up message that is concise and action-oriented.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        draftMessage = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        draftMessage = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        draftMessage = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        draftMessage = data.candidates[0].content.parts[0].text;
        tokens = 0;
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        draftMessage = data.content || data.text;
        tokens = data.tokens || 0;
        break;
      }
    }

    // Log usage
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: 'follow_up_draft',
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Drafted follow-up for contact ${contactId} with ${normalizedProvider}`);

    res.json({
      success: true,
      draftMessage,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to draft follow-up:`, error.message);
    throw new Error(`Failed to draft follow-up: ${error.message}`);
  }
});

// (8) POST /ai/analyze-brand-voice
router.post('/analyze-brand-voice', async (req, res) => {
  const { provider, contentSamples, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!contentSamples || !Array.isArray(contentSamples) || contentSamples.length === 0) {
    return res.status(400).json({ error: 'Content samples must be a non-empty array' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    const samplesText = contentSamples.join('\n\n---\n\n');
    const prompt = `Analyze the brand voice in the following content samples and provide guidelines for maintaining consistency:\n\n${samplesText}${context ? `\n\nAdditional context: ${context}` : ''}`;

    let analysis = '';
    let guidelines = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = 'You are an expert brand strategist and copywriter. Analyze the brand voice and provide clear, actionable guidelines.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        tokens = data.usage.total_tokens;

        const parts = responseText.split('\n\n');
        analysis = parts[0] || responseText;
        guidelines = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        tokens = data.usage.total_tokens;

        const parts = responseText.split('\n\n');
        analysis = parts[0] || responseText;
        guidelines = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;

        const parts = responseText.split('\n\n');
        analysis = parts[0] || responseText;
        guidelines = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        tokens = 0;

        const parts = responseText.split('\n\n');
        analysis = parts[0] || responseText;
        guidelines = parts.slice(1).join('\n\n') || '';
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content || data.text;
        tokens = data.tokens || 0;

        const parts = responseText.split('\n\n');
        analysis = parts[0] || responseText;
        guidelines = parts.slice(1).join('\n\n') || '';
        break;
      }
    }

    // Log usage
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: 'brand_voice_analysis',
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Analyzed brand voice with ${normalizedProvider}`);

    res.json({
      success: true,
      analysis,
      guidelines,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to analyze brand voice:`, error.message);
    throw new Error(`Failed to analyze brand voice: ${error.message}`);
  }
});

// (9) POST /ai/suggest-improvements
router.post('/suggest-improvements', async (req, res) => {
  const { provider, content, contentType, context } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content must be a non-empty string' });
  }

  const normalizedProvider = validateProvider(provider);
  const envKeyName = getEnvKeyName(normalizedProvider);
  const apiKey = process.env[envKeyName];

  if (!apiKey) {
    return res.status(400).json({
      error: `${normalizedProvider} provider not configured`,
    });
  }

  try {
    const prompt = `Suggest improvements for the following ${contentType || 'content'}:\n\n${content}${context ? `\n\nContext: ${context}` : ''}`;

    let suggestions = '';
    let model = '';
    let tokens = 0;

    const systemPrompt = 'You are an expert editor and content strategist. Provide specific, actionable suggestions for improvement.';

    switch (normalizedProvider) {
      case 'openai': {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        suggestions = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'openrouter': {
        model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        const response = await fetch('https://openrouter.io/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        suggestions = data.choices[0].message.content;
        tokens = data.usage.total_tokens;
        break;
      }
      case 'anthropic': {
        model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        suggestions = data.content[0].text;
        tokens = data.usage.input_tokens + data.usage.output_tokens;
        break;
      }
      case 'gemini': {
        model = process.env.GEMINI_MODEL || 'gemini-pro';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        suggestions = data.candidates[0].content.parts[0].text;
        tokens = 0;
        break;
      }
      case 'local': {
        const endpoint = process.env.LOCAL_AI_ENDPOINT;
        if (!endpoint) {
          throw new Error('Local endpoint not configured');
        }
        model = process.env.LOCAL_AI_MODEL || 'local-model';
        const response = await fetch(`${endpoint}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            system: systemPrompt,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        suggestions = data.content || data.text;
        tokens = data.tokens || 0;
        break;
      }
    }

    // Log usage
    try {
      await pb.collection('ai_usage').create({
        provider: normalizedProvider,
        model,
        contentType: `improve_${contentType || 'content'}`,
        tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      logger.warn('Failed to log AI usage:', logError.message);
    }

    logger.info(`Suggested improvements with ${normalizedProvider}`);

    res.json({
      success: true,
      suggestions,
      provider: normalizedProvider,
      model,
      tokens,
    });
  } catch (error) {
    logger.error(`Failed to suggest improvements:`, error.message);
    throw new Error(`Failed to suggest improvements: ${error.message}`);
  }
});

export default router;