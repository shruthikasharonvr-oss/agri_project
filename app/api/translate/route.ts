// app/api/translate/route.ts
// Auto-translation API using Google Cloud Translation SDK (v2)

import { NextResponse } from 'next/server';
import { v2 as GoogleTranslate } from '@google-cloud/translate';

// Initialize the Google Cloud Translation client with API key
const translateClient = new GoogleTranslate.Translate({
  key: process.env.GOOGLE_CLOUD_API_KEY,
});

// Server-side in-memory cache (persists across requests in dev)
const serverCache: Map<string, string> = new Map();

// Supported language codes
const SUPPORTED_LANGS = new Set(['hi', 'kn', 'te', 'ta']);

/**
 * Translate a single text using Google Cloud Translation API.
 */
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const [translation] = await translateClient.translate(text, {
      from: 'en',
      to: targetLang,
    });
    return translation;
  } catch (err) {
    console.error(`Google Cloud Translation error for "${text}":`, err);
    throw err;
  }
}

/**
 * Translate multiple texts in a single API call (batch).
 * Google Cloud Translation supports array input natively.
 */
async function translateBatch(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  try {
    const [translations] = await translateClient.translate(texts, {
      from: 'en',
      to: targetLang,
    });
    // Google returns a single string if only one text, or an array
    return Array.isArray(translations) ? translations : [translations];
  } catch (err) {
    console.error('Google Cloud batch translation error:', err);
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const { texts, targetLang } = await request.json();

    // ── Validation ──────────────────────────────────────────
    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLang) {
      return NextResponse.json(
        { error: 'Missing texts array or targetLang' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGS.has(targetLang)) {
      return NextResponse.json(
        { error: `Unsupported language: ${targetLang}` },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_CLOUD_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    // ── Check cache & collect uncached texts ────────────────
    const translations: Record<string, string> = {};
    const toTranslate: string[] = [];

    for (const text of texts) {
      const cacheKey = `${targetLang}::${text}`;
      const cached = serverCache.get(cacheKey);
      if (cached) {
        translations[text] = cached;
      } else {
        toTranslate.push(text);
      }
    }

    // ── Translate uncached texts via Google Cloud SDK ────────
    if (toTranslate.length > 0) {
      try {
        // Use batch translation for efficiency (single API call)
        const results = await translateBatch(toTranslate, targetLang);

        for (let i = 0; i < toTranslate.length; i++) {
          const originalText = toTranslate[i];
          const translated = results[i] || originalText;
          const cacheKey = `${targetLang}::${originalText}`;

          serverCache.set(cacheKey, translated);
          translations[originalText] = translated;
        }
      } catch {
        // If batch fails, fall back to one-by-one translation
        console.warn('Batch translation failed, falling back to sequential...');

        for (const text of toTranslate) {
          try {
            const translated = await translateText(text, targetLang);
            const cacheKey = `${targetLang}::${text}`;
            serverCache.set(cacheKey, translated);
            translations[text] = translated;
          } catch {
            console.error(`Failed to translate "${text}"`);
            translations[text] = text; // Fallback to English
          }
        }
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
