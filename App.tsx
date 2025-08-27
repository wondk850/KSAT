
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { OutputPanel } from './components/OutputPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import type { GeneratedQuestion, QuestionType, Difficulty, VocabularyEntry } from './types';
import { generateQuestions, generateVocabularyNotes } from './services/geminiService';
import { Header } from './components/Header';
import { DEMO_TEXTS } from './constants';
import { Difficulty as DifficultyEnum } from './types';

const getRandomDemoText = () => DEMO_TEXTS[Math.floor(Math.random() * DEMO_TEXTS.length)];

export default function App(): React.ReactNode {
  // --- State Management ---
  const [inputText, setInputText] = useState<string>(() => localStorage.getItem('inputText') || getRandomDemoText());
  const [questionConfig, setQuestionConfig] = useState<Map<QuestionType, number>>(() => {
    const savedConfig = localStorage.getItem('questionConfig');
    return savedConfig ? new Map(JSON.parse(savedConfig)) : new Map();
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem('difficulty');
    return (savedDifficulty as Difficulty) || DifficultyEnum.NORMAL;
  });
  const [selectedWords, setSelectedWords] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('selectedWords');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVocabLoading, setIsVocabLoading] = useState<boolean>(false);

  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [vocabularyNotes, setVocabularyNotes] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // API Key state management
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Abort controller for cancellation logic
  const generationController = useRef<AbortController | null>(null);

  // --- Effects ---
  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('inputText', inputText);
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('questionConfig', JSON.stringify(Array.from(questionConfig.entries())));
  }, [questionConfig]);

  useEffect(() => {
    localStorage.setItem('difficulty', difficulty);
  }, [difficulty]);
  
  useEffect(() => {
    localStorage.setItem('selectedWords', JSON.stringify(Array.from(selectedWords)));
  }, [selectedWords]);


  // Check for API key on initial load
  useEffect(() => {
    if (!apiKey) {
      setIsModalOpen(true);
    }
  }, [apiKey]);
  
  // --- Handlers ---
  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
    setIsModalOpen(false);
    if (error?.includes('API 키')) {
      setError(null);
    }
  };
  
  const handleWordToggle = (word: string) => {
    const newSelectedWords = new Set(selectedWords);
    if (newSelectedWords.has(word)) {
      newSelectedWords.delete(word);
    } else {
      newSelectedWords.add(word);
    }
    setSelectedWords(newSelectedWords);
  };

  const handleLoadNewExample = () => {
    let newText = getRandomDemoText();
    // Ensure the new example is different from the current one
    while (newText === inputText && DEMO_TEXTS.length > 1) {
      newText = getRandomDemoText();
    }
    setInputText(newText);
    setSelectedWords(new Set()); // Clear selections when text changes
  };

  const handleCancelGeneration = () => {
    if (generationController.current) {
      generationController.current.abort();
      setIsLoading(false);
      setIsVocabLoading(false);
      setError("작업이 사용자에 의해 취소되었습니다.");
    }
  }
  
  const canGenerate = () => {
    if (!apiKey) {
      setError('문제 생성을 위해 Gemini API 키를 설정해주세요.');
      setIsModalOpen(true);
      return false;
    }
    if (!inputText.trim()) {
      setError('지문을 입력해주세요.');
      return false;
    }
    setError(null);
    return true;
  }

  const handleGenerateQuestions = useCallback(async () => {
    if (!canGenerate()) return;

    const totalQuestions = Array.from(questionConfig.values()).reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      setError('하나 이상의 문제 유형과 개수를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedQuestions([]);
    setVocabularyNotes([]);
    
    generationController.current = new AbortController();
    try {
      const results = await generateQuestions(
        inputText,
        questionConfig,
        difficulty,
        apiKey,
        generationController.current.signal
      );
      setGeneratedQuestions(results);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        console.log("Generation cancelled by user.");
      } else {
        console.error(e);
        setError("AI로부터 받은 응답을 처리하는 데 실패했습니다. API 키가 올바른지 확인 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
      generationController.current = null;
    }
  }, [apiKey, inputText, questionConfig, difficulty]);

  const handleGenerateVocab = useCallback(async () => {
    if (!canGenerate()) return;

    setIsVocabLoading(true);
    setError(null);
    setGeneratedQuestions([]);
    setVocabularyNotes([]);
    
    generationController.current = new AbortController();
    try {
      const wordsToAnalyze = selectedWords.size > 0 ? Array.from(selectedWords) : undefined;
      const results = await generateVocabularyNotes(
        inputText,
        apiKey,
        generationController.current.signal,
        wordsToAnalyze
      );
      setVocabularyNotes(results);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        console.log("Vocab generation cancelled by user.");
      } else {
        console.error(e);
        setError("AI로부터 받은 어휘 노트를 처리하는 데 실패했습니다. API 키가 올바른지 확인 후 다시 시도해주세요.");
      }
    } finally {
      setIsVocabLoading(false);
      generationController.current = null;
    }
  }, [apiKey, inputText, selectedWords]);

  const handleRegenerateQuestion = useCallback(async (questionToRegen: GeneratedQuestion, index: number) => {
    if (!canGenerate()) return;
    
    const originalQuestion = generatedQuestions[index];
    setGeneratedQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = { ...newQuestions[index], question: "재생성 중..." };
        return newQuestions;
    });

    const singleQuestionConfig = new Map<QuestionType, number>([[questionToRegen.type, 1]]);

    try {
      const results = await generateQuestions(
        inputText,
        singleQuestionConfig,
        difficulty,
        apiKey
      );
      if (results.length > 0) {
        setGeneratedQuestions(prev => {
          const newQuestions = [...prev];
          newQuestions[index] = results[0];
          return newQuestions;
        });
      } else {
        throw new Error("Regeneration returned no questions.");
      }
    } catch (e) {
      console.error(e);
      setGeneratedQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = originalQuestion; // Restore original on failure
        return newQuestions;
      });
      setError(`문제 #${index + 1}을(를) 다시 생성하는 데 실패했습니다.`);
    }
  }, [apiKey, inputText, difficulty, generatedQuestions]);


  return (
    <>
      <Header onApiKeyClick={() => setIsModalOpen(true)} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <SetupPanel
              inputText={inputText}
              setInputText={setInputText}
              selectedWords={selectedWords}
              onWordToggle={handleWordToggle}
              onLoadNewExample={handleLoadNewExample}
              questionConfig={questionConfig}
              setQuestionConfig={setQuestionConfig}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onGenerateQuestions={handleGenerateQuestions}
              onGenerateVocab={handleGenerateVocab}
              onCancel={handleCancelGeneration}
              isLoading={isLoading}
              isVocabLoading={isVocabLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <OutputPanel
              isLoading={isLoading}
              isVocabLoading={isVocabLoading}
              error={error}
              questions={generatedQuestions}
              vocabularyNotes={vocabularyNotes}
              onRegenerate={handleRegenerateQuestion}
            />
          </div>
        </div>
      </main>
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </>
  );
}
