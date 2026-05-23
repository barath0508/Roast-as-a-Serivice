// Roast Generation Engine - Dual Mode: Gemini AI API & High-Fidelity Heuristics Engine

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
    console.error("JSON parsing failed on client:", err);
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

// 1. AI API Mode Handler
async function generateAiRoast(apiKey, category, data, severity, persona) {
  const apiKeys = apiKey.split(",").map(k => k.trim()).filter(Boolean);
  if (!apiKeys.length) {
    throw new Error("No Gemini API keys provided.");
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
    
    subjectDesc = `ROAST BATTLE CONTEXT:\nTarget 1 (Player 1): ${t1}\nDetails 1: ${d1Desc}\n\nTarget 2 (Player 2): ${t2}\nDetails 2: ${d2Desc}`;
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
            console.warn(`[RoastEngine] Key error (${response.status}) on model ${model}. Trying next key...`);
            continue;
          }
          console.warn(`[RoastEngine] Model error (${response.status}) on model ${model}. Trying next model...`);
          break; // Break the key loop, try next model
        }

        const data = await response.json();
        rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (rawResponseText) {
          break outer;
        }
      } catch (err) {
        lastError = err.message || err;
        allErrors.push(`[${model}] fetch error: ${lastError}`);
        console.warn(`[RoastEngine] Error during generation on model ${model}:`, err);
      }
    }
  }

  if (!rawResponseText) {
    const tried = defaultModels.join(", ");
    throw new Error(`Roast generation failed across models [${tried}] and ${apiKeys.length} key(s).\nAll Errors:\n${allErrors.join('\n')}`);
  }

  const parsed = tryParseJson(rawResponseText);
  if (parsed) {
    return parsed;
  } else {
    if (isBattle) {
      return recoverBattleRoast(rawResponseText, data.target1 || 'Target A', data.target2 || 'Target B');
    } else {
      return recoverStandardRoast(rawResponseText);
    }
  }
}

