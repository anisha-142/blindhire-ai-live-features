import {
  ResumeAnalysis,
  ResumeHealthDimension,
  RewriteSuggestion,
  ResumeProject,
  ResumeVersion,
  JobPost
} from '../types';

// ─── RESUME HEALTH ANALYSIS ───────────────────────────────────────────────────
export function analyzeResumeHealth(resumeText: string, jobPost?: JobPost): ResumeAnalysis {
  const text = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).length;

  // ATS Compatibility
  const hasEmail = /[\w.+]+@[\w.]+\.\w+/.test(resumeText);
  const hasPhone = /[\+\d][\d\s\-()]{8,}/.test(resumeText);
  const hasLinkedin = text.includes('linkedin');
  const hasGithub = text.includes('github');
  const hasSections = ['experience', 'education', 'skills', 'projects'].filter(s => text.includes(s)).length;
  const atsScore = Math.min(100, Math.round(
    (hasEmail ? 20 : 0) + (hasSections * 15) + (words > 300 ? 20 : words * 0.07) + (hasGithub || hasLinkedin ? 10 : 0)
  ));

  // Skills Clarity
  const techKeywords = ['python', 'javascript', 'typescript', 'react', 'node', 'sql', 'java', 'go', 'rust', 'aws', 'docker', 'kubernetes', 'ml', 'ai', 'pytorch', 'tensorflow', 'pandas', 'figma'];
  const foundSkills = techKeywords.filter(k => text.includes(k));
  const skillsScore = Math.min(100, Math.round((foundSkills.length / 8) * 100));

  // Achievement Strength (metrics / numbers)
  const hasNumbers = (resumeText.match(/\d+[%$kKmMbB]?/g) || []).length;
  const hasActionVerbs = ['led', 'built', 'designed', 'architected', 'optimized', 'reduced', 'improved', 'deployed', 'scaled', 'delivered'].filter(v => text.includes(v)).length;
  const achievementScore = Math.min(100, Math.round((Math.min(hasNumbers, 10) * 5) + (hasActionVerbs * 5)));

  // Technical Depth
  const advancedTerms = ['distributed', 'microservices', 'kubernetes', 'scalable', 'architecture', 'optimization', 'machine learning', 'deep learning', 'neural', 'latency', 'throughput', 'ci/cd', 'restful', 'graphql'];
  const advancedFound = advancedTerms.filter(t => text.includes(t)).length;
  const technicalScore = Math.min(100, Math.round((advancedFound / 6) * 100));

  // Projects
  const hasProjects = text.includes('project');
  const projectCount = (resumeText.match(/project\s*[:\-#]/gi) || []).length;
  const projectsScore = Math.min(100, Math.round(hasProjects ? 50 + projectCount * 15 : 30));

  // Experience Description
  const hasYears = /\d+\+?\s*year/i.test(resumeText);
  const hasDates = /\d{4}\s*[-–]\s*(\d{4}|present|current)/i.test(resumeText);
  const hasCompanies = words > 200;
  const expScore = Math.min(100, Math.round(
    (hasYears ? 30 : 0) + (hasDates ? 35 : 0) + (hasCompanies ? 35 : 0)
  ));

  // Formatting (proxy: length and structure)
  const formatScore = Math.min(100, Math.round(
    (words > 200 && words < 800 ? 60 : words <= 200 ? 30 : 50) +
    (hasSections * 5) + (hasEmail ? 10 : 0) + (hasDates ? 20 : 0)
  ));

  // JD Alignment
  let jdAlignmentScore = 70; // default
  if (jobPost) {
    const matchedRequired = jobPost.requiredSkills.filter(s => text.includes(s.toLowerCase())).length;
    const matchedPreferred = jobPost.preferredSkills.filter(s => text.includes(s.toLowerCase())).length;
    jdAlignmentScore = Math.min(100, Math.round(
      (matchedRequired / Math.max(1, jobPost.requiredSkills.length)) * 60 +
      (matchedPreferred / Math.max(1, jobPost.preferredSkills.length)) * 40
    ));
  }

  // Keyword Relevance
  const keywordScore = Math.min(100, Math.round((foundSkills.length * 8) + (advancedFound * 5)));

  const dimensions: ResumeHealthDimension[] = [
    {
      name: 'ATS Compatibility', score: atsScore, maxScore: 100,
      feedback: atsScore >= 70 ? 'Good ATS formatting detected' : 'Improve structure for automated screening',
      suggestions: atsScore < 70 ? ['Add contact info clearly', 'Use standard section headers', 'Avoid tables or graphics'] : []
    },
    {
      name: 'Skills Clarity', score: skillsScore, maxScore: 100,
      feedback: skillsScore >= 70 ? 'Technical skills are clearly listed' : 'Technical skills need more explicit listing',
      suggestions: skillsScore < 70 ? ['Create a dedicated "Technical Skills" section', 'List specific versions and tools', 'Group skills by category'] : []
    },
    {
      name: 'Project Quality', score: projectsScore, maxScore: 100,
      feedback: projectsScore >= 70 ? 'Projects are described well' : 'Projects need more technical depth',
      suggestions: projectsScore < 70 ? ['Add technology stack for each project', 'Include measurable outcomes', 'Describe your specific contribution'] : []
    },
    {
      name: 'Achievement Strength', score: achievementScore, maxScore: 100,
      feedback: achievementScore >= 70 ? 'Good use of metrics and action verbs' : 'Bullets lack measurable impact',
      suggestions: achievementScore < 70 ? ['Quantify results (%, $, time saved)', 'Lead bullets with strong action verbs (Led, Built, Reduced)', 'Add team size and scope context'] : []
    },
    {
      name: 'Technical Depth', score: technicalScore, maxScore: 100,
      feedback: technicalScore >= 70 ? 'Advanced technical terminology present' : 'Technical complexity could be stronger',
      suggestions: technicalScore < 70 ? ['Mention system scale (users, requests/sec)', 'Use architecture-level terminology', 'Describe technical challenges solved'] : []
    },
    {
      name: 'Experience Description', score: expScore, maxScore: 100,
      feedback: expScore >= 70 ? 'Experience timeline is clear' : 'Experience needs dates and company context',
      suggestions: expScore < 70 ? ['Add clear employment dates', 'Include company type/scale', 'Clarify your seniority level'] : []
    },
    {
      name: 'Formatting', score: formatScore, maxScore: 100,
      feedback: formatScore >= 70 ? 'Resume length and structure is appropriate' : 'Formatting needs improvement',
      suggestions: formatScore < 70 ? ['Keep to 1-2 pages', 'Use consistent date formatting', 'Ensure readable font and spacing'] : []
    },
    {
      name: 'Keyword Relevance', score: Math.min(100, keywordScore), maxScore: 100,
      feedback: keywordScore >= 70 ? 'Strong keyword density for tech roles' : 'Need more relevant technical keywords',
      suggestions: keywordScore < 70 ? ['Add specific framework versions', 'Include industry-standard terminology', 'Mirror language from target job descriptions'] : []
    },
    {
      name: 'JD Alignment', score: jdAlignmentScore, maxScore: 100,
      feedback: jdAlignmentScore >= 70 ? 'Good alignment with target role requirements' : 'Resume needs better alignment with target role',
      suggestions: jdAlignmentScore < 70 ? ['Tailor skills section to match JD keywords', 'Highlight experience most relevant to the target role', 'Add missing required skills where genuinely applicable'] : []
    },
  ];

  const healthScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  // Rewrite suggestions
  const rewriteSuggestions = generateRewriteSuggestions(resumeText, foundSkills);

  // Projects
  const projects = extractProjectsFromResume(resumeText);

  // Keyword gaps (if JD provided)
  const keywordGaps = jobPost ? generateKeywordGaps(resumeText, jobPost) : [];

  const strengths: string[] = [];
  const criticalImprovements: string[] = [];

  dimensions.forEach(d => {
    if (d.score >= 80) strengths.push(`${d.name} (${d.score}/100)`);
    if (d.score < 55) criticalImprovements.push(d.suggestions[0] || `Improve ${d.name}`);
  });

  return { healthScore, dimensions, rewriteSuggestions, projects, keywordGaps, strengths, criticalImprovements, analyzedAt: new Date().toISOString() };
}

// ─── REWRITE SUGGESTIONS ──────────────────────────────────────────────────────
function generateRewriteSuggestions(resumeText: string, skills: string[]): RewriteSuggestion[] {
  const suggestions: RewriteSuggestion[] = [];

  // Pattern-match weak bullet patterns
  const weakPatterns: Array<{
    pattern: RegExp;
    label: string;
    current: string;
    improvedFn: (match: string, skills: string[]) => string;
    why: string;
    keywords: string[];
  }> = [
    {
      pattern: /\b(made|created|worked on|did|built)\s+a?\s*(website|app|application|system|tool|project)\s+using\s+([A-Za-z ,./]+)/gi,
      label: 'Project Description',
      current: 'Generic project phrasing',
      improvedFn: (match, skls) => `Developed a production-grade ${skls[0] || 'web'} application featuring scalable architecture, RESTful API integration, and responsive UI components serving 10,000+ monthly users`,
      why: 'Leads with a strong action verb, specifies scale/impact, and names the architectural decisions — making it compelling to technical reviewers.',
      keywords: ['production-grade', 'scalable', 'RESTful', 'responsive']
    },
    {
      pattern: /\b(helped|assisted|supported|worked with)\s+(the)?\s*team/gi,
      label: 'Team Contribution',
      current: '"Helped the team with features"',
      improvedFn: () => 'Collaborated cross-functionally with a 6-engineer team to architect and deliver 3 major feature releases within sprint deadlines, reducing time-to-market by 30%',
      why: 'Replaces passive "helped" with active "collaborated", quantifies team size and deliverables, and adds measurable business impact.',
      keywords: ['collaborated', 'cross-functionally', 'sprint', 'time-to-market']
    },
    {
      pattern: /\b(improved|made\s+.*?\s+faster|optimized)\b/gi,
      label: 'Performance Achievement',
      current: '"Improved system performance"',
      improvedFn: () => 'Identified and resolved N+1 query bottleneck in PostgreSQL data layer, reducing average API response time from 1,200ms to 180ms (an 85% improvement) under peak load of 500 concurrent users',
      why: 'Quantifies before/after performance, names the specific technical fix, and provides load context to demonstrate engineering depth.',
      keywords: ['bottleneck', 'PostgreSQL', 'API response time', 'concurrent users']
    },
  ];

  for (const p of weakPatterns) {
    const match = resumeText.match(p.pattern);
    if (match && match[0]) {
      suggestions.push({
        sectionLabel: p.label,
        currentText: match[0],
        improvedText: p.improvedFn(match[0], skills),
        whyBetter: p.why,
        impactKeywords: p.keywords
      });
    }
  }

  // Always add a skills section suggestion
  if (!resumeText.toLowerCase().includes('technical skills') && !resumeText.toLowerCase().includes('core competencies')) {
    suggestions.push({
      sectionLabel: 'Skills Section',
      currentText: 'Skills are embedded in experience bullets only',
      improvedText: `TECHNICAL SKILLS\nLanguages: ${skills.slice(0, 3).join(', ') || 'Python, TypeScript, SQL'}\nFrameworks: React, Node.js, FastAPI\nCloud & Tools: AWS, Docker, GitHub Actions, PostgreSQL`,
      whyBetter: 'A dedicated, scannable skills section dramatically improves ATS keyword matching and allows recruiters to instantly verify tech stack alignment.',
      impactKeywords: ['Technical Skills', 'ATS optimized', 'scannable']
    });
  }

  // Generic summary improvement if summary is short
  if (!resumeText.toLowerCase().includes('summary') && !resumeText.toLowerCase().includes('objective')) {
    suggestions.push({
      sectionLabel: 'Professional Summary',
      currentText: 'No professional summary found',
      improvedText: `Results-driven Software Engineer with ${3 + Math.floor(Math.random() * 5)}+ years of experience building scalable ${skills[0] || 'web'} applications. Proven track record of delivering high-impact features in agile environments, with expertise in ${skills.slice(0, 3).join(', ') || 'modern web technologies'}. Passionate about clean code, performance optimization, and mentoring junior engineers.`,
      whyBetter: 'A strong summary immediately signals your seniority level and value proposition. Recruiters read it first — make it compelling and specific.',
      impactKeywords: ['Results-driven', 'scalable', 'high-impact', 'agile']
    });
  }

  return suggestions.slice(0, 5);
}

// ─── PROJECT EXTRACTOR ────────────────────────────────────────────────────────
export function extractProjectsFromResume(resumeText: string): ResumeProject[] {
  // Parse project blocks from resume text
  const projectBlocks = extractProjectBlocks(resumeText);

  if (projectBlocks.length === 0) {
    // Generate sample from skills mentioned in resume
    return generateSampleProjects(resumeText);
  }

  return projectBlocks.map((block, idx) => scoreProject(block, idx));
}

function extractProjectBlocks(text: string): string[] {
  // Look for project-like patterns
  const blocks: string[] = [];
  const lines = text.split('\n');
  let inProject = false;
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (/^(project|portfolio|personal project|side project)/i.test(line.trim())) {
      inProject = true;
    }
    if (inProject) {
      currentBlock.push(line);
      if (line.trim() === '' && currentBlock.length > 3) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
        inProject = false;
      }
    }
  }
  if (currentBlock.length > 3) blocks.push(currentBlock.join('\n'));

  return blocks.slice(0, 3);
}

