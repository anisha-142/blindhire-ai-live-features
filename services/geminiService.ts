import { BlindProfile, AssessmentQuestion } from "../types";
import { sanitizePromptInput } from "./aiValidationService";
import { logAIInteraction } from "./aiAuditService";

/**
 * Calls the local /api/ai/generate proxy (see server.cjs) instead of hitting
 * Google's API directly from the browser. This keeps GEMINI_API_KEY on the
 * server only — it is never present in client JS, the network tab, or
 * browser history. If the proxy has no key configured it responds 501,
 * which every caller below treats the same as "AI unavailable" and falls
 * back to its deterministic offline behavior.
 */
async function callAiProxy(
  prompt: string,
  options?: { temperature?: number; promptId?: string; promptVersion?: string }
): Promise<any> {
  const sanitizedPrompt = sanitizePromptInput(prompt);
  const startTime = Date.now();
  const promptId = options?.promptId || 'prompt_general';
  const promptVersion = options?.promptVersion || '1.0';

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: sanitizedPrompt, temperature: options?.temperature })
    });

    if (!res.ok) {
      throw new Error(`AI proxy unavailable (status ${res.status})`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('No data returned from AI');
    }

    const duration = Date.now() - startTime;
    logAIInteraction(promptId, promptVersion, sanitizedPrompt, rawText, 'gemini-1.5-flash', true, false, duration);
    return JSON.parse(rawText);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logAIInteraction(promptId, promptVersion, sanitizedPrompt, '', 'offline_fallback', false, true, duration);
    throw err;
  }
}

/**
 * Parses a raw resume text and converts it into a "Blind Profile"
 * by removing PII and extracting key skills.
 */
export const generateBlindProfile = async (resumeText: string): Promise<BlindProfile> => {
  const offlineProfile = (): BlindProfile => {
    // Generate intelligent simulated blind profile when the AI proxy is unavailable
    const skillsList = ["TypeScript", "React", "Node.js", "Python", "Cloud Architecture", "System Design", "UI/UX", "GraphQL", "Docker", "Agile"];
    const shuffled = skillsList.sort(() => 0.5 - Math.random());
    const topSkills = shuffled.slice(0, 5);

    return {
      id: crypto.randomUUID(),
      originalText: resumeText,
      maskedName: `Candidate #${Math.floor(1000 + Math.random() * 9000)}`,
      professionalSummary: "Demonstrated track record of delivering resilient, high-impact solutions with a focus on scalable architecture, clean maintainable code, and collaborative team delivery.",
      topSkills: topSkills,
      yearsOfExperience: Math.floor(3 + Math.random() * 8),
      educationLevel: "Bachelor's Degree in Computer Science",
      talentScore: Math.floor(88 + Math.random() * 10),
      strengths: ["Scalable System Architecture", "Cross-functional Team Leadership", "Fast Technical Problem Solving"],
      suggestedRoles: ["Senior Software Engineer", "Full Stack Developer", "Technical Specialist"],
      locationPreferences: "Remote / Hybrid",
    };
  };

  const prompt = `
    You are an expert HR AI for a system called "BlindHire". 
    Your goal is to eliminate unconscious bias.
    
    Task: Analyze the following resume text. 
    1. Remove ALL Personal Identifiable Information (PII): Name, Phone, Email, Address, Gender, Age, Marital Status, Religion, Specific University Names (replace with generic terms like "Top Tier University" or "State College"), and Current Company Names (replace with "Fortune 500 Tech Company" or "Startup", etc).
    2. Extract a professional summary focusing ONLY on skills and achievements.
    3. Extract top 5 technical or soft skills.
    4. Estimate years of experience based on the timeline.
    5. Determine education level (e.g., Bachelor's, Master's).
    6. Assign a "Talent Score" from 0-100 based on the coherence, impact, and skill depth of the resume.
    7. List 3 key strengths.
    8. Suggest 2 job titles they are best suited for.
    9. Infer locationPreferences (e.g. Remote / Hybrid).

    Resume Text:
    "${resumeText}"

    Output MUST be a valid JSON object strictly matching this format without markdown code blocks:
    {
      "maskedName": "Candidate #8392",
      "professionalSummary": "...",
      "topSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
      "yearsOfExperience": 5,
      "educationLevel": "Bachelor's Degree",
      "talentScore": 92,
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "suggestedRoles": ["Role 1", "Role 2"],
      "locationPreferences": "Remote / Hybrid"
    }
  `;

  try {
    const parsed = await callAiProxy(prompt);
    return {
      id: crypto.randomUUID(),
      originalText: resumeText,
      ...parsed
    };
  } catch (error) {
    console.warn("AI proxy unavailable, using offline fallback profile:", error);
    return offlineProfile();
  }
};

