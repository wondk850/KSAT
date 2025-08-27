
import React, { useState } from 'react';
import type { GeneratedQuestion, VocabularyEntry } from '../types';
import { ClipboardIcon, PrintIcon, LightbulbIcon, CheckCircleIcon, RefreshIcon } from './icons';

interface OutputPanelProps {
  isLoading: boolean;
  isVocabLoading: boolean;
  error: string | null;
  questions: GeneratedQuestion[];
  vocabularyNotes: VocabularyEntry[];
  onRegenerate: (question: GeneratedQuestion, index: number) => void;
}

// --- PDF Generation Library Loader ---
let html2pdfPromise: Promise<void> | null = null;
const SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

function ensureHtml2PdfIsLoaded(): Promise<void> {
    if ((window as any).html2pdf) return Promise.resolve();
    if (html2pdfPromise) return html2pdfPromise;
    html2pdfPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            html2pdfPromise = null;
            reject(new Error("Failed to load PDF library."));
        };
        document.body.appendChild(script);
    });
    return html2pdfPromise;
}


// --- Sub-components ---
function QuestionCard({ question, index, onRegenerate }: { question: GeneratedQuestion; index: number; onRegenerate: (q: GeneratedQuestion, i: number) => void; }): React.ReactNode {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 transition-shadow hover:shadow-lg break-inside-avoid group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">{question.type}</p>
          <p className="mt-3 text-slate-800 font-medium whitespace-pre-wrap">
            <span className="font-bold mr-2">{index + 1}.</span>{question.question}
          </p>
        </div>
        <button
          onClick={() => onRegenerate(question, index)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 p-1 rounded-full print-hide"
          aria-label="이 문제 다시 생성"
          title="이 문제 다시 생성"
        >
          <RefreshIcon />
        </button>
      </div>
      {question.options && (
        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => (
            <div key={i} className="flex items-start p-2 rounded-md bg-slate-50">
              <span className="text-sm font-semibold text-slate-500 mr-2">{i + 1}.</span>
              <span className="text-sm text-slate-700">{option}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 print-hide">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1"
        >
          <LightbulbIcon />
          <span>{showAnswer ? '정답 및 해설 숨기기' : '정답 및 해설 보기'}</span>
        </button>
      </div>
      <div className={`answer-section mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg ${!showAnswer ? 'hidden' : ''} print-show`}>
        <p className="font-semibold text-green-800 flex items-center"><CheckCircleIcon /><span className="ml-2">정답: {question.answer}</span></p>
        <p className="mt-2 text-sm text-green-700">{question.explanation}</p>
      </div>
    </div>
  );
}

function VocabularyView({ notes }: { notes: VocabularyEntry[] }): React.ReactNode {
  return (
    <div className="space-y-4">
      {notes.map((entry, index) => (
        <div key={index} className="bg-white p-5 rounded-lg border border-slate-200 break-inside-avoid">
          <h4 className="text-lg font-bold text-slate-800">{entry.word}</h4>
          <p className="text-sm text-slate-600 mt-1">{entry.definition}</p>
          <div className="mt-3 text-xs space-y-2">
            {entry.synonyms && entry.synonyms.length > 0 && <p><strong className="text-blue-600">유의어:</strong> {entry.synonyms.join(', ')}</p>}
            {entry.antonyms && entry.antonyms.length > 0 && <p><strong className="text-red-600">반의어:</strong> {entry.antonyms.join(', ')}</p>}
          </div>
          <blockquote className="mt-3 p-3 bg-slate-50 border-l-4 border-slate-300 text-sm text-slate-700 italic">
            "{entry.exampleSentence}"
          </blockquote>
        </div>
      ))}
    </div>
  );
}


function LoadingSkeleton({ type }: { type: 'question' | 'vocab' }): React.ReactNode {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 animate-pulse">
          <div className={`h-4 bg-slate-200 rounded ${type === 'question' ? 'w-1/4' : 'w-1/3'}`}></div>
          <div className="mt-4 h-5 bg-slate-200 rounded w-full"></div>
          {type === 'question' && <div className="mt-2 h-5 bg-slate-200 rounded w-3/4"></div>}
          <div className="mt-6 space-y-2">
            <div className="h-8 bg-slate-100 rounded"></div>
            {type === 'question' && <div className="h-8 bg-slate-100 rounded"></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OutputPanel({ isLoading, isVocabLoading, error, questions, vocabularyNotes, onRegenerate }: OutputPanelProps): React.ReactNode {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  
  const handleSaveAsPdf = async () => {
    setIsSavingPdf(true);
    let elementClone: HTMLElement | null = null;

    try {
      await ensureHtml2PdfIsLoaded();

      const html2pdfLib = (window as any).html2pdf;
      if (!html2pdfLib) throw new Error("PDF library loaded but is not available.");

      const element = document.getElementById('print-area');
      if (!element) throw new Error("PDF 생성 대상 요소를 찾을 수 없습니다.");
      
      elementClone = element.cloneNode(true) as HTMLElement;
      
      // --- Prepare clone for PDF generation ---
      const isQuestionPdf = questions.length > 0;
      const pdfTitle = isQuestionPdf ? '영어 변형 문제' : '핵심 어휘 노트';
      const pdfFilename = isQuestionPdf ? '영어_변형문제.pdf' : '영어_어휘노트.pdf';

      const titleEl = elementClone.querySelector('.print-title');
      if (titleEl) {
        titleEl.textContent = pdfTitle;
        (titleEl as HTMLElement).style.display = 'block';
      }

      elementClone.querySelectorAll('.print-hide').forEach(el => (el as HTMLElement).style.display = 'none');
      elementClone.querySelectorAll('.answer-section').forEach(answer => (answer as HTMLElement).classList.remove('hidden'));

      if (isQuestionPdf) {
        const answerSheet = document.createElement('div');
        answerSheet.style.pageBreakBefore = 'always';
        answerSheet.style.paddingTop = '1in';
        answerSheet.innerHTML = `<h2 style="text-align: center; font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">정답지 (Answer Sheet)</h2>`;
        
        const answerList = document.createElement('div');
        answerList.style.cssText = 'max-width: 80%; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 1rem;';
        
        questions.forEach((q, i) => {
          const answerItem = document.createElement('p');
          answerItem.style.cssText = 'font-size: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #eee;';
          answerItem.innerHTML = `<strong style="margin-right: 0.5rem;">${i + 1}.</strong> <span style="font-size: 0.9rem; color: #555;">(${q.type})</span> &rarr; <strong style="color: #007bff;">${q.answer}</strong>`;
          answerList.appendChild(answerItem);
        });
        
        answerSheet.appendChild(answerList);
        elementClone.appendChild(answerSheet);
      }

      elementClone.style.cssText = 'position: absolute; left: -9999px; top: 0px; width: 794px; background-color: white; padding: 1rem;';
      document.body.appendChild(elementClone);
    
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5], filename: pdfFilename,
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
    
      await html2pdfLib().from(elementClone).set(opt).save();

    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "PDF를 생성하는 중 오류가 발생했습니다.");
    } finally {
      elementClone?.remove();
      setIsSavingPdf(false);
    }
  };

  const hasQuestions = questions.length > 0;
  const hasVocab = vocabularyNotes.length > 0;
  const hasContent = hasQuestions || hasVocab;
  const currentView = hasQuestions ? '문제' : (hasVocab ? '어휘 노트' : '콘텐츠');

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-700">3. 생성된 {currentView}</h2>
        {hasContent && (
          <button
            onClick={handleSaveAsPdf}
            disabled={isSavingPdf}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isSavingPdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>저장 중...</span>
              </>
            ) : (
              <><PrintIcon /><span>PDF로 저장</span></>
            )}
          </button>
        )}
      </div>

      <div id="print-area">
        <h1 className="text-2xl font-bold text-center mb-6 hidden print-title"></h1>
        {isLoading && <LoadingSkeleton type="question" />}
        {isVocabLoading && <LoadingSkeleton type="vocab" />}
        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
        
        {!isLoading && !isVocabLoading && !error && !hasContent && (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
            <ClipboardIcon />
            <p className="mt-4 text-slate-500 font-semibold">생성된 콘텐츠가 여기에 표시됩니다.</p>
            <p className="text-sm text-slate-400">지문을 입력하고, 원하는 작업을 선택하세요.</p>
          </div>
        )}
        
        {!isLoading && !isVocabLoading && hasContent && (
          <>
            {hasQuestions && <div className="space-y-4">{questions.map((q, i) => <QuestionCard key={i} question={q} index={i} onRegenerate={onRegenerate} />)}</div>}
            {hasVocab && <VocabularyView notes={vocabularyNotes} />}
          </>
        )}
      </div>
      <style>{`.break-inside-avoid { page-break-inside: avoid; } @media print { .print-hide { display: none !important; } .print-show { display: block !important; } }`}</style>
    </div>
  );
}