// 2. Local Heuristics / Template Engine (Fallback & Default Mode)
const LOCAL_ROAST_TEMPLATES = {
  gordon: {
    github: {
      "1": [
        "Come on, {name}! Your GitHub profile looks like a quiet Sunday afternoon. {reposCount} repositories and most of them look like school homework projects. Let's pick up the pace, shall we? You code in {topLang}, which is fine, but it's a bit safe. Put some seasoning on it!",
        "Alright, look. Your bio says '{bio}' - cute, very sweet. But where's the fire? {followers} followers is a start, but we need to see some real action in those commits. Keep pushing, you're not an idiot sandwich yet!"
      ],
      "2": [
        "What in the world is this? {reposCount} public repos and they're all colder than a frozen steak! You code primarily in {topLang}? It's bland! It has no flavor! It's completely uninspired! I've seen better structured projects in a rubbish bin. Clean it up!",
        "Look at this repository list. It's a disaster! {followers} followers? Of course! Who would follow this mess? Your bio: '{bio}'. You're talking big, but your commit history is completely dead! Wake up and start committing some real code!"
      ],
      "3": [
        "STUFFING HELL! This isn't a GitHub profile, it's a digital landfill! {reposCount} repos and every single one is a absolute shambles! Look at the language: {topLang}. You've completely ruined it! It's RAW! It's so raw it's still running on localhost! \n\nYou have {followers} followers and you're following {following} people? You're basically begging for stars, aren't you? Shut it down, clean your directory, and get out of the kitchen!"
      ]
    },
    resume: {
      "1": [
        "This resume is a bit light, isn't it? You've listed all these 'skills' but it reads like a grocery list. You need to show some passion, some seasoning! Don't just sit there listing tools, tell us what you actually cooked!"
      ],
      "2": [
        "You call this a CV? It's bloated, dry, and overcooked! You've used so many buzzwords I think I'm having an allergic reaction! 'Detail-oriented'? 'Team player'? It's generic rubbish! I wouldn't trust you to clean the dishes, let alone manage a project!"
      ],
      "3": [
        "OH MY GOD! What a complete and utter disaster! This resume is so full of fluff it's practically a pillow! 'Synergized cross-functional deliverables'? What does that even mean? It means you did absolutely nothing and tried to write a novel about it! \n\nThis entire experience section is an embarrassment. You've hopped from job to job faster than a hot potato. Shut up, rewrite this garbage, and start doing some actual work!"
      ]
    },
    startup: {
      "1": [
        "'{startupName}'? Well, it's a concept. But the pitch: '{startupDesc}' is a bit half-baked. It needs structure, it needs a real recipe. You can't just throw ingredients in a pot and call it a soup."
      ],
      "2": [
        "Are you serious? You want to pitch '{startupName}'? It's completely tasteless! '{startupDesc}' - this is a recipe for a financial kitchen nightmare! You're trying to sell water to a drowning man. Sort out your margins before you get kicked out of the market!"
      ],
      "3": [
        "LISTEN TO ME! '{startupName}' is the most ridiculous, uninspired, catastrophic idea I have ever heard in my entire life! '{startupDesc}'? You call that a pitch? It's a joke! It's so raw, a VC would get salmonella just looking at it! \n\nYou're incinerating cash faster than a wood-fire pizza oven! You have no customers, no model, and absolutely no clue! Shut it down before you go completely bankrupt!"
      ]
    },
    code: {
      "1": [
        "Well, the code works, but it's a bit messy, isn't it? You've got some odd variables here. Let's try to clean up the workspace. A good chef always keeps their station clean, and a good dev keeps their syntax tidy!"
      ],
      "2": [
        "What is this? Look at this code! It's completely greasy! It's got no structure, no comments, and it's full of bad naming practices! It's so messy I can't even tell where the logic starts and the bugs end. Redo it!"
      ],
      "3": [
        "DISGUSTING! Look at this absolute spaghetti! It's so tangled I could serve it with marinara sauce! Look at those nested loops! It's a structural hazard! \n\nWho taught you to write code like this? An amateur? There are no comments, the variables are named like random keystrokes, and it's completely unoptimized. It's not just bad, it's an insult to the CPU! Bin it and start again!"
      ]
    },
    custom: {
      "1": [
        "So we're talking about '{target}'? Alright, they've got some quirks. '{text}' - fine, but let's not be too hard on them. They just need a bit of guidance."
      ],
      "2": [
        "Unbelievable! '{target}' is a total nightmare. '{text}' - how does anyone stand this? It's completely unseasoned behavior. They need a serious reality check!"
      ],
      "3": [
        "GET OUT! '{target}' is a complete and utter joke! '{text}'? Are you kidding me? That is absolute garbage behavior! I've seen more intelligence in a piece of burnt toast! \n\nThey are an absolute embarrassment to everyone around them. Shut it down and block their number!"
      ]
    }
  },
  vc: {
    github: {
      "1": [
        "Interesting profile, {name}. {reposCount} repos indicates you're building, which is great for a pre-revenue developer. {topLang} is a solid foundation. Let's see if we can optimize your commit cadence to drive developer velocity."
      ],
      "2": [
        "Let's look at your metrics, {name}. {followers} followers? That's a low-leverage community size. Your bio says '{bio}' but your GitHub contribution graph looks like a barren desert. We need to see more hustle, more shipping, and less boilerplate."
      ],
      "3": [
        "Let's be transparent here. Your GitHub profile is a lifestyle business. {reposCount} repos of unmaintained code. You're coding in {topLang}? That is a commodity stack. Where is the web3 layer? Where is the LLM agent integration? \n\nYou have 0 stars on most of your repos. That's a total lack of product-market fit. I suggest you acqui-hire yourself into a real job because this portfolio has negative enterprise value."
      ]
    },
    resume: {
      "1": [
        "Solid credentials. However, the resume lacks a clear, high-growth narrative. Try adding some metrics around efficiency gains."
      ],
      "2": [
        "This resume has a serious narrative problem. You call yourself a 'Senior'? You've spent two years at three different companies. That's not experience, that's high churn. You need to frame your career around scaling rather than just staying alive."
      ],
      "3": [
        "Wow. This resume is a masterclass in pre-revenue buzzwords. 'Leveraged agile synergies'? Translation: you stood in a circle every morning and talked about things you didn't finish. \n\nYour skills list is longer than our LPs' list of demands. You've listed 25 technologies but you were a junior intern. You're a generalist who specializes in nothing. This CV is getting passed on faster than a bad pitch deck."
      ]
    },
    startup: {
      "1": [
        "I like the space '{startupName}' is in. However, '{startupDesc}' doesn't clearly define your moat. What's the proprietary distribution channel?"
      ],
      "2": [
        "The problem statement for '{startupName}' is weak. '{startupDesc}' reads like a solution looking for a problem. Your CAC (customer acquisition cost) is going to be astronomical. Have you thought about a B2B pivot?"
      ],
      "3": [
        "Let's talk unit economics: they are absolutely toxic. '{startupName}' has zero moat, zero network effects, and a target addressable market of about 15 people. \n\nYour pitch '{startupDesc}' is a collection of buzzwords wrapped in a fever dream. You're burning cash on Google Ads just to get bots to click your landing page. This is a lifestyle project masquerading as a unicorn. I'm passing on this, and so is everyone else on Sand Hill Road."
      ]
    },
    code: {
      "1": [
        "The syntax is functional, but from a system design perspective, it's not very scalable. Think about decoupling your logic."
      ],
      "2": [
        "This snippet has major technical debt. It's single-threaded, synchronous, and reads like legacy architecture. If this went to production under high load, it would crumble faster than a seed-stage startup."
      ],
      "3": [
        "This code is a liability. You've written custom logic for something that could be solved with a simple 3rd party SaaS integration. You're building a database from scratch when you should be building a product. \n\nIt's bloated, impossible to maintain, and has zero developer velocity. If we did technical due diligence on this, we'd pull our term sheet immediately. Rewrite this before you sink the whole company."
      ]
    },
    custom: {
      "1": [
        "Regarding '{target}': the market sentiment is neutral. '{text}' is a minor friction point, but manageable."
      ],
      "2": [
        "'{target}' has a serious brand positioning problem. '{text}' is a highly inefficient use of social capital. They need a pivot."
      ],
      "3": [
        "Let's dissect '{target}'. Their current valuation is zero. '{text}' is a massive red flag. It's a completely un-scalable life strategy. \n\nThey have negative equity in their relationships and high overhead. I'd recommend a complete restructuring or liquidating the asset immediately."
      ]
    }
  },
  reviewer: {
    github: {
      "1": [
        "LGTM with minor nits. {reposCount} repos, but the naming conventions in your commits ('fix', 'fix2', 'please work') are a bit unprofessional, {name}."
      ],
      "2": [
        "PR Rejected. {name}, your bio says '{bio}' but your repos are mostly forks with zero commits from you. You code in {topLang} but your style guides are nonexistent. Please squash your commits and write actual descriptions."
      ],
      "3": [
        "REJECTED. I don't even know where to start. {reposCount} repositories of pure spaghetti. Your commit history looks like a crime scene—mostly on weekends, probably under the influence of energy drinks. \n\nYou code in {topLang} but you don't use a linter. Your bio is '{bio}', which is highly optimistic given your total lack of design patterns. Please delete your account, read 'Clean Code', and never open a PR in my team again."
      ]
    },
    resume: {
      "1": [
        "Formatting nits: font size is inconsistent, and please change 'proficient in' to 'familiar with' for most of these skills."
      ],
      "2": [
        "I'm seeing a lot of claims here but zero pull requests to back them up. You claim to 'architect systems' but your job description says you were writing CSS media queries. Please align your resume with reality."
      ],
      "3": [
        "This resume has a cyclomatic complexity of 100. It is completely unreadable. You have listed 'Docker' and 'Kubernetes' because you watched a 5-minute YouTube tutorial once. \n\nYou've changed jobs every 9 months, which indicates your teams realize your code is unmaintainable right around the time you finish onboarding. Please refactor your entire career path."
      ]
    },
    startup: {
      "1": [
        "The requirements document for '{startupName}' is incomplete. The description '{startupDesc}' lacks architectural diagrams."
      ],
      "2": [
        "'{startupName}' is built on a pile of assumptions. '{startupDesc}' has multiple single points of failure. Your technical stack is over-engineered for a simple CRUD app."
      ],
      "3": [
        "PR Rejected for '{startupName}'. Your pitch '{startupDesc}' is a textbook example of a system smell. You are building an entire platform when a simple Google Form would suffice. \n\nYour tech stack is a bloated mess of microservices that will take 6 months to deploy and 6 minutes to crash. This idea has a major memory leak and will deplete your bank accounts before you write a single unit test."
      ]
    },
    code: {
      "1": [
        "Nit: Please add comments and use camelCase. Also, why are you using let instead of const here?"
      ],
      "2": [
        "This code smells. You have hardcoded values, nested loops with O(N^2) complexity, and zero error handling. Did you even run this locally before sending it to me?"
      ],
      "3": [
        "CRITICAL ERROR. This code is a security hazard and an aesthetic tragedy. You're using global variables, variable shadowing, and a structure that looks like a staircase of bad choices. \n\nThere are no tests. There are no docs. I've seen malware with better code quality. I am not reviewing this further. Rejecting and closing this branch. Go back to boot camp."
      ]
    },
    custom: {
      "1": [
        "Reviewing '{target}': Minor style issues in their behavior. '{text}' could be optimized."
      ],
      "2": [
        "'{target}' is violating our behavioral guidelines. '{text}' is a major code smell in their personality. Please open a ticket."
      ],
      "3": [
        "BLOCKING ISSUES DETECTED. '{target}' is a walking deprecation warning. '{text}' is completely unacceptable behavior. \n\nThey have zero unit tests for their personality. I am blacklisting this user from our socials. PR closed. Thread locked."
      ]
    }
  },
  shakespeare: {
    github: {
      "1": [
        "Hark! {name}, thy virtual scrolls numbered at {reposCount} show promise. Though thy code is writ in {topLang}, thou must seek greater wisdom to win the stars of thy peers."
      ],
      "2": [
        "Fie upon thee, {name}! Thy bio claims '{bio}', yet thy commit graph is as barren as winter's frost. {followers} followers? Truly, thou art a lonely traveler in the digital kingdom."
      ],
      "3": [
        "Thou lily-livered, clay-brained coder! Thy GitHub scrolls are a plague upon the kingdom! {reposCount} repositories of pure mud and folly! Thou writes in {topLang}? A tongue fit only for swine! \n\nThy bio '{bio}' is a tragic comedy. {followers} followers? Not even the stray dogs of GitHub would walk in thy shadow! Return to thy chamber and weep upon thy keyboard!"
      ]
    },
    resume: {
      "1": [
        "Thy chronicle of deeds is fair, yet thy words are soft. Be more bold in thy proclamations, gentle scribe."
      ],
      "2": [
        "Thou hast filled thy parchment with empty boasts! 'Synergistic leader'? Thou art but a noisy vessel, sounding thy horn while others till the soil. Amend thy scrolls!"
      ],
      "3": [
        "Out, damn'd resume! Thou art a fabric of lies and preposterous conceits! Thou listeth twenty skills yet thy hands have wrought nothing of value. \n\nThou hast fled from master to master, leaving a trail of broken promises and uncompiled scripts. Thy career is a tale told by an idiot, full of sound and fury, signifying nothing!"
      ]
    },
    startup: {
      "1": [
        "Thy venture '{startupName}' hath a noble ring, yet thy description '{startupDesc}' is but a dream. Build thy foundation on stone, not air."
      ],
      "2": [
        "Alas! '{startupName}' is a ship of paper in a stormy sea. '{startupDesc}'—thou art selling stardust to peasants. Seek a real trade!"
      ],
      "3": [
        "By my troth, '{startupName}' is the most preposterous folly ever conceived in a tavern! '{startupDesc}'? Thou art a madman chanting spells to empty benches! \n\nThou gold-bound cash-burner! Thy venture shall sink into the abyss of debt, and thy investors shall hunt thee with pitchforks! Flee the country, knave!"
      ]
    },
    code: {
      "1": [
        "Thy lines of script are readable, yet they lack the grace of the ancient masters. Keep thy variables clean."
      ],
      "2": [
        "Thy code is like a tangled hedge! No map, no guide, and full of sharp thorns that bleed the memory. Untangle thy variables, rogue!"
      ],
      "3": [
        "Thou monstrous script-weaver! Thy code is a crime against nature and the gods of logic! It is a labyrinth of nested conditions so dark, even light cannot escape! \n\nThou hast left no comments, naming thy variables like secret codes of a thief. Thy compiler screams in agony, and my eyes do burn from looking upon this tragedy! Burn it to ashes!"
      ]
    },
    custom: {
      "1": [
        "Methinks '{target}' is a curious fellow. '{text}' is a strange habit, but we must be patient."
      ],
      "2": [
        "'{target}' is a pestilence! '{text}'—they act like a court jester who has lost his wits. Avoid them!"
      ],
      "3": [
        "Thou art a boil, a plague sore, an embossed carbuncle in my side, '{target}'! '{text}'? Thou art a blockhead, a knave, a double-distilled rogue! \n\nThy presence is a blight upon the land and thy company is a punishment worse than death! Away with thee, thou rank, runyon!"
      ]
    }
  },
  genz: {
    github: {
      "1": [
        "ok {name} i guess {reposCount} repos is cute. you coding in {topLang} is very default NPC behavior though. but go off i guess"
      ],
      "2": [
        "not {name} having '{bio}' in the bio but actually shipping nothing 💀 {followers} followers is giving major ghost town vibes. pick a struggle"
      ],
      "3": [
        "bruh who let {name} cook on github 💀 {reposCount} repos of absolute nothing. coding in {topLang}? it's giving 2012 tutorial vibes. \n\nyour bio says '{bio}'... yeah ok sure. {followers} followers? literally caught in 4k being irrelevant. side eye. massive side eye. 💀"
      ]
    },
    resume: {
      "1": [
        "this resume is ok i guess. very corporate. very standard. please remove the words 'dynamic' it's giving boomer."
      ],
      "2": [
        "not you writing a whole essay for an entry level job 💀 'responsible for database scaling' we know you just clicked a button in aws bruh. be for real."
      ],
      "3": [
        "this resume is giving major unpaid internship application. 'highly motivated self-starter'? bruh, it's giving desperation. \n\nyou listed 40 skills and you've been working for 6 months. the math isn't mathing. you're trying so hard and it's just cringe. delete this and start selling handmade jewelry on etsy 💀"
      ]
    },
    startup: {
      "1": [
        "'{startupName}' is a name. '{startupDesc}' is very pitch deck. hope it works out or whatever."
      ],
      "2": [
        "so '{startupName}' is basically just another wrapper for an API? '{startupDesc}'... yeah that's been done like 500 times. it's giving pre-seed bankruptcy."
      ],
      "3": [
        "bruh '{startupName}' is the most unserious thing i've seen today. '{startupDesc}'? who is paying for this? literally nobody. \n\nyou're trying to build a unicorn but you're giving donkey energy. this startup is going to fold faster than my laundry (which is still in the dryer). RIP your savings 💀"
      ]
    },
    code: {
      "1": [
        "this code is... fine. very basic. why is it formatted like this though? it's giving my first code project."
      ],
      "2": [
        "not the spaghetti code 💀 O(N^2) complexity in 2026 is crazy. my phone's battery drained just looking at this snippet. optimize this, it's not looking good bruh."
      ],
      "3": [
        "bruh this code is a whole jump scare 💀 no comments, variables named 'x', 'temp', 'stuff'... it's giving chatgpt output from a prompt written by a toddler. \n\nwhere is the error handling? are we just hoping and praying it works? it's giving absolute chaos. throw the whole codebase away 💀"
      ]
    },
    custom: {
      "1": [
        "concerning '{target}': '{text}' is a bit weird but ok."
      ],
      "2": [
        "'{target}' is acting brand new. '{text}' is not the flex they think it is. cringe."
      ],
      "3": [
        "bruh '{target}' is literally the definition of cringe 💀 '{text}'? are we serious right now? they need to delete their account. \n\nthey are doing side quests in real life and failing them. absolute clown behavior. log off 💀"
      ]
    }
  }
};