function generateSampleProjects(resumeText: string): ResumeProject[] {
  const text = resumeText.toLowerCase();
  const techList = ['Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'MongoDB'].filter(t => text.includes(t.toLowerCase()));

  const sampleProjects: ResumeProject[] = [
    {
      name: techList.length > 0 ? `${techList[0]} Application` : 'Web Application',
      description: 'Full-stack application built and deployed in production environment.',
      technologies: techList.slice(0, 4),
      strengthScore: 68,
      strengthDimensions: { technicalDepth: 70, problemClarity: 65, contribution: 80, measurableOutcome: 55, innovation: 60, interviewReadiness: 65 },
      thirtySecondPitch: `I built a ${techList[0] || 'web'} application that solves a real problem. The core challenge was designing a scalable architecture that handles growing data efficiently. I led the full development cycle from system design to deployment.`,
      twoMinutePitch: `The project started when I identified a gap in how teams manage ${techList[0] || 'data'} workflows. I designed the solution architecture, selected the technology stack (${techList.slice(0,3).join(', ')}), and implemented key features including real-time processing, user authentication, and a responsive interface. The biggest technical challenge was optimizing database queries under load, which I resolved using indexing and caching strategies. The project currently handles production traffic and has measurably improved the workflow it targets.`,
      anticipatedQuestions: [
        { question: 'Why did you choose this technology stack?', suggestedAnswer: `I chose ${techList[0] || 'this stack'} for its ecosystem maturity, community support, and performance characteristics suitable for the scale I was targeting.` },
        { question: 'What was the hardest technical problem you solved?', suggestedAnswer: 'The most complex challenge was ensuring data consistency under concurrent user load, which I addressed through careful transaction design and caching.' },
        { question: 'How did you handle scaling?', suggestedAnswer: 'I designed with horizontal scaling in mind from the start — stateless API layer, caching, and database connection pooling.' },
      ]
    }
  ];

  return sampleProjects;
}

function scoreProject(block: string, idx: number): ResumeProject {
  const text = block.toLowerCase();
  const techKeywords = ['python', 'react', 'node', 'sql', 'aws', 'docker', 'typescript', 'mongodb', 'redis', 'kubernetes'];
  const techs = techKeywords.filter(t => text.includes(t)).map(t => t.charAt(0).toUpperCase() + t.slice(1));

  const hasMetrics = /\d+[%kmb]?/i.test(block);
  const hasScale = /(user|request|daily|monthly|traffic)/i.test(block);
  const hasChallenge = /(challeng|problem|solve|complex|optim)/i.test(block);

  const dims = {
    technicalDepth: Math.min(100, techs.length * 18 + 30),
    problemClarity: hasChallenge ? 75 : 50,
    contribution: 70,
    measurableOutcome: hasMetrics ? 80 : hasScale ? 65 : 45,
    innovation: techs.length >= 3 ? 70 : 50,
    interviewReadiness: hasMetrics && hasChallenge ? 80 : 55
  };

  const strengthScore = Math.round(Object.values(dims).reduce((s, v) => s + v, 0) / 6);

  return {
    name: `Project ${idx + 1}`,
    description: block.split('\n')[0] || 'Project from resume',
    technologies: techs.slice(0, 5),
    strengthScore,
    strengthDimensions: dims,
    thirtySecondPitch: `I built a ${techs[0] || 'technical'} system to solve a real-world problem. The key achievement was delivering a scalable solution that ${hasMetrics ? 'improved performance measurably' : 'addressed the core requirements effectively'}.`,
    twoMinutePitch: `The project required me to design the full solution from scratch using ${techs.join(', ') || 'modern technologies'}. The main technical challenge involved ${hasChallenge ? 'complex optimization and reliability requirements' : 'delivering reliable functionality under constraints'}. I took ownership of the architecture and implementation, resulting in a working system deployed to production.`,
    anticipatedQuestions: [
      { question: 'Walk me through your project architecture.', suggestedAnswer: 'I designed a layered architecture with separation of concerns between the data layer, business logic, and presentation layer.' },
      { question: 'What would you improve if you rebuilt it today?', suggestedAnswer: 'I would add more comprehensive monitoring and observability from day one, and implement more rigorous automated testing.' },
    ]
  };
}

// ─── KEYWORD GAP ANALYSIS ────────────────────────────────────────────────────
function generateKeywordGaps(resumeText: string, jobPost: JobPost): Array<{ keyword: string; context: string; suggestion: string }> {
  const text = resumeText.toLowerCase();
  const gaps: Array<{ keyword: string; context: string; suggestion: string }> = [];

  const allJobKeywords = [...jobPost.requiredSkills, ...jobPost.preferredSkills];
  for (const kw of allJobKeywords) {
    if (!text.includes(kw.toLowerCase())) {
      gaps.push({
        keyword: kw,
        context: `"${kw}" is listed as a ${jobPost.requiredSkills.includes(kw) ? 'required' : 'preferred'} skill for ${jobPost.title}`,
        suggestion: `If you have genuine experience with ${kw}, explicitly mention it in your skills section and reference where you used it in experience bullets. Do not add it if you have not used it.`
      });
    }
  }

  return gaps.slice(0, 6);
}

// ─── VERSION MANAGEMENT ───────────────────────────────────────────────────────
export function saveResumeVersion(
  resumeText: string,
  label: string,
  healthScore: number,
  existingVersions: ResumeVersion[],
  jdMatchScore?: number,
  targetJobId?: string,
  targetJobTitle?: string
): ResumeVersion {
  const prevVersion = existingVersions[existingVersions.length - 1];
  const skillsAdded: string[] = [];
  const keywordsAdded: string[] = [];

  if (prevVersion) {
    const prevText = prevVersion.resumeText.toLowerCase();
    const newText = resumeText.toLowerCase();
    const techKeywords = ['python', 'docker', 'kubernetes', 'aws', 'typescript', 'react', 'sql', 'graphql'];
    techKeywords.forEach(k => {
      if (!prevText.includes(k) && newText.includes(k)) {
        skillsAdded.push(k.charAt(0).toUpperCase() + k.slice(1));
        keywordsAdded.push(k);
      }
    });
  }

  return {
    id: `rv_${Date.now()}`,
    label,
    resumeText,
    healthScore,
    jdMatchScore,
    targetJobId,
    targetJobTitle,
    skillsAdded,
    keywordsAdded,
    createdAt: new Date().toISOString()
  };
}

export function compareResumeVersions(v1: ResumeVersion, v2: ResumeVersion): {
  scoreDelta: number;
  jdMatchDelta: number;
  skillsAdded: string[];
  keywordsAdded: string[];
  summary: string;
} {
  const scoreDelta = v2.healthScore - v1.healthScore;
  const jdMatchDelta = (v2.jdMatchScore ?? 0) - (v1.jdMatchScore ?? 0);

  const summary = scoreDelta > 0
    ? `${v2.label} is stronger than ${v1.label} by ${scoreDelta} health points${jdMatchDelta > 0 ? ` and ${jdMatchDelta}% better JD alignment` : ''}.`
    : scoreDelta < 0
    ? `${v1.label} scores higher than ${v2.label}. Consider reverting targeted improvements.`
    : 'Both versions score equally. Review individual dimensions for qualitative differences.';

  return { scoreDelta, jdMatchDelta, skillsAdded: v2.skillsAdded, keywordsAdded: v2.keywordsAdded, summary };
}
