
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { OutputPanel } from './components/OutputPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import type { GeneratedQuestion, QuestionType } from './types';
import { generateQuestions } from './services/geminiService';

export default function App(): React.ReactNode {
  const [inputText, setInputText] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<Set<QuestionType>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // State for API Key management
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);

  // Load API key from session storage on initial render
  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    sessionStorage.setItem('gemini-api-key', newApiKey);
    setApiKeyModalOpen(false);
    setError(null); // Clear previous errors
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('API 키를 설정해주세요. 우측 상단의 열쇠 아이콘을 클릭하여 키를 입력할 수 있습니다.');
      setApiKeyModalOpen(true);
      return;
    }
    if (!inputText.trim()) {
      setError('지문을 입력해주세요.');
      return;
    }
    if (selectedTypes.size === 0) {
      setError('하나 이상의 문제 유형을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const questions = await generateQuestions(inputText, Array.from(selectedTypes), apiKey);
      setGeneratedQuestions(questions);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '질문을 생성하는 중 알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedTypes, apiKey]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <InputPanel
              inputText={inputText}
              setInputText={setInputText}
            />
            <ConfigPanel
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8">
            <OutputPanel
              isLoading={isLoading}
              error={error}
              questions={generatedQuestions}
            />
          </div>
        </div>
      </main>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
}
