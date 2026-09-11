import { AssessmentQuestion, SkillCategory, QuestionType, TestCase } from '../types';

// Pre-validated, high-quality question bank catalog
export const INITIAL_QUESTION_BANK: AssessmentQuestion[] = [
  // -------------------------------------------------------------
  // PYTHON
  // -------------------------------------------------------------
  {
    id: 'py_1',
    section: 'resume_skills',
    sectionTitle: 'Python Fundamentals & Architecture',
    skill: 'Python',
    skillCategory: 'Programming',
    topic: 'Memory Management & GIL',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'How does CPython manage memory for small integers (between -5 and 256) and string intern pools?',
    options: [
      'It creates new heap allocations for every single integer declaration',
      'It pre-allocates an array of singleton integer objects at startup and caches them in memory',
      'It stores all numbers on the CPU L1 hardware register exclusively',
      'It uses reference counts only for numbers greater than 10,000'
    ],
    correctIndices: [1],
    explanation: 'CPython maintains an array of integer objects for all integers between -5 and 256. Declaring an integer in this range reuses the singleton reference.',
    tags: ['Python', 'Memory', 'CPython']
  },
  {
    id: 'py_2',
    section: 'coding_practical',
    sectionTitle: 'Python Interactive Coding Challenge',
    skill: 'Python',
    skillCategory: 'Programming',
    topic: 'Algorithms & Dictionaries',
    type: 'code_challenge',
    difficulty: 'medium',
    question: 'Write a function `two_sum(nums, target)` that returns the 0-based indices of the two numbers such that they add up to `target`. Assume exactly one solution exists.',
    language: 'python',
    starterCode: `def two_sum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
    testCases: [
      { id: 'tc1', input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', description: 'Basic pair' },
      { id: 'tc2', input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', description: 'Non-zero start' },
      { id: 'tc3', input: '[3, 3], 6', expectedOutput: '[0, 1]', description: 'Duplicate values', isSecret: true }
    ],
    explanation: 'Using a hash map achieves O(n) time complexity and O(n) auxiliary space complexity.',
    tags: ['Python', 'Hash Map', 'Two Sum', 'Algorithm']
  },

  // -------------------------------------------------------------
  // TYPESCRIPT & JAVASCRIPT
  // -------------------------------------------------------------
  {
    id: 'ts_1',
    section: 'resume_skills',
    sectionTitle: 'TypeScript Type System',
    skill: 'TypeScript',
    skillCategory: 'Programming',
    topic: 'Conditional Types & Inference',
    type: 'single_choice',
    difficulty: 'hard',
    question: 'What does the TypeScript conditional type `type Flatten<T> = T extends Array<infer Item> ? Item : T;` evaluate to for `Flatten<string[]>`?',
    options: [
      'string[]',
      'string',
      'Array<string>',
      'never'
    ],
    correctIndices: [1],
    explanation: 'The `infer` keyword extracts the element type `Item` from the array generic, unpacking `string[]` into `string`.',
    tags: ['TypeScript', 'Generics', 'Infer']
  },
  {
    id: 'ts_2',
    section: 'coding_practical',
    sectionTitle: 'JavaScript Event Loop & Microtasks',
    skill: 'JavaScript',
    skillCategory: 'Programming',
    topic: 'Asynchronous Runtime',
    type: 'code_output',
    difficulty: 'medium',
    question: 'Predict the console output order for this async/microtask sequence:',
    codeSnippet: `console.log("Start");
queueMicrotask(() => console.log("Microtask 1"));
setTimeout(() => console.log("Timeout"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("End");`,
    options: [
      'Start -> End -> Microtask 1 -> Promise -> Timeout',
      'Start -> Microtask 1 -> Timeout -> Promise -> End',
      'Start -> End -> Timeout -> Microtask 1 -> Promise',
      'Start -> Promise -> Microtask 1 -> End -> Timeout'
    ],
    correctIndices: [0],
    explanation: 'Synchronous statements execute first (Start, End). The microtask queue (Microtask 1, Promise) is drained completely before the macrotask (setTimeout) fires.',
    tags: ['JavaScript', 'Event Loop', 'Microtasks']
  },
  {
    id: 'ts_3',
    section: 'coding_practical',
    sectionTitle: 'Interactive Coding Challenge',
    skill: 'TypeScript',
    skillCategory: 'Programming',
    topic: 'Array Manipulation',
    type: 'code_challenge',
    language: 'typescript',
    question: 'Write a function `isValidAnagram(s: string, t: string): boolean` that returns `true` if `t` is an anagram of `s`, and `false` otherwise.',
    starterCode: `function isValidAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const map: Record<string, number> = {};
  for (const char of s) map[char] = (map[char] || 0) + 1;
  for (const char of t) {
    if (!map[char]) return false;
    map[char]--;
  }
  return true;
}`,
    testCases: [
      { id: 'tc1', input: '"anagram", "nagaram"', expectedOutput: 'true', description: 'Standard anagram' },
      { id: 'tc2', input: '"rat", "car"', expectedOutput: 'false', description: 'Mismatch characters' },
      { id: 'tc3', input: '"aacc", "ccac"', expectedOutput: 'false', description: 'Count mismatch', isSecret: true }
    ],
    explanation: 'Character frequency counting runs in O(n) time with O(1) space for 26 lowercase alphabet characters.',
    tags: ['TypeScript', 'Strings', 'Anagram']
  },

  // -------------------------------------------------------------
  // REACT
  // -------------------------------------------------------------
  {
    id: 'react_1',
    section: 'resume_skills',
    sectionTitle: 'React Concurrent & Hook Architecture',
    skill: 'React',
    skillCategory: 'Web / Software Development',
    topic: 'Performance Optimization',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'What is the primary architectural difference between `useMemo` and `useCallback` in React?',
    options: [
      '`useMemo` executes asynchronously; `useCallback` executes synchronously',
      '`useMemo` memoizes the computed return value of a function; `useCallback` memoizes the function reference itself',
      '`useCallback` is for class components; `useMemo` is for functional components',
      '`useMemo` replaces Redux store mutations'
    ],
    correctIndices: [1],
    explanation: '`useMemo(() => fn(), deps)` caches a calculated value, whereas `useCallback(fn, deps)` preserves the function instance between renders.',
    tags: ['React', 'Hooks', 'useMemo', 'useCallback']
  },

  // -------------------------------------------------------------
  // SQL & DATABASE
  // -------------------------------------------------------------
  {
    id: 'sql_1',
    section: 'database_sql',
    sectionTitle: 'SQL Window Functions & Aggregation',
    skill: 'SQL',
    skillCategory: 'Database & SQL',
    topic: 'Window Functions',
    type: 'single_choice',
    difficulty: 'hard',
    question: 'Which SQL clause assigns a continuous integer rank to rows within a partition without leaving rank gaps when values tie?',
    options: [
      'RANK() OVER (...)',
      'DENSE_RANK() OVER (...)',
      'ROW_NUMBER() OVER (...)',
      'NTILE(4) OVER (...)'
    ],
    correctIndices: [1],
    explanation: '`DENSE_RANK()` does not skip rank values after ties (e.g. 1, 2, 2, 3), unlike `RANK()` which skips to 4.',
    tags: ['SQL', 'Window Functions', 'PostgreSQL']
  },

  // -------------------------------------------------------------
  // QUANTITATIVE APTITUDE
  // -------------------------------------------------------------
  {
    id: 'apt_quant_1',
    section: 'aptitude_reasoning',
    sectionTitle: 'Quantitative Aptitude — Percentages & Scalability',
    skill: 'Quantitative Aptitude',
    skillCategory: 'Quantitative Aptitude',
    topic: 'Percentages & Growth',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'A database query volume increases by 25% during Q1, and then decreases by 20% during Q2. What is the net percentage change in query volume compared to the start of the year?',
    options: [
      '+5% increase',
      '0% (unchanged)',
      '-5% decrease',
      '+2.5% increase'
    ],
    correctIndices: [1],
    explanation: 'Net multiplier = 1.25 × 0.80 = 1.00 (0% net change).',
    tags: ['Aptitude', 'Quantitative', 'Percentages']
  },
  {
    id: 'apt_quant_2',
    section: 'aptitude_reasoning',
    sectionTitle: 'Quantitative Aptitude — Time & Work',
    skill: 'Quantitative Aptitude',
    skillCategory: 'Quantitative Aptitude',
    topic: 'Time & Work',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'Worker A can complete a feature module in 6 days, while Worker B can complete it in 12 days. Working collaboratively, how many days will they take to deliver the module?',
    options: [
      '3 days',
      '4 days',
      '4.5 days',
      '5 days'
    ],
    correctIndices: [1],
    explanation: 'Combined rate = 1/6 + 1/12 = 3/12 = 1/4. Days taken = 4 days.',
    tags: ['Aptitude', 'Time & Work']
  },

  // -------------------------------------------------------------
  // LOGICAL REASONING
  // -------------------------------------------------------------
  {
    id: 'apt_logic_1',
    section: 'aptitude_reasoning',
    sectionTitle: 'Logical Reasoning — Syllogisms & Deduction',
    skill: 'Logical Reasoning',
    skillCategory: 'Logical Reasoning',
    topic: 'Deductive Logic',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'Statement 1: All distributed caches (C) are fast memories (F).\nStatement 2: No fast memory (F) is volatile-unreliable (V).\nConclusion: Which deduction must strictly be true?',
    options: [
      'Some volatile-unreliable elements are distributed caches',
      'No distributed cache (C) is volatile-unreliable (V)',
      'All volatile-unreliable elements are fast memories',
      'All fast memories are distributed caches'
    ],
    correctIndices: [1],
    explanation: 'C ⊆ F and F ∩ V = ∅, hence C ∩ V = ∅. No distributed cache is volatile-unreliable.',
    tags: ['Aptitude', 'Logical Reasoning', 'Syllogism']
  },

  // -------------------------------------------------------------
  // DATA INTERPRETATION
  // -------------------------------------------------------------
  {
    id: 'apt_di_1',
    section: 'aptitude_reasoning',
    sectionTitle: 'Data Interpretation — Performance Metrics',
    skill: 'Data Interpretation',
    skillCategory: 'Data Interpretation',
    topic: 'Growth Ratios',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'A cloud infrastructure cost table shows: Month 1: $2,000 | Month 2: $2,600 | Month 3: $3,380. If the month-over-month compound growth rate continues, what is the expected cost for Month 4?',
    options: [
      '$4,000',
      '$4,394',
      '$4,500',
      '$4,820'
    ],
    correctIndices: [1],
    explanation: 'Growth multiplier: 2,600 / 2,000 = 1.30, 3,380 / 2,600 = 1.30. Month 4 = 3,380 × 1.30 = $4,394.',
    tags: ['Aptitude', 'Data Interpretation']
  },

  // -------------------------------------------------------------
  // ROLE-SPECIFIC ARCHITECTURE
  // -------------------------------------------------------------
  {
    id: 'arch_1',
    section: 'role_scenario',
    sectionTitle: 'System Design & Scalability',
    skill: 'System Architecture',
    skillCategory: 'Web / Software Development',
    topic: 'High Availability & Caching',
    type: 'scenario_analysis',
    difficulty: 'hard',
    question: 'A global fintech application experiences sudden write lock contention on the ledger table during flash sales (100,000 transactions/sec). What architecture eliminates database write bottlenecks while maintaining strong eventual consistency?',
    options: [
      'Increase relational database connection pool size to 50,000 connections',
      'Use an append-only event-sourcing log (Kafka/Pulsar) with in-memory state aggregation (Redis) and async idempotent batch committers to the ledger',
      'Disable SSL encryption on database drivers to speed up packets',
      'Execute all transactions in single-threaded SQLite files'
    ],
    correctIndices: [1],
    explanation: 'Event-driven append-only logs buffer high-throughput ingestion with zero row-lock contention, decoupling ingestion from durable ledger commitments.',
    tags: ['System Design', 'Event Sourcing', 'Architecture']
  }
];

export class QuestionBankService {
  private questions: AssessmentQuestion[] = [...INITIAL_QUESTION_BANK];

  public getAllQuestions(): AssessmentQuestion[] {
    return this.questions;
  }

  public getQuestionsBySkill(skill: string): AssessmentQuestion[] {
    const clean = skill.toLowerCase().trim();
    return this.questions.filter(q => 
      q.skill.toLowerCase().includes(clean) || clean.includes(q.skill.toLowerCase()) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(clean)))
    );
  }

  public addQuestion(question: Omit<AssessmentQuestion, 'id'>): { success: boolean; question?: AssessmentQuestion; error?: string } {
    // Validation
    if (!question.question || question.question.trim().length < 10) {
      return { success: false, error: 'Question text must be at least 10 characters long.' };
    }

    if (question.type === 'single_choice' || question.type === 'multiple_select') {
      if (!question.options || question.options.length < 2) {
        return { success: false, error: 'Multiple choice questions require at least 2 answer options.' };
      }
      if (!question.correctIndices || question.correctIndices.length === 0) {
        return { success: false, error: 'You must specify at least one correct option index.' };
      }
    }

    if (question.type === 'code_challenge') {
      if (!question.testCases || question.testCases.length === 0) {
        return { success: false, error: 'Coding challenge questions must provide at least one test case.' };
      }
    }

    const newQuestion: AssessmentQuestion = {
      ...question,
      id: `qb_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    this.questions.push(newQuestion);
    return { success: true, question: newQuestion };
  }

  public updateQuestion(id: string, updates: Partial<AssessmentQuestion>): boolean {
    const idx = this.questions.findIndex(q => q.id === id);
    if (idx === -1) return false;
    this.questions[idx] = { ...this.questions[idx], ...updates };
    return true;
  }

  public deleteQuestion(id: string): boolean {
    const initialLen = this.questions.length;
    this.questions = this.questions.filter(q => q.id !== id);
    return this.questions.length < initialLen;
  }
}

export const questionBankService = new QuestionBankService();
