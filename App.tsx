
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { OutputPanel } from './components/OutputPanel';
import type { GeneratedQuestion, QuestionType } from './types';
import { generateQuestions } from './services/geminiService';

export default function App(): React.ReactNode {
  const [inputText, setInputText] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<Set<QuestionType>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to generate questions.');
      return;
    }
    if (selectedTypes.size === 0) {
      setError('Please select at least one question type.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const questions = await generateQuestions(inputText, Array.from(selectedTypes));
      setGeneratedQuestions(questions);
    } catch (err) {
      console.error(err);
      setError('Failed to generate questions. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedTypes]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
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
    </div>
  );
}