function generateLocalHeuristicRoast(category, data, severity, persona) {
  const templates = LOCAL_ROAST_TEMPLATES[persona]?.[category]?.[severity];
  if (!templates || templates.length === 0) {
    return {
      roast: "Your input is so boring that my roasting engine shut itself down to prevent overheating. Try harder.",
      score: 50,
      cringe: 50,
      buzzword: 50,
      flags: 50
    };
  }

  // Pick a random template
  const index = Math.floor(Math.random() * templates.length);
  let text = templates[index];

  // Perform replacements
  let nameSeed = 10;
  if (category === 'github') {
    const repos = data.reposCount ?? 0;
    const followers = data.followers ?? 0;
    const bio = data.bio || '';
    nameSeed = (data.name || data.username || '').length + repos;
    
    text = text
      .replace(/{name}/g, data.name || data.username || 'Mysterious Developer')
      .replace(/{username}/g, data.username || 'anonymous')
      .replace(/{reposCount}/g, repos)
      .replace(/{followers}/g, followers)
      .replace(/{following}/g, data.following ?? 0)
      .replace(/{bio}/g, bio)
      .replace(/{topLang}/g, data.languages && data.languages.length > 0 ? data.languages[0] : 'HTML');
  } else if (category === 'resume') {
    nameSeed = (data.resumeText || '').length;
    text = text.replace(/{resumeText}/g, data.resumeText || 'empty paper');
  } else if (category === 'startup') {
    nameSeed = (data.startupName || '').length + (data.startupDesc || '').length;
    text = text
      .replace(/{startupName}/g, data.startupName || 'No-Name SaaS')
      .replace(/{startupDesc}/g, data.startupDesc || 'Doing stuff in the cloud');
  } else if (category === 'code') {
    nameSeed = (data.codeText || '').length;
    const varMatches = data.codeText.match(/(?:let|const|var)\s+([a-zA-Z0-9_$]+)/);
    const varName = varMatches ? varMatches[1] : 'x';
    text = text
      .replace(/{codeText}/g, data.codeText || 'no code')
      .replace(/{var}/g, varName);
  } else if (category === 'custom') {
    nameSeed = (data.target || '').length + (data.text || '').length;
    text = text
      .replace(/{target}/g, data.target || 'The Unknown Victim')
      .replace(/{text}/g, data.text || 'Existing in the background');
  }

  // Calculate scores deterministically based on nameSeed
  const score = (nameSeed * 7) % 35 + 60;
  const cringe = (nameSeed * 13) % 40 + 55;
  const buzzword = (nameSeed * 3) % 45 + 50;
  const flags = (nameSeed * 9) % 30 + 65;

  return {
    roast: text,
    score,
    cringe,
    buzzword,
    flags
  };
}

