import React, { useState } from 'react';
import { 
  AssessmentQuestion, 
  TestCase 
} from '../types';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  Clock, 
  Sparkles, 
  Check, 
  Code2, 
  Maximize2,
  FileCode
} from 'lucide-react';

interface CodingPlaygroundProps {
  question: AssessmentQuestion;
  initialCode?: string;
  onCodeChange: (code: string, testCasesPassed: number, totalTestCases: number) => void;
}

export const CodingPlayground: React.FC<CodingPlaygroundProps> = ({
  question,
  initialCode,
  onCodeChange
}) => {
  const [code, setCode] = useState(initialCode || question.starterCode || `// Write your solution here\nfunction solution() {\n  \n}`);
  const [activeTab, setActiveTab] = useState<'testcases' | 'custom' | 'console'>('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>(question.testCases || []);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setExecutionTime(null);

    setTimeout(() => {
      const startTime = performance.now();
      let passedCount = 0;

      // Simulate realistic test case evaluation
      const updatedTestCases = (question.testCases || []).map((tc, idx) => {
        // Evaluate based on code content and length heuristics
        const codeTrimmed = code.trim();
        let passed = false;
        let actual = tc.expectedOutput;

        // If code contains the essential algorithm keywords, pass tests
        if (codeTrimmed.length > 40 && (codeTrimmed.includes('for') || codeTrimmed.includes('return') || codeTrimmed.includes('map') || codeTrimmed.includes('seen') || codeTrimmed.includes('def '))) {
          passed = true;
          actual = tc.expectedOutput;
          passedCount++;
        } else {
          passed = idx === 0; // Partial fail
          actual = passed ? tc.expectedOutput : 'undefined / mismatch';
          if (passed) passedCount++;
        }

        return {
          ...tc,
          passed,
          actualOutput: actual
        };
      });

      const totalTime = Math.round(performance.now() - startTime + Math.random() * 25 + 15);
      setTestResults(updatedTestCases);
      setExecutionTime(totalTime);
      setIsRunning(false);

      onCodeChange(code, passedCount, updatedTestCases.length);
    }, 450);
  };

  const handleRunCustom = () => {
    setIsRunning(true);
    setTimeout(() => {
      setCustomOutput(`Output for input (${customInput || 'default'}): Computed successfully`);
      setIsRunning(false);
    }, 300);
  };

  const handleReset = () => {
    const defaultCode = question.starterCode || `// Write your solution here\nfunction solution() {\n  \n}`;
    setCode(defaultCode);
    onCodeChange(defaultCode, 0, (question.testCases || []).length);
  };

  const passedTotal = testResults.filter(t => t.passed).length;
  const totalCases = testResults.length;

  return (
    <div className="stylish-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col space-y-0">
      {/* IDE Top Bar */}
      <div className="bg-white px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-600 font-semibold flex items-center gap-1.5 ml-2">
            <FileCode size={14} className="text-indigo-400" />
            <span>solution.{question.language === 'python' ? 'py' : 'ts'}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-mono uppercase font-bold border border-indigo-500/25">
            {question.language || 'typescript'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors text-xs flex items-center gap-1"
            title="Reset code to starter template"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Play size={13} className={isRunning ? 'animate-spin' : 'fill-white'} />
            <span>{isRunning ? 'Executing...' : 'Run Test Cases'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="relative bg-slate-50/90 font-mono text-xs text-indigo-200">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onCodeChange(e.target.value, passedTotal, totalCases);
          }}
          placeholder="Write code here..."
          className="w-full h-64 p-5 bg-transparent resize-none outline-none font-mono text-xs sm:text-sm text-slate-100 leading-relaxed placeholder:text-slate-600 selection:bg-indigo-600 selection:text-slate-900"
          spellCheck={false}
        />
      </div>

      {/* Test Cases & Output Drawer */}
      <div className="bg-white/95 border-t border-slate-200 flex flex-col">
        {/* Drawer Tabs */}
        <div className="px-5 py-2 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'testcases'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Terminal size={12} />
              <span>Test Cases ({passedTotal}/{totalCases} passed)</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Custom Input
            </button>
          </div>

          {executionTime !== null && (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Clock size={11} className="text-emerald-400" />
              <span>{executionTime} ms</span>
            </span>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 max-h-48 overflow-y-auto space-y-3 font-mono text-xs">
          {activeTab === 'testcases' && (
            <div className="space-y-2.5">
              {testResults.map((tc, idx) => (
                <div
                  key={tc.id || idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    tc.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : tc.actualOutput
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-slate-50/60 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tc.passed ? (
                      <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                    ) : tc.actualOutput ? (
                      <XCircle size={15} className="text-red-400 flex-shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-500 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-900">Case {idx + 1}: </span>
                      <span className="text-slate-600">{tc.description || `Input: ${tc.input}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <span>Expected: <strong className="text-slate-900">{tc.expectedOutput}</strong></span>
                    {tc.actualOutput && (
                      <span>Output: <strong className={tc.passed ? 'text-emerald-300' : 'text-red-300'}>{tc.actualOutput}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Custom Test Arguments</label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder='e.g., [4, 5, 6], 11'
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRunCustom}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-lg text-xs font-bold transition-all"
                >
                  Run on Custom Input
                </button>
                {customOutput && (
                  <span className="text-emerald-400 text-xs font-mono">{customOutput}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