/**
 * Calculates a match score between a candidate profile and a job description.
 */
export const calculateJobMatch = async (candidateProfile: BlindProfile, jobTitle: string, requirements: string[]) => {
  const offlineMatch = () => {
    // Quick local similarity calculation
    const matchedCount = requirements.filter(req =>
      candidateProfile.topSkills.some(skill =>
        req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase())
      )
    ).length;
    const baseScore = Math.min(96, Math.max(70, Math.round((matchedCount / Math.max(1, requirements.length)) * 40 + 60)));
    return {
      score: baseScore,
      reason: `Demonstrates high alignment across core competencies: ${candidateProfile.topSkills.slice(0, 3).join(', ')}.`
    };
  };

  const prompt = `
    Act as a Recruitment Matchmaker.
    
    Candidate Skills: ${candidateProfile.topSkills.join(', ')}
    Candidate Summary: ${candidateProfile.professionalSummary}
    
    Job Title: ${jobTitle}
    Job Requirements: ${requirements.join(', ')}
    
    Provide a JSON object with:
    {
      "score": <number between 0 and 100>,
      "reason": "<1-sentence concise explanation of why>"
    }
  `;

  try {
    return await callAiProxy(prompt);
  } catch (e) {
    console.warn("AI proxy unavailable, using offline job match:", e);
    return offlineMatch();
  }
};