function generateLocalHeuristicBattle(data, severity, persona) {
  const t1 = data.target1 || 'Target A';
  const t2 = data.target2 || 'Target B';
  
  // Choose winner deterministically based on characters hash code
  const hash1 = Array.from(t1).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hash2 = Array.from(t2).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const winner = hash1 % 2 === 0 ? t1 : t2;
  const loser = winner === t1 ? t2 : t1;

  const battleRoasts = {
    gordon: {
      roast1: `Look at ${t1}! Their setup is completely RAW! It's so raw it's practically still breathing! I've seen better structured projects in a rubbish bin. Absolute kitchen nightmare!`,
      roast2: `And ${t2}, don't you smile! Your work is completely bland, uninspired, and has absolutely no seasoning. I wouldn't trust you to wash the dishes. Get out of the kitchen!`,
      verdict: `A brutal match. ${winner} survived because ${loser}'s performance was an absolute embarrassment to the culinary arts.`
    },
    vc: {
      roast1: `${t1} is running a lifestyle project with zero moat, zero network effects, and toxic unit economics. They're burning cash on Google Ads just to get bots to click their landing page.`,
      roast2: `${t2} has a target addressable market of about 15 people. They are building an entire platform when a simple Google Form would suffice. Pivot immediately!`,
      verdict: `We decided to pass on both, but ${winner} has slightly better retention metrics than the disaster of ${loser}. Term sheet offered at a seed-level valuation.`
    },
    reviewer: {
      roast1: `${t1} has written a staircase of bad naming choices, global variables, and nested loops with O(N^2) complexity. Cyclomatic complexity is reaching critical meltdown!`,
      roast2: `${t2}'s commit history looks like a crime scene. Mostly on weekends, probably under the influence of energy drinks. Squash your commits!`,
      verdict: `${winner} won this duel because ${loser}'s code contains global variables and variable shadowing. Closed branch. Go back to boot camp.`
    },
    shakespeare: {
      roast1: `Hark! ${t1} is a lily-livered knave whose scrolls of code are a plague upon the kingdom. Return to thy chamber and weep!`,
      roast2: `And thou, ${t2}! A clay-brained rogue fit only for swine. Thy bio is a tragic comedy. Away with thee!`,
      verdict: `By my troth, the battle is decided! ${winner} did bear the insults with more noble grace than the cowardly ${loser}.`
    },
    genz: {
      roast1: `bruh, who let ${t1} cook? literally NPC energy, caught in 4k side eyes. its giving major unpaid intern vibes 💀`,
      roast2: `not ${t2} trying so hard but failing side quests in real life. the math isn't mathing. pick a struggle or delete your account 💀`,
      verdict: `no cap, ${winner} won this battle. ${loser} was caught being absolute clown behavior 💀`
    }
  };

  const pTemplates = battleRoasts[persona] || battleRoasts['gordon'];

  const score1 = (hash1 % 30) + 60;
  const score2 = (hash2 % 30) + 60;

  return {
    roast1: pTemplates.roast1,
    roast2: pTemplates.roast2,
    winner: winner,
    verdict: pTemplates.verdict,
    score1: score1,
    score2: score2
  };
}

// 3. Backend Proxy API Fallback Handler
async function generateBackendAiRoast(category, data, severity, persona) {
  const url = "/api/roast";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ category, data, severity, persona })
  });

  if (!response.ok) {
    let errorText = "";
    try {
      const errJson = await response.json();
      errorText = errJson.error || errJson.message;
    } catch {
      errorText = await response.text();
    }
    throw new Error(errorText || `Backend server returned HTTP status: ${response.status}`);
  }

  return await response.json();
}

// 4. Exposed main function
export async function generateRoast({ category, data, severity, persona, aiMode, apiKey }) {
  if (aiMode) {
    if (apiKey) {
      return await generateAiRoast(apiKey, category, data, severity, persona);
    } else {
      return await generateBackendAiRoast(category, data, severity, persona);
    }
  } else {
    // Return local heuristic roast
    // Simulate a tiny delay for heuristic roast so it feels like it's "grilling"
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (category === 'battle') {
      return generateLocalHeuristicBattle(data, severity, persona);
    } else {
      return generateLocalHeuristicRoast(category, data, severity, persona);
    }
  }
}

export default generateRoast;
