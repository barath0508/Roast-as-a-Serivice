// Roast Generation Engine - Dual Mode: Gemini AI API & High-Fidelity Heuristics Engine

// 1. AI API Mode Handler
async function generateAiRoast(apiKey, category, data, severity, persona) {
  const modelName = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${systemInstruction}\n\nSubject to roast:\n${subjectDesc}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const resData = await response.json();
    const roastText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!roastText) {
      throw new Error('Could not parse response from Gemini API.');
    }
    return roastText.trim();
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
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
    return "Your input is so boring that my roasting engine shut itself down to prevent overheating. Try harder.";
  }

  // Pick a random template from the available choices
  const index = Math.floor(Math.random() * templates.length);
  let text = templates[index];

  // Perform replacements based on category data
  if (category === 'github') {
    text = text
      .replace(/{name}/g, data.name || data.username || 'Mysterious Developer')
      .replace(/{username}/g, data.username || 'anonymous')
      .replace(/{reposCount}/g, data.reposCount ?? 0)
      .replace(/{followers}/g, data.followers ?? 0)
      .replace(/{following}/g, data.following ?? 0)
      .replace(/{bio}/g, data.bio || 'no bio provided')
      .replace(/{topLang}/g, data.languages && data.languages.length > 0 ? data.languages[0] : 'HTML');
  } else if (category === 'resume') {
    text = text
      .replace(/{resumeText}/g, data.resumeText || 'empty paper');
  } else if (category === 'startup') {
    text = text
      .replace(/{startupName}/g, data.startupName || 'No-Name SaaS')
      .replace(/{startupDesc}/g, data.startupDesc || 'Doing stuff in the cloud');
  } else if (category === 'code') {
    // Basic analysis on variables if any are found
    const varMatches = data.codeText.match(/(?:let|const|var)\s+([a-zA-Z0-9_$]+)/);
    const varName = varMatches ? varMatches[1] : 'x';
    text = text
      .replace(/{codeText}/g, data.codeText || 'no code')
      .replace(/{var}/g, varName);
  } else if (category === 'custom') {
    text = text
      .replace(/{target}/g, data.target || 'The Unknown Victim')
      .replace(/{text}/g, data.text || 'Existing in the background');
  }

  return text;
}

// 3. Exposed main function
export async function generateRoast({ category, data, severity, persona, aiMode, apiKey }) {
  if (aiMode && apiKey) {
    return await generateAiRoast(apiKey, category, data, severity, persona);
  } else {
    // Return local heuristic roast
    // Simulate a tiny delay for heuristic roast so it feels like it's "grilling"
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateLocalHeuristicRoast(category, data, severity, persona);
  }
}

export default generateRoast;
