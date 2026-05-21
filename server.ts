import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __dirname = process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "5mb" }));

  // Shared lazy init for Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it via Settings > Secrets.");
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // API endpoint to review frontend snippets
  app.post("/api/review", async (req: express.Request, res: express.Response) => {
    try {
      const { code, language, context } = req.body;

      if (!code || typeof code !== "string" || code.trim() === "") {
        return res.status(400).json({ error: "No code snippet provided." });
      }

      const ai = getAiClient();

      const systemInstruction = `You are a Senior Frontend Code Reviewer.
Your goal is to inspect user code snippets and provide objective, practical, and highly refined constructive feedback on modern frontend engineering.
Make critiques positive, clear, and actionable. Do not exaggerate simple issues into major failures. Use professional tone.
If a category has no critical issues, write 1 polite item praising the code approach in that category.

CRITICAL RULES:
1. Evaluate React/Frontend practices strictly (avoid fake assumptions about missing APIs or external systems).
2. For React Best Practices: check hook usage, stale closures, dependencies, state patterns.
3. For Maintainability: check readability, file architecture, custom type use, naming clarity.
4. For Reusability: evaluate component splitting, prop configuration, avoiding hardcoded values.
5. For Performance Notes: trace unnecessary re-runs, bad event listeners, heavy DOM depth.
6. For UI/UX Suggestions: note missing interactive feedback, transitions, grid responsiveness and styling.
7. For Accessibility Notes: mention aria labels, landmark sections, focus visible styling, semantic tags ONLY if relevant or write a helpful reinforcement.
8. In 'improvedCode', write complete, valid, run-ready code solving these recommendations. Do not use partial pseudo-code blocks or leave out elements.`;

      const prompt = `Perform a thorough professional frontend code review of this snippet:
Language context: ${language || "JavaScript/React"}
Functional Intent declared: ${context || "Not defined"}

Code:
\`\`\`
${code}
\`\`\`

Generate a comprehensive review structured precisely under the required schema. Ensure the corrected codebase is ready to be dropped into production.`;

      const reviewItemSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short descriptive visual or logical feature reviewed" },
          explanation: { type: Type.STRING, description: "Detailed constructive analysis" },
          lineReference: { type: Type.STRING, description: "Relevant line numbers if any, otherwise leave empty" }
        },
        required: ["title", "explanation"]
      };

      const gResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "Over-all positive, balance-rich overview of the code status and key recommendations."
              },
              reactBestPractices: {
                type: Type.ARRAY,
                description: "Review points on React-specific hooks state, components, or lifecycle patterns.",
                items: reviewItemSchema
              },
              maintainability: {
                type: Type.ARRAY,
                description: "Constructive feedback on code structure, naming patterns, parameter definitions, and maintainable styles.",
                items: reviewItemSchema
              },
              reusability: {
                type: Type.ARRAY,
                description: "Suggestions on making the snippet configurable, flexible, parameterizable, and modular.",
                items: reviewItemSchema
              },
              performanceNotes: {
                type: Type.ARRAY,
                description: "Tips on optimizing re-renders, memoization, event bindings, and DOM cleanups.",
                items: reviewItemSchema
              },
              uiUxSuggestions: {
                type: Type.ARRAY,
                description: "Practical suggestions for visual styling (Tailwind classes), responsiveness, active interactions, and layout.",
                items: reviewItemSchema
              },
              accessibilityNotes: {
                type: Type.ARRAY,
                description: "Helpful pointers regarding semantic landmarks, tab focus indicators, labels, and roles.",
                items: reviewItemSchema
              },
              improvedCode: {
                type: Type.STRING,
                description: "The complete clean corrected snippet."
              },
              improvementExplanation: {
                type: Type.STRING,
                description: "Brief bullet points representing the main mechanical changes applied to the updated snippet."
              }
            },
            required: [
              "summary",
              "reactBestPractices",
              "maintainability",
              "reusability",
              "performanceNotes",
              "uiUxSuggestions",
              "accessibilityNotes",
              "improvedCode",
              "improvementExplanation"
            ]
          }
        }
      });

      const resultText = gResponse.text;

if (!resultText) {
  throw new Error("No review text returned from Gemini API.");
}

const parsedReview = JSON.parse(resultText);

res.json({
  success: true,
  review: parsedReview,
});
    } catch (error: any) {
      console.error("Gemini PR Review Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An error occurred during PR analysis. Please verify your Gemini API Key in the Settings panel.",
      });
    }
  });

  // Serve static files / route to Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PR Review Server running on port ${PORT}`);
  });
}

startServer();
