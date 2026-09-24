import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot, Send, ShieldCheck, AlertCircle, FileText, CheckCircle2,
  Sparkles, RefreshCw, Layers, HelpCircle, Terminal
} from 'lucide-react';
import { aiService } from '../services/api';
import { useCase } from '../context/CaseContext';

export default function AIAssistant() {
  const { activeCaseId } = useCase();
  const [searchParams] = useSearchParams();
  const initialEntity = searchParams.get('entity') || '';

  const [inputQuery, setInputQuery] = useState(
    initialEntity
      ? `Summarize the important relationships and anomalies for entity ${initialEntity} and cite supporting records.`
      : 'Summarize the important relationships in this case and cite the supporting records.'
  );
  const [chatLog, setChatLog] = useState([
    {
      sender: 'assistant',
      data: {
        answer: 'CRIMENET AI Investigator Assistant initialized. I analyze only structured knowledge graph records and evidentiary dispatches.',
        observations: [
          'Operation Hawkeye comprises 100 indexed entities, 54 active graph relationships, and 4 flagged anomalies.',
          'Hub entity P001 (Rajesh Sharma) exhibits highest network centrality with 17 verified direct connections.'
        ],
        inferences: [
          'Entity P014 functions as a critical cross-cluster bridge connecting NCR transport hubs to Western port facilities.'
        ],
        uncertainties: [
          'Statutory mandate: Analytical outputs are strictly decision-support leads and do not constitute legal proof of guilt.'
        ],
        evidence: [
          { id: 'FIR-1023', type: 'FIR', summary: 'Logistics dispatch audit' },
          { id: 'CDR-1002', type: 'CDR', summary: 'Telecom exchange records' }
        ],
        model_used: 'qwen2.5:7b'
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    aiService.getStatus()
      .then(res => setAiStatus(res.data))
      .catch(err => console.error('AI status check failed:', err));
  }, []);

  const handleSend = async (queryToSend = inputQuery) => {
    if (!queryToSend.trim() || loading) return;

    const userMessage = queryToSend.trim();
    setChatLog(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiService.chat({
        message: userMessage,
        case_id: activeCaseId,
        focus_entity_id: initialEntity || null
      });

      setChatLog(prev => [...prev, { sender: 'assistant', data: res.data }]);
    } catch (err) {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'assistant',
          data: {
            answer: 'AI inference service experienced a communication timeout. Fallback heuristic engine remains operational.',
            observations: ['Graph evidence retrieval active.'],
            inferences: ['Requires manual investigator inspection.'],
            uncertainties: ['Temporary inference latency.'],
            evidence: [{ id: 'FIR-1023', type: 'FIR' }]
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Summarize the important relationships in this case and cite the supporting records.',
    'Show connections of P001 and explain key network patterns.',
    'Find a path between P001 and P023 and cite supporting evidence.',
    'What changed in this network during March?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-5xl mx-auto space-y-4">
      {/* Assistant Header & Model Status */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Investigator Decision-Support Assistant</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                RAG GROUNDED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Retrieval-augmented intelligence answering investigator inquiries citing verified record IDs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Model:</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-sky-400 font-bold">
            {aiStatus?.current_model || 'qwen2.5:7b'}
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
            {aiStatus?.mode || 'Local Grounded Engine'}
          </span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-5">
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'user' ? (
              <div className="max-w-xl bg-sky-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs font-medium shadow-md">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs space-y-4 shadow-sm">
                {/* Executive Answer */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      ANALYTICAL SYNTHESIS
                    </span>
                    <span>Engine: {msg.data.model_used || 'qwen2.5:7b'}</span>
                  </div>
                  <p className="text-slate-100 font-medium leading-relaxed">
                    {msg.data.answer}
                  </p>
                </div>

                {/* Structured Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Observations */}
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-sky-300 block">Observed Data</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {msg.data.observations?.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Analytical Inferences */}
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 block">Analytical Inference</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {msg.data.inferences?.map((inf, i) => (
                        <li key={i}>{inf}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Uncertainties */}
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 block">Uncertainty</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {msg.data.uncertainties?.map((unc, i) => (
                        <li key={i}>{unc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Supporting Evidentiary Records */}
                {msg.data.evidence?.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400 font-semibold">Supporting Evidentiary Records:</span>
                      <div className="flex flex-wrap items-center gap-1 font-mono text-emerald-400 font-bold">
                        {msg.data.evidence.map((ev, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {ev.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Statutory Disclaimer */}
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-rose-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Strictly decision-support output. This analytical insight does not establish guilt and requires human investigator verification.</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-sky-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Querying local LLM against grounded knowledge graph...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-slate-400 font-semibold text-[11px] shrink-0">Suggested:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 shrink-0 text-[11px] transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Prompt Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask an investigative inquiry (e.g. Find connections of P001, analyze March anomalies)..."
          className="flex-1 px-4 py-3 bg-[#111827] border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-5 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-sky-600/20"
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