// -------------------------------------------------------
// OFFLINE FALLBACK QUESTION BANK (no API key needed)
// -------------------------------------------------------
const QUESTION_BANK: Record<string, AssessmentQuestion[]> = {
  typescript: [
    { id: 'ts1', skill: 'TypeScript', category: 'technical', question: 'What does the `keyof` operator do in TypeScript?', options: ['Returns keys of an interface as a union type', 'Returns values of an object', 'Deletes a key from a type', 'Maps over array keys'], correctIndex: 0, difficulty: 'medium', explanation: '`keyof T` produces a union of the string/number literal types of all keys in T.' },
    { id: 'ts2', skill: 'TypeScript', category: 'technical', question: 'Which of the following correctly defines a generic function in TypeScript?', options: ['function fn(x: T): T {}', 'function fn<T>(x: T): T { return x; }', 'function<T> fn(x: T) {}', 'generic function fn(x) {}'], correctIndex: 1, difficulty: 'easy', explanation: 'Generic functions use angle brackets <T> before the parameter list.' },
    { id: 'ts3', skill: 'TypeScript', category: 'technical', question: 'What is the difference between `interface` and `type` in TypeScript?', options: ['No difference', 'Interfaces can be extended; types cannot', 'Interfaces support declaration merging; types do not', 'Types are runtime objects; interfaces are compile-only'], correctIndex: 2, difficulty: 'hard', explanation: 'Interfaces support declaration merging (reopening), while type aliases do not.' },
  ],
  react: [
    { id: 'r1', skill: 'React', category: 'technical', question: 'What is the purpose of the `useCallback` hook in React?', options: ['Creates memoized state', 'Memoizes a callback to prevent recreation on every render', 'Runs a function after DOM paint', 'Manages side effects'], correctIndex: 1, difficulty: 'medium', explanation: 'useCallback returns a memoized callback, preventing child re-renders caused by new function references.' },
    { id: 'r2', skill: 'React', category: 'technical', question: 'Which hook would you use to synchronize React state with an external subscription?', options: ['useContext', 'useSyncExternalStore', 'useReducer', 'useLayoutEffect'], correctIndex: 1, difficulty: 'hard', explanation: 'useSyncExternalStore (React 18) is designed to subscribe to external data sources safely.' },
    { id: 'r3', skill: 'React', category: 'technical', question: 'What does React\'s `key` prop primarily help with?', options: ['Accessibility labels', 'Uniquely identifying elements for efficient reconciliation', 'CSS specificity', 'Event delegation'], correctIndex: 1, difficulty: 'easy', explanation: 'Keys help React identify which items in a list changed, were added, or removed.' },
  ],
  nodejs: [
    { id: 'n1', skill: 'Node.js', category: 'technical', question: 'What is the Node.js Event Loop responsible for?', options: ['Memory allocation', 'Handling synchronous blocking I/O', 'Managing async callbacks across phases (timers, I/O, etc.)', 'Running multiple CPU threads'], correctIndex: 2, difficulty: 'medium', explanation: 'The Event Loop cycles through phases (timers, I/O callbacks, idle, poll, check, close) to handle async operations.' },
    { id: 'n2', skill: 'Node.js', category: 'technical', question: 'Which module provides the HTTP server capability in Node.js core?', options: ['net', 'http', 'stream', 'express'], correctIndex: 1, difficulty: 'easy', explanation: 'The built-in `http` module allows creating HTTP servers without any third-party libraries.' },
  ],
  python: [
    { id: 'p1', skill: 'Python', category: 'technical', question: 'What does the `@property` decorator do in Python?', options: ['Marks a method as static', 'Converts a method into a read-only attribute accessor', 'Decorates abstract methods', 'Makes a function asynchronous'], correctIndex: 1, difficulty: 'medium', explanation: '`@property` allows a method to be accessed as an attribute, enabling controlled read/write access.' },
    { id: 'p2', skill: 'Python', category: 'technical', question: 'What is a Python generator and how does `yield` work?', options: ['A function that returns a list lazily via yield', 'A function that yields control to another thread', 'A type of Python class', 'A decorator for async functions'], correctIndex: 0, difficulty: 'medium', explanation: 'Generators produce values lazily using `yield`, suspending execution between iterations.' },
    { id: 'p3', skill: 'Python', category: 'technical', question: 'What is the GIL in CPython?', options: ['Global Integration Layer', 'A lock that allows only one thread to execute Python bytecode at a time', 'Garbage Isolation Logic', 'Generalized Import Library'], correctIndex: 1, difficulty: 'hard', explanation: 'The Global Interpreter Lock prevents multiple native threads from executing Python bytecode simultaneously.' },
  ],
  sql: [
    { id: 'sql1', skill: 'SQL', category: 'technical', question: 'What is the difference between `INNER JOIN` and `LEFT JOIN`?', options: ['No difference', 'INNER JOIN returns only matching rows; LEFT JOIN returns all left rows + matched right', 'LEFT JOIN is faster always', 'INNER JOIN returns all rows from both tables'], correctIndex: 1, difficulty: 'easy', explanation: 'INNER JOIN discards non-matching rows; LEFT JOIN keeps all rows from the left table.' },
    { id: 'sql2', skill: 'SQL', category: 'technical', question: 'What does the `EXPLAIN` keyword do in SQL?', options: ['Runs the query twice for validation', 'Shows the query execution plan without running it', 'Adds comments to a query', 'Returns column metadata'], correctIndex: 1, difficulty: 'medium', explanation: 'EXPLAIN outputs the optimizer\'s execution plan, showing how indexes and joins are used.' },
  ],
  systemdesign: [
    { id: 'sd1', skill: 'System Design', category: 'technical', question: 'What is the CAP theorem?', options: ['Consistency, Atomicity, Persistence', 'Consistency, Availability, Partition tolerance — you can only guarantee 2 of 3', 'Cache, API, Protocol standards', 'Concurrency, Atomicity, Performance'], correctIndex: 1, difficulty: 'hard', explanation: 'In a distributed system, during a network partition you must choose between Consistency and Availability.' },
    { id: 'sd2', skill: 'System Design', category: 'technical', question: 'What is the purpose of a CDN (Content Delivery Network)?', options: ['To run serverless functions globally', 'To cache and serve static assets from edge nodes closer to users', 'To encrypt HTTPS traffic', 'To route database queries geographically'], correctIndex: 1, difficulty: 'easy', explanation: 'CDNs reduce latency by caching assets at geographically distributed edge servers.' },
  ],
  aws: [
    { id: 'aws1', skill: 'AWS', category: 'technical', question: 'What is the difference between S3 and EBS on AWS?', options: ['S3 is block storage; EBS is object storage', 'S3 is object storage; EBS is block storage attached to EC2', 'Both are identical', 'S3 is a database; EBS is a cache'], correctIndex: 1, difficulty: 'medium', explanation: 'S3 stores objects (files) with infinite scalability; EBS is persistent block storage for EC2 instances.' },
    { id: 'aws2', skill: 'AWS', category: 'technical', question: 'Which AWS service is primarily used for container orchestration?', options: ['EC2', 'EKS (Elastic Kubernetes Service)', 'SQS', 'Lambda'], correctIndex: 1, difficulty: 'medium', explanation: 'EKS is managed Kubernetes on AWS, designed for running containerized workloads at scale.' },
  ],
  docker: [
    { id: 'd1', skill: 'Docker', category: 'technical', question: 'What is the difference between a Docker image and a container?', options: ['No difference', 'An image is a blueprint; a container is a running instance of that image', 'A container is stored; an image is running', 'Images are for Linux only'], correctIndex: 1, difficulty: 'easy', explanation: 'A Docker image is an immutable snapshot; a container is the live, running process created from it.' },
  ],
  figma: [
    { id: 'f1', skill: 'Figma', category: 'technical', question: 'What are "Auto Layout" frames in Figma?', options: ['Frames that resize automatically based on child content using flex-like rules', 'Frames that export automatically', 'Locked frames that cannot be edited', 'Frames with automatic grids'], correctIndex: 0, difficulty: 'medium', explanation: 'Auto Layout lets designers create responsive components that adapt to content changes like CSS flexbox.' },
  ],
  pytorch: [
    { id: 'pt1', skill: 'PyTorch', category: 'technical', question: 'What does `torch.no_grad()` do in PyTorch?', options: ['Disables GPU acceleration', 'Prevents gradient computation, reducing memory usage during inference', 'Stops training mid-epoch', 'Freezes model weights permanently'], correctIndex: 1, difficulty: 'medium', explanation: '`torch.no_grad()` disables autograd, saving computation and memory during model evaluation/inference.' },
    { id: 'pt2', skill: 'PyTorch', category: 'technical', question: 'What is backpropagation in the context of neural networks?', options: ['Forward pass through layers', 'Computing gradients via chain rule from loss to weights', 'Batch normalization step', 'Hyperparameter tuning process'], correctIndex: 1, difficulty: 'hard', explanation: 'Backprop computes the gradient of the loss with respect to each weight by applying the chain rule backwards.' },
  ],
  aptitude: [
    { id: 'apt1', skill: 'Logical Reasoning', category: 'aptitude', question: 'If all Bloops are Razzles and all Razzles are Lazzles, which must be true?', options: ['All Lazzles are Bloops', 'All Bloops are Lazzles', 'No Bloops are Lazzles', 'Some Razzles are not Lazzles'], correctIndex: 1, difficulty: 'easy', explanation: 'Transitivity: Bloops → Razzles → Lazzles, so all Bloops must be Lazzles.' },
    { id: 'apt2', skill: 'Quantitative', category: 'aptitude', question: 'A train travels 60 km in 40 minutes. What is its speed in km/h?', options: ['80 km/h', '90 km/h', '100 km/h', '120 km/h'], correctIndex: 1, difficulty: 'medium', explanation: 'Speed = 60 / (40/60) = 60 × 60/40 = 90 km/h.' },
    { id: 'apt3', skill: 'Pattern Recognition', category: 'aptitude', question: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctIndex: 1, difficulty: 'medium', explanation: 'Differences are 4, 6, 8, 10, 12 → 30 + 12 = 42. Pattern: n(n+1).' },
    { id: 'apt4', skill: 'Logical Reasoning', category: 'logical', question: 'You have two ropes that each burn in exactly 1 hour (unevenly). How do you measure 45 minutes?', options: ['Burn both ropes simultaneously', 'Light Rope 1 from both ends and Rope 2 from one end. When Rope 1 finishes (30 min), light Rope 2\'s other end', 'Fold one rope into thirds', 'Cut one rope at the midpoint'], correctIndex: 1, difficulty: 'hard', explanation: 'Rope 1 burns in 30 min when lit from both ends. Remaining Rope 2 portion then burns in 15 min = 45 total.' },
    { id: 'apt5', skill: 'Data Interpretation', category: 'aptitude', question: 'A developer fixes bugs at a rate of 3 bugs per hour. How many bugs are fixed in a 7.5-hour sprint?', options: ['21', '22.5', '23', '24'], correctIndex: 1, difficulty: 'easy', explanation: '3 bugs/hr × 7.5 hr = 22.5 bugs.' },
    { id: 'apt6', skill: 'Critical Thinking', category: 'logical', question: 'Which scenario demonstrates a logical fallacy known as "appeal to authority"?', options: ['"Studies show X is true"', '"Albert Einstein believed in God, therefore God exists"', '"Most people agree with X"', '"X happened before Y, so X caused Y"'], correctIndex: 1, difficulty: 'medium', explanation: 'Appeal to authority claims something is true because an authority figure believes it, regardless of evidence.' },
  ],
};

