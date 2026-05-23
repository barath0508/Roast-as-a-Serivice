// api/roast.js
// Node.js Serverless Function for Vercel

function tryParseJson(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(json)?/i, "");
    cleanText = cleanText.replace(/```$/, "");
    cleanText = cleanText.trim();
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("JSON parsing failed on server:", err);
    return null;
  }
}

function recoverStandardRoast(text) {
  return {
    roast: text,
    score: Math.floor(Math.random() * 30) + 60,
    cringe: Math.floor(Math.random() * 30) + 60,
    buzzword: Math.floor(Math.random() * 30) + 60,
    flags: Math.floor(Math.random() * 30) + 60
  };
}

function recoverBattleRoast(text, target1, target2) {
  // Try to find split indicators, otherwise divide in half
  let r1 = text;
  let r2 = "The AI was too stunned by Target 1 to even review Target 2.";
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes(target2.toLowerCase())) {
    const index = lowerText.indexOf(target2.toLowerCase());
    r1 = text.substring(0, index).trim();
    r2 = text.substring(index).trim();
  } else if (text.includes("\n\n")) {
    const parts = text.split("\n\n");
    r1 = parts[0];
    r2 = parts.slice(1).join("\n\n");
  }

  return {
    roast1: r1,
    roast2: r2,
    winner: target1,
    verdict: "The battle collapsed into pure chaos. A default victory is awarded to the initiator.",
    score1: 80,
    score2: 70
  };
}

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

  const { category, data, severity, persona, language } = req.body;
  if (!category || !data || !severity || !persona) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get Gemini API keys from environment variables
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
  const isBattle = category === 'battle';

  if (isBattle) {
    const t1 = data.target1 || 'Target A';
    const t2 = data.target2 || 'Target B';
    let d1Desc = '';
    let d2Desc = '';
    
    if (data.type === 'github') {
      d1Desc = `GitHub User "${t1}". Details: Name: ${data.profile1?.name || t1}, Bio: ${data.profile1?.bio || ''}, Repos: ${data.profile1?.reposCount || 0}, Followers: ${data.profile1?.followers || 0}, Languages: ${JSON.stringify(data.profile1?.languages || [])}`;
      d2Desc = `GitHub User "${t2}". Details: Name: ${data.profile2?.name || t2}, Bio: ${data.profile2?.bio || ''}, Repos: ${data.profile2?.reposCount || 0}, Followers: ${data.profile2?.followers || 0}, Languages: ${JSON.stringify(data.profile2?.languages || [])}`;
    } else {
      d1Desc = `Custom Target "${t1}". Context: ${data.text1 || ''}`;
      d2Desc = `Custom Target "${t2}". Context: ${data.text2 || ''}`;
    }
    
    subjectDesc = `ROAST BATTLE CONTESTANTS:\nTarget 1 (Player 1): ${t1}\nDetails 1: ${d1Desc}\n\nTarget 2 (Player 2): ${t2}\nDetails 2: ${d2Desc}`;
  } else {
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

  let systemInstruction = '';
  if (isBattle) {
    systemInstruction = `You are a professional comedian specializing in roasts. You operate the Roast-as-a-Service (RaaS) system.
Your task is to host a Roast Battle between the two subjects provided. You must roast both of them individually, declare a winner (one of the target names), and write a hilarious summarizing verdict.
You must adopt this persona: ${personaPrompts[persona]}
You must scale the severity to: ${severityPrompts[severity]}
You must return the output STRICTLY as a single JSON object. Do not write any markdown blocks (like \`\`\`json) or write text before/after the JSON.
The JSON must have this exact structure:
{
  "roast1": "the roast text for target 1 (1-2 paragraphs)",
  "roast2": "the roast text for target 2 (1-2 paragraphs)",
  "winner": "the exact name of the winner (MUST match target 1 or target 2 exactly)",
  "verdict": "a hilarious summary explaining who won, who got burned worse, and why (1 paragraph)",
  "score1": number (0 to 100, roastability score for target 1),
  "score2": number (0 to 100, roastability score for target 2)
}`;
  } else {
    systemInstruction = `You are a professional comedian specializing in roasts. You operate the Roast-as-a-Service (RaaS) system.
Your task is to roast the subject provided.
You must adopt this persona: ${personaPrompts[persona]}
You must scale the severity to: ${severityPrompts[severity]}
You must return the output STRICTLY as a single JSON object. Do not write any markdown blocks (like \`\`\`json) or write text before/after the JSON.
The JSON must have this exact structure:
{
  "roast": "the roast text (2-4 paragraphs, concise, punchy)",
  "score": number (0 to 100, representing how roastable they are overall),
  "cringe": number (0 to 100, cringe level),
  "buzzword": number (0 to 100, buzzword density),
  "flags": number (0 to 100, red flags count/severity)
}`;
  }

  const languagePrompts = {
    english: 'English (Standard)',
    hinglish: 'Hinglish (Hindi + English mixed). Write the roast in natural, normal, conversational Hinglish (Hindi + English mixed) with typical colloquial slang and memes (like "yaar", "chhapri", "nibba/nibbi", "paisa barbad", "alag hi level", "kya chal raha hai", "kat gaya", etc.) that people use in real life to mock each other.',
    hindi: 'Hindi (हिन्दी) in a colloquial, conversational, normal language style. Use typical Indian slang/memes if appropriate, rather than textbook formal Hindi.',
    tamil: 'Tamil (தமிழ் / Tanglish) in a colloquial, conversational, normal language style. Mix in colloquial Tamil words/slang and English words (Tanglish) as used in natural daily conversations.',
    telugu: 'Telugu (తెలుగు) in a colloquial, conversational, normal language style. Mix in colloquial Telugu words/slang and English words as used in natural daily conversations.',
    kannada: 'Kannada (ಕನ್ನಡ) in a colloquial, conversational, normal language style. Mix in colloquial Kannada words/slang and English words as used in natural daily conversations.',
    malayalam: 'Malayalam (മലയാളം) in a colloquial, conversational, normal language style. Mix in colloquial Malayalam words/slang and English words as used in natural daily conversations.',
    marathi: 'Marathi (मराठी) in a colloquial, conversational, normal language style. Mix in colloquial Marathi words/slang and English words as used in natural daily conversations.',
    bengali: 'Bengali (বাংলা) in a colloquial, conversational, normal language style. Mix in colloquial Bengali words/slang and English words as used in natural daily conversations.',
    spanish: 'Spanish (Español) in a colloquial, natural, conversational language style. Mix in casual slang if appropriate.',
    french: 'French (Français) in a colloquial, natural, conversational language style. Mix in casual slang if appropriate.'
  };

  const selectedLanguage = language || 'english';
  const selectedLanguagePrompt = languagePrompts[selectedLanguage] || languagePrompts['english'];
  
  systemInstruction += `\n\nCRITICAL: You MUST write the roast string values (and the verdict/summarizing text) in the following language/slang style: ${selectedLanguagePrompt}. Keep all JSON key names in standard English as specified in the schema, but generate the text content values using this language/slang. Make it sound like natural, normal, conversational mocking that real people would use, keeping the tone of the persona and severity.`;

  const prompt = `${systemInstruction}\n\nSubject to roast:\n${subjectDesc}`;

  let rawResponseText = "";
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
              temperature: 0.8,
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
        rawResponseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (rawResponseText) {
          break outer;
        }
      } catch (err) {
        lastError = err.message || err;
        allErrors.push(`[${model}] fetch error: ${lastError}`);
      }
    }
  }

  if (!rawResponseText) {
    return res.status(502).json({
      error: `Roast generation failed on backend.\nAll Errors:\n${allErrors.join('\n')}`
    });
  }

  // Parse structured output
  const parsed = tryParseJson(rawResponseText);
  if (parsed) {
    return res.status(200).json(parsed);
  } else {
    // If JSON parsing fails, fall back to recovery options
    console.warn("AI output was not valid JSON, applying heuristic recovery: ", rawResponseText);
    if (isBattle) {
      const fallbackObj = recoverBattleRoast(rawResponseText, data.target1 || 'Target A', data.target2 || 'Target B');
      return res.status(200).json(fallbackObj);
    } else {
      const fallbackObj = recoverStandardRoast(rawResponseText);
      return res.status(200).json(fallbackObj);
    }
  }
}
