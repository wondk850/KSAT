import React, { useState } from 'react';
import type { GeneratedQuestion } from '../types';
import { ClipboardIcon, PrintIcon, LightbulbIcon, CheckCircleIcon } from './icons';

interface OutputPanelProps {
  isLoading: boolean;
  error: string | null;
  questions: GeneratedQuestion[];
}

let html2pdfPromise: Promise<void> | null = null;
const SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

function ensureHtml2PdfIsLoaded(): Promise<void> {
    // If library is already available, resolve immediately
    if ((window as any).html2pdf) {
        return Promise.resolve();
    }
    // If script is already being loaded, return the existing promise
    if (html2pdfPromise) {
        return html2pdfPromise;
    }

    // Otherwise, create and load the script
    html2pdfPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => {
            html2pdfPromise = null; // Allow retrying on failure
            reject(new Error("Failed to load PDF library."));
        };
        
        document.body.appendChild(script);
    });

    return html2pdfPromise;
}


function QuestionCard({ question, index }: { question: GeneratedQuestion; index: number }): React.ReactNode {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 transition-shadow hover:shadow-lg break-words">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">{question.type}</p>
          <p className="mt-3 text-slate-800 font-medium whitespace-pre-wrap">
            <span className="font-bold mr-2">{index + 1}.</span>{question.question}
          </p>
        </div>
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

      <div className="mt-4">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1"
        >
          <LightbulbIcon />
          <span>{showAnswer ? '정답 및 해설 숨기기' : '정답 및 해설 보기'}</span>
        </button>
      </div>

      <div className={`answer-section mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg ${!showAnswer ? 'hidden' : ''}`}>
        <p className="font-semibold text-green-800 flex items-center"><CheckCircleIcon /><span className="ml-2">정답: {question.answer}</span></p>
        <p className="mt-2 text-sm text-green-700">{question.explanation}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton(): React.ReactNode {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="mt-4 h-5 bg-slate-200 rounded w-full"></div>
          <div className="mt-2 h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="mt-6 space-y-2">
            <div className="h-8 bg-slate-100 rounded"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OutputPanel({ isLoading, error, questions }: OutputPanelProps): React.ReactNode {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  
  const handleSaveAsPdf = async () => {
    setIsSavingPdf(true);
    let elementClone: HTMLElement | null = null;

    try {
      await ensureHtml2PdfIsLoaded();

      const html2pdfLib = (window as any).html2pdf;
      if (!html2pdfLib) {
        throw new Error("PDF library loaded but is not available on the window object.");
      }

      const element = document.getElementById('print-area');
      if (!element) {
        throw new Error("PDF 생성 대상 요소를 찾을 수 없습니다.");
      }
      
      elementClone = element.cloneNode(true) as HTMLElement;
    
      // Prepare clone for printing
      const title = elementClone.querySelector('.print-only');
      if (title) {
        (title as HTMLElement).style.display = 'block';
        (title as HTMLElement).style.textAlign = 'center';
        (title as HTMLElement).style.fontSize = '1.5rem';
        (title as HTMLElement).style.marginBottom = '1.5rem';
      }
    
      const answers = elementClone.querySelectorAll('.answer-section');
      answers.forEach(answer => {
        (answer as HTMLElement).classList.remove('hidden');
      });

      // Style for off-screen rendering
      elementClone.style.position = 'absolute';
      elementClone.style.left = '-9999px';
      elementClone.style.top = '0px';
      elementClone.style.width = '794px'; // A4 width in pixels approx.
      elementClone.style.backgroundColor = 'white';
      
      document.body.appendChild(elementClone);
    
      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5],
        filename:     '영어_변형문제.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
    
      await html2pdfLib().from(elementClone).set(opt).save();

    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("Failed to load PDF library")) {
        alert("PDF 생성 라이브러리를 로드하지 못했습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.");
      } else {
        alert("PDF를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      if (elementClone && elementClone.parentElement) {
        elementClone.parentElement.removeChild(elementClone);
      }
      setIsSavingPdf(false);
    }
  };

  const hasContent = questions.length > 0;

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-700">3. 생성된 문제</h2>
        {hasContent && (
          <button
            onClick={handleSaveAsPdf}
            disabled={isSavingPdf}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isSavingPdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <PrintIcon />
                <span>PDF로 저장</span>
              </>
            )}
          </button>
        )}
      </div>

      <div id="print-area">
         <h1 className="text-2xl font-bold text-center mb-6 print-only">영어 변형 문제</h1>
        {isLoading && <LoadingSkeleton />}
        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
        {!isLoading && !error && questions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
            <ClipboardIcon />
            <p className="mt-4 text-slate-500 font-semibold">생성된 문제가 여기에 표시됩니다.</p>
            <p className="text-sm text-slate-400">지문을 입력하고, 문제 유형을 선택한 후 "문제 생성" 버튼을 누르세요.</p>
          </div>
        )}
        {hasContent && (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <QuestionCard key={i} question={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}