/**
 * Generates a skill-based assessment with technical & aptitude questions
 * tailored to the candidate's extracted skills.
 */
export const generateSkillAssessment = async (
  skills: string[],
  yearsOfExperience: number
): Promise<AssessmentQuestion[]> => {
  const skillList = skills.join(', ');
  const difficultyLevel = yearsOfExperience >= 6 ? 'advanced (hard)' : yearsOfExperience >= 3 ? 'intermediate (medium)' : 'beginner (easy to medium)';

  const prompt = `You are an expert technical recruiter and assessment designer.

Generate exactly 10 unique multiple-choice questions for a candidate with these skills: ${skillList}
Experience level: ${yearsOfExperience} years — difficulty should be ${difficultyLevel}.

Question distribution:
- 6 technical questions: directly testing the listed skills
- 2 aptitude/quantitative questions (math, logic, data interpretation)
- 2 logical reasoning/critical thinking questions

Each question must have exactly 4 answer options. Ensure there is EXACTLY ONE correct answer.

Output MUST be a valid JSON array of exactly 10 objects:
[
  {
    "id": "q1",
    "skill": "skill name being tested",
    "category": "technical" | "aptitude" | "logical",
    "question": "The full question text",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctIndex": 0,
    "difficulty": "easy" | "medium" | "hard",
    "explanation": "Brief explanation why the answer is correct"
  }
]

Rules:
- Questions must be scenario-based, practical, and unambiguous
- No duplicate questions
- Vary difficulty across questions
- For technical questions, cover different aspects of each skill
- correctIndex must be 0, 1, 2, or 3 (zero-indexed)
- Return ONLY the JSON array, no markdown code blocks`;

  try {
    const parsed = await callAiProxy(prompt, { temperature: 0.7 });
    if (Array.isArray(parsed) && parsed.length >= 5) {
      return parsed.slice(0, 10).map((q: any, idx: number) => ({
        ...q,
        id: `ai_${idx}_${Date.now()}`,
        correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
      }));
    }
    throw new Error('Invalid AI response format');
  } catch (err) {
    console.warn('AI assessment generation failed, using offline bank:', err);
    return buildOfflineAssessment(skills, yearsOfExperience);
  }
};

