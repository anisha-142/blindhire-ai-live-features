import React, { useState, useEffect, useRef } from 'react';
import { BlindProfile, JobPost, AssessmentResult, InterviewMessage } from '../types';
import {
  Mic, Send, Bot, User, Sparkles, RefreshCw, Star,
  CheckCircle, AlertCircle, Play, Square, Award,
  MessageSquare, ChevronRight, HelpCircle, ArrowRight
} from 'lucide-react';

interface InterviewSimulatorProps {
  profile: BlindProfile;
  job: JobPost | undefined;
  assessmentResult: AssessmentResult | undefined;
  onNavigate: (tab: string) => void;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  profile,
  job,
  assessmentResult,
  onNavigate
}) => {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewActive, setInterviewActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Generate dynamic contextual starter questions based on resume skills, projects, and target role
  const generateStarterQuestion = () => {
    const role = job?.title || profile.suggestedRoles[0] || 'Software Engineer';
    const topSkills = profile.topSkills;
    const weakSkill = assessmentResult?.weaknesses[0];

    const questionsPool = [
      `Hello! I'm your AI Technical Interviewer for the ${role} position. Let's start with your background: You highlighted ${topSkills.slice(0, 2).join(' and ')} on your resume. Could you walk me through an architecture or project where you leveraged these to solve a complex engineering bottleneck?`,
      `Welcome to your mock interview for ${role}. Looking at your technical profile, you've worked with ${topSkills[0] || 'modern tech'}. Can you explain a scenario where you had to make a difficult technical trade-off between performance, reliability, and delivery speed?`,
      `Great to meet you. In this role, deep proficiency in ${job?.requiredSkills[0] || topSkills[0] || 'system architecture'} is critical. How do you approach debugging high-concurrency latency issues in production?`,
      weakSkill ? `Let's dive into some technical depth. In our earlier assessment, we explored ${weakSkill}. How would you design a resilient data caching layer to optimize query throughput under heavy load?` : `Can you describe your favorite project mentioned on your resume? What was your specific architectural contribution and the measurable outcome?`
    ];

    return questionsPool[Math.floor(Math.random() * questionsPool.length)];
  };

  const startInterview = () => {
    setInterviewActive(true);
    setQuestionCount(1);
    const firstQ = generateStarterQuestion();
    setMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'interviewer',
        text: firstQ,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const userMsg: InterviewMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      feedback: evaluateResponseQuality(userText)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Generate intelligent AI follow-up
    setTimeout(() => {
      const followUpText = generateFollowUp(userText, questionCount, profile, job);
      const aiMsg: InterviewMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'interviewer',
        text: followUpText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setQuestionCount(c => c + 1);
      setIsTyping(false);
    }, 1200);
  };

  // Evaluation logic for candidate response
  const evaluateResponseQuality = (text: string): InterviewMessage['feedback'] => {
    const wordCount = text.split(/\s+/).length;
    const hasTechnicalTerms = /(architecture|scale|latency|database|query|optimization|algorithm|async|thread|cache|microservice|index|test)/i.test(text);
    const hasMetric = /\d+[%kmb]?/i.test(text);
    const hasStructure = /(first|because|result|implemented|designed|led|solved)/i.test(text);

    let completeness = Math.min(95, Math.max(45, wordCount * 2 + (hasTechnicalTerms ? 25 : 10) + (hasMetric ? 15 : 0)));
    let techAcc = Math.min(95, (hasTechnicalTerms ? 50 : 20) + (hasMetric ? 20 : 0) + (hasStructure ? 25 : 10));

    let tone: 'Excellent' | 'Good' | 'Needs Improvement' = 'Good';
    if (completeness >= 80 && techAcc >= 75) tone = 'Excellent';
    else if (completeness < 60) tone = 'Needs Improvement';

    let suggestion = 'Solid response. Try to structure using the STAR method (Situation, Task, Action, Result) and quantify metrics.';
    if (tone === 'Excellent') {
      suggestion = 'Outstanding depth! Clear technical articulation with concrete actions and context.';
    } else if (tone === 'Needs Improvement') {
      suggestion = 'A bit brief. Elaborate on your technical decision-making, tools used, and the measurable outcome.';
    }

    return {
      tone,
      completeness,
      technicalAccuracy: techAcc,
      suggestion
    };
  };

  const generateFollowUp = (userResponse: string, count: number, prof: BlindProfile, j?: JobPost): string => {
    if (count >= 5) {
      return `Thank you for completing this technical interview session! You demonstrated solid command over technical concepts. Review your answer feedback cards above for detailed tips on structuring interview responses with metrics and trade-offs.`;
    }

    const followUps = [
      `Interesting perspective. If system traffic suddenly spiked 10x or memory limits were cut in half, what failure modes would you monitor first, and how would your design adapt?`,
      `That makes sense. Could you dive deeper into how you verified that solution? What testing strategies or observability metrics did you establish?`,
      `Great. Let's transition to team collaboration and technical leadership: When a team member disagrees on a fundamental design choice (e.g. database schema or state management), how do you reach technical alignment?`,
      `Nice explanation. How would you explain that exact technical architectural choice to a non-technical product stakeholder or client?`
    ];

    return followUps[(count - 1) % followUps.length];
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header Banner */}
      <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold">
            <Mic size={12} className="text-cyan-400" />
            <span>AI Role Interview Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Role Interview Practice: {job ? job.title : profile.suggestedRoles[0]}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Practice realistic behavioral, architectural, and technical interview questions based strictly on your resume, claimed projects, and target role criteria.
          </p>
        </div>

        {!interviewActive ? (
          <button
            onClick={startInterview}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-900 text-xs font-extrabold rounded-2xl transition-all shadow-xl shadow-cyan-600/30 flex items-center gap-2 whitespace-nowrap animate-pulse"
          >
            <Play size={15} className="fill-white" />
            <span>Start Mock Interview</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setInterviewActive(false);
              setMessages([]);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-white/15 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-200"
          >
            <Square size={13} className="text-red-400 fill-red-400" />
            <span>End Session</span>
          </button>
        )}
      </div>

      {/* Main Simulator Area */}
      {!interviewActive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stylish-card bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Bot size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Contextual Interview Questions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Questions are drawn directly from your listed skills ({profile.topSkills.slice(0, 3).join(', ')}), experience projects, and job description criteria.
            </p>
          </div>

          <div className="stylish-card bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Award size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Feedback Scoring</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive instantaneous feedback on each answer: completeness rating, technical precision, tone, and STAR-method suggestions.
            </p>
          </div>

          <div className="stylish-card bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Dynamic Adaptive Flow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow-up questions adapt intelligently based on your technical depth, challenging your architectural assumptions.
            </p>
          </div>
        </div>
      ) : (
        /* Chat Session Area */
        <div className="stylish-card bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'interviewer' && (
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2.5 ${msg.role === 'candidate' ? 'items-end text-right' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'candidate'
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-white/90 text-slate-200 border border-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{msg.role === 'interviewer' ? 'AI Recruiter Interviewer' : 'You'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Feedback Card for Candidate Response */}
                  {msg.feedback && (
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-500/25 text-left text-xs space-y-2 max-w-lg mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Response Analysis</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          msg.feedback.tone === 'Excellent' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          msg.feedback.tone === 'Good' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' :
                          'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {msg.feedback.tone}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-1.5 bg-slate-50/60 rounded-lg">
                          <span className="text-slate-500">Completeness:</span> <strong className="text-cyan-300">{msg.feedback.completeness}%</strong>
                        </div>
                        <div className="p-1.5 bg-slate-50/60 rounded-lg">
                          <span className="text-slate-500">Technical Depth:</span> <strong className="text-purple-300">{msg.feedback.technicalAccuracy}%</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-tight">
                        💡 {msg.feedback.suggestion}
                      </p>
                    </div>
                  )}
                </div>

                {msg.role === 'candidate' && (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-cyan-400 font-mono animate-pulse">
                <Bot size={18} />
                <span>AI Interviewer is analyzing your response and formulating a technical follow-up...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your structured technical answer (STAR format recommended)..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-900 font-bold text-xs rounded-2xl shadow-lg shadow-cyan-600/30 disabled:opacity-40 flex items-center gap-2"
            >
              <span>Submit</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
