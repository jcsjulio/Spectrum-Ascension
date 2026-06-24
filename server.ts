import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Lazy initialize Gemini client to prevent app crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints for Story Planner

  // 1. Generate Outline
  app.post('/api/generate-outline', async (req, res) => {
    try {
      const { prompt, genre, mood } = req.body;
      const ai = getAiClient();

      const userPrompt = `Genre: ${genre || 'General Fiction'}
Mood/Tone: ${mood || 'Adventurous'}
Base Concept: ${prompt || 'A journey into the unknown'}

Generate a structured novel/story outline. Create a captivating title, a strong premise, core themes, and a list of chapters. Ensure it is engaging and structurally sound.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: 'You are an award-winning creative writing consultant and novelist. Help the user construct highly structured, compelling, and cohesive story outlines with clear chapter arcs.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'The title of the story.' },
              premise: { type: Type.STRING, description: 'A brief, 2-3 sentence overview/hook of the narrative.' },
              themes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 underlying themes of the story.'
              },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER, description: 'Chapter number.' },
                    title: { type: Type.STRING, description: 'Chapter title.' },
                    description: { type: Type.STRING, description: 'Detailed chapter plot points, action, and character development.' },
                    pacing: { type: Type.STRING, description: 'The pacing of the chapter (e.g., Expository, Rising Tension, Climactic, Slow/Reflective).' }
                  },
                  required: ['number', 'title', 'description', 'pacing']
                }
              }
            },
            required: ['title', 'premise', 'themes', 'chapters']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Outline Generation Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate outline.' });
    }
  });

  // 2. Generate Character Profile
  app.post('/api/generate-character', async (req, res) => {
    try {
      const { prompt, role, genre } = req.body;
      const ai = getAiClient();

      const userPrompt = `Role in Story: ${role || 'Protagonist'}
Genre: ${genre || 'Fantasy'}
Description/Idea: ${prompt || 'A rogue with a hidden lineage'}

Generate a highly detailed character sheet with a unique name, character archetype, physical appearance, personality traits, a compelling backstory, core motivations, and deepest fears.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: 'You are a master character designer for novels, screenplays, and narrative games. You create multi-dimensional, complex, and relatable characters with strengths, flaws, and deep internal conflicts.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The character\'s name.' },
              archetype: { type: Type.STRING, description: 'The narrative archetype (e.g., The Reluctant Hero, The Trickster, The Shadow).' },
              appearance: { type: Type.STRING, description: 'Detailed physical description, clothing, mannerisms, and notable features.' },
              personalityTraits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4-6 distinct personality traits (include both virtues and flaws).'
              },
              backstory: { type: Type.STRING, description: 'Compelling backstory detailing formative events, secrets, or past relationships.' },
              goals: { type: Type.STRING, description: 'The character\'s primary external and internal motivations/goals.' },
              fears: { type: Type.STRING, description: 'Their deepest fear or vulnerability that threatens their journey.' }
            },
            required: ['name', 'archetype', 'appearance', 'personalityTraits', 'backstory', 'goals', 'fears']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Character Generation Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate character.' });
    }
  });

  // 3. Generate World Codex Entry
  app.post('/api/generate-world', async (req, res) => {
    try {
      const { prompt, category, genre } = req.body;
      const ai = getAiClient();

      const userPrompt = `Category: ${category || 'Location'}
Genre: ${genre || 'Sci-Fi'}
Lore Request: ${prompt || 'A city floating in the upper atmosphere of a gas giant'}

Generate a lore entry for the Worldbuilding Codex. Provide a fitting name, a brief 1-2 sentence summary, a detailed description (using clean markdown spacing), and connected lore elements.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: 'You are an immersive worldbuilder and lore keeper. You create rich, detailed, and atmospheric lore that feels lived-in, cohesive, and deeply fascinating.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Name of the location, faction, artifact, magic system, or historical event.' },
              summary: { type: Type.STRING, description: 'A brief, evocative summary of the entry.' },
              details: { type: Type.STRING, description: 'Rich, comprehensive details of this lore entry in readable prose.' },
              connectedElements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 related concepts, factions, or details that are connected to this entry.'
              }
            },
            required: ['name', 'summary', 'details', 'connectedElements']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('World Lore Generation Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate world lore.' });
    }
  });

  // 4. Co-Writer Assistance
  app.post('/api/co-write', async (req, res) => {
    try {
      const { text, action, instruction, tone } = req.body;
      const ai = getAiClient();

      let systemInstruction = 'You are an elite co-writer, helping authors expand, refine, and polish their drafts. Maintain the author\'s creative voice while elevating their prose.';
      let prompt = '';

      if (action === 'continue') {
        prompt = `Here is the current story draft:
"""
${text}
"""

Please write the next 2-3 logical and highly engaging paragraphs, maintaining the flow, tension, and tone of the draft.`;
      } else if (action === 'polish') {
        prompt = `Please rewrite and polish the following prose to make it more evocative, professionally styled, and structurally sound:
"""
${text}
"""`;
      } else if (action === 'tone') {
        prompt = `Please rewrite the following prose, shifting its tone to be distinctly "${tone || 'Dramatic'}":
"""
${text}
"""`;
      } else if (action === 'brainstorm') {
        prompt = `Based on the following story context:
"""
${text}
"""

${instruction ? `Instruction: ${instruction}` : ''}

Brainstorm 3 separate, highly compelling directions or plot twists the story could take next. Provide them as structured suggestions.`;
        systemInstruction = 'You are a master story editor. Offer creative, unpredictable, yet logical ideas and plot twists for drafts.';
      } else {
        // Custom instruction on text
        prompt = `Review the following story draft:
"""
${text}
"""

Instruction: ${instruction || 'Provide feedback and improvements.'}

Please apply this instruction directly to the draft, outputting the improved draft or feedback accordingly.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resultText: { type: Type.STRING, description: 'The generated story content, rewritten prose, or brainstorm suggestions.' }
            },
            required: ['resultText']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Co-writer Error:', err);
      res.status(500).json({ error: err.message || 'Co-writer function failed.' });
    }
  });

  // Frontend Serving Middleware Setup

  if (!isProd) {
    // Development mode
    console.log('Loading Vite middleware for development...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log('Serving production build assets...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Critical failure starting server:', error);
});