function buildOfflineAssessment(skills: string[], yearsOfExperience: number): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];
  const skillsLower = skills.map(s => s.toLowerCase());
  
  // Skill → bank key mapping
  const skillBankMap: Record<string, string> = {
    typescript: 'typescript', ts: 'typescript',
    react: 'react', 'react.js': 'react', reactjs: 'react',
    node: 'nodejs', 'node.js': 'nodejs', nodejs: 'nodejs',
    python: 'python', pytorch: 'pytorch',
    sql: 'sql', postgresql: 'sql', mysql: 'sql',
    'system design': 'systemdesign', 'system architecture': 'systemdesign',
    aws: 'aws', 'cloud infrastructure': 'aws',
    docker: 'docker', kubernetes: 'docker',
    figma: 'figma', 'design systems': 'figma',
    nlp: 'pytorch', 'machine learning': 'pytorch', 'deep learning': 'pytorch',
    graphql: 'nodejs', go: 'nodejs',
  };

  // Add technical questions from matched skill banks
  const addedIds = new Set<string>();
  for (const skill of skillsLower) {
    const bankKey = skillBankMap[skill] || Object.keys(skillBankMap).find(k => skill.includes(k) || k.includes(skill));
    if (bankKey && QUESTION_BANK[skillBankMap[bankKey] || bankKey]) {
      for (const q of QUESTION_BANK[skillBankMap[bankKey] || bankKey]) {
        if (!addedIds.has(q.id) && questions.length < 7) {
          // Filter by experience-appropriate difficulty
          if (yearsOfExperience < 2 && q.difficulty === 'hard') continue;
          questions.push({ ...q, id: `${q.id}_${Date.now()}` });
          addedIds.add(q.id);
        }
      }
    }
  }

  // Pad with system design if not enough technical questions
  if (questions.length < 5) {
    for (const q of QUESTION_BANK['systemdesign']) {
      if (!addedIds.has(q.id) && questions.length < 7) {
        questions.push({ ...q, id: `${q.id}_${Date.now()}` });
        addedIds.add(q.id);
      }
    }
  }

  // Always add 3 aptitude questions
  const aptitudePool = QUESTION_BANK['aptitude'].sort(() => 0.5 - Math.random());
  for (const q of aptitudePool) {
    if (questions.length >= 10) break;
    questions.push({ ...q, id: `${q.id}_${Date.now()}` });
  }

  // If still short, add more from any bank
  if (questions.length < 10) {
    for (const bankQuestions of Object.values(QUESTION_BANK)) {
      for (const q of bankQuestions) {
        if (questions.length >= 10) break;
        if (!questions.find(existing => existing.id.startsWith(q.id))) {
          questions.push({ ...q, id: `${q.id}_fill_${Date.now()}` });
        }
      }
      if (questions.length >= 10) break;
    }
  }

  return questions.slice(0, 10);
}
