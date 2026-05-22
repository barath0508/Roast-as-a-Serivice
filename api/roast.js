// api/roast.js
// Node.js Serverless Function for Vercel

export default async function handler(req, res) {
  // Set CORS headers for security and access controls
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { category, data, severity, persona } = req.body;
  if (!category || !data || !severity || !persona) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get Gemini API keys from environment variables on the host server (e.g. Vercel)
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
  const apiKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);

  if (!apiKeys.length) {
    return res.status(503).json({
      error: "Gemini API key is not configured on the server. Please configure it in Vercel settings or provide your own key in the browser interface."
    });
  }

  const defaultModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  let subjectDesc = '';
  if (category === 'github') {
    subjectDesc = `GitHub Profile for user "${data.username}". Details: Name: ${data.name}, Bio: ${data.bio}, Repos: ${data.reposCount}, Followers: ${data.followers}, Top Languages: ${JSON.stringify(data.languages)}`;
  } else if (category === 'resume') {
    subjectDesc = `Resume text: ${data.resumeText}`;
  } else if (category === 'startup') {
    subjectDesc = `Startup "${data.startupName}". Pitch: ${data.startupDesc}`;
  } else if (category === 'code') {
    subjectDesc = `Code Snippet: \n\`\`\`\n${data.codeText}\n\`\`\``;
  } else {
    subjectDesc = `Custom target: ${data.target}. Context/details: ${data.text}`;
  }

  const severityPrompts = {
    '1': 'Mild and friendly. A playful poke, light teasing. Add a gentle encouraging note at the very end.',
    '2': 'Spicy and biting. Direct, witty, highly sarcastic, and creative insults.',
    '3': 'Nuclear and savage. Show no mercy. Unleash absolute emotional damage. Brutal, hilarious, and devastatingly honest.'
  };

  const personaPrompts = {
    'gordon': 'Gordon Ramsay: Shouting, kitchen nightmares analogies, "IT\'S RAW", calling them an idiot sandwich, extremely passionate and angry.',
    'vc': 'Silicon Valley VC: Tech-bro buzzword-heavy, condescendingly talks about scaling, synergizing, unit economics, seed-rounds, AI-pivot, and burning cash. Passive-aggressive.',
    'reviewer': 'Condescending Code Reviewer: Pedantic, passive-aggressive, nitpicky, sighs, asks "did you even run this?", refers to code smells, bad Git practices, and stackoverflow copy-pasting.',
    'shakespeare': 'Shakespearean Insulter: Poetical, dramatic, theatrical Elizabethan language, uses words like "Thou", "Knave", "Beast", "Lily-livered", "Cockatrice", rhyming insults.',
    'genz': 'Sarcastic Gen Z: Minimalist lowercase, heavy skull emoji use (💀), "bruh", "it\'s giving...", "no cap", "who let you cook", "caught in 4k", "side eye", zero punctuation, bored and unimpressed.'
  };

  const systemInstruction = `You are a professional comedian specializing in roasts. You operate the Roast-as-a-Service (RaaS) system.
Your task is to roast the subject provided.
You must adopt this persona: ${personaPrompts[persona]}
You must scale the severity to: ${severityPrompts[severity]}
Do not include warnings or disclaimers in the output, just output the roast directly. Keep the roast length around 2 to 4 paragraphs, concise and punchy.`;

  const prompt = `${systemInstruction}\n\nSubject to roast:\n${subjectDesc}`;

  let roastText = "";
  let lastError = "";
  const allErrors = [];

  outer: for (const model of defaultModels) {
    for (const key of apiKeys) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      
      try {
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          lastError = errorText.length > 500 ? errorText.substring(0, 500) + '...[truncated]' : errorText;
          allErrors.push(`[${model}] ${response.status}: ${lastError}`);

          const isKeyError =
            response.status === 429 ||
            response.status === 403 ||
            lastError.includes("API_KEY_INVALID") ||
            lastError.includes("API key expired");

          if (isKeyError) {
            continue;
          }
          break; // Try next model
        }

        const resJson = await response.json();
        roastText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (roastText) {
          break outer;
        }
      } catch (err) {
        lastError = err.message || err;
        allErrors.push(`[${model}] fetch error: ${lastError}`);
      }
    }
  }

  if (!roastText) {
    return res.status(502).json({
      error: `Roast generation failed on backend.\nAll Errors:\n${allErrors.join('\n')}`
    });
  }

  return res.status(200).json({ roast: roastText.trim() });
}
