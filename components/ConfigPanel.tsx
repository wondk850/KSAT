import React from 'react';
import { QuestionType, Difficulty } from '../types';
import { QUESTION_TYPES } from '../constants';
import { SparklesIcon, VocabIcon } from './icons';

interface ConfigPanelProps {
  questionConfig: Map<QuestionType, number>;
  setQuestionConfig: (config: Map<QuestionType, number>) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onGenerateQuestions: () => void;
  onGenerateVocab: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isVocabLoading: boolean;
  selectedWordsCount: number;
}

const difficultyOptions: { id: Difficulty; label: string }[] = [
  { id: Difficulty.EASY, label: '쉬움' },
  { id: Difficulty.NORMAL, label: '수능 유형' },
  { id: Difficulty.HARD, label: '어려움' },
];

export function ConfigPanel({
  questionConfig, setQuestionConfig,
  difficulty, setDifficulty,
  onGenerateQuestions, onGenerateVocab, onCancel,
  isLoading, isVocabLoading, selectedWordsCount
}: ConfigPanelProps): React.ReactNode {

  const handleConfigChange = (type: QuestionType, action: 'toggle' | 'count', value?: number) => {
    const newConfig = new Map(questionConfig);
    const currentCount = newConfig.get(type) || 0;

    if (action === 'toggle') {
      if (currentCount > 0) {
        newConfig.set(type, 0); // Uncheck by setting count to 0
      } else {
        newConfig.set(type, 1); // Check by setting count to 1
      }
    } else if (action === 'count') {
      const newCount = value !== undefined ? Math.max(0, value) : 0;
      newConfig.set(type, newCount);
    }
    setQuestionConfig(newConfig);
  };
  
  const totalQuestionCount = Array.from(questionConfig.values()).reduce((sum, count) => sum + count, 0);
  const vocabButtonText = selectedWordsCount > 0
    ? `선택 단어로 노트 생성 (${selectedWordsCount}개)`
    : 'AI 추천 어휘 노트 생성';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">문제 유형 및 개수 선택</h3>
        <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
          {QUESTION_TYPES.map(type => (
            <div key={type} className="flex items-center justify-between">
              <label className="flex items-center space-x-3 select-none cursor-pointer">
                <input
                  type="checkbox"
                  // FIX: Added parentheses to ensure the expression correctly evaluates to a boolean due to operator precedence.
                  checked={(questionConfig.get(type) || 0) > 0}
                  onChange={() => handleConfigChange(type, 'toggle')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">{type}</span>
              </label>
              <input
                type="number"
                min="0"
                value={questionConfig.get(type) || 0}
                onChange={(e) => handleConfigChange(type, 'count', parseInt(e.target.value, 10))}
                className="w-16 h-8 text-center text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                disabled={(questionConfig.get(type) || 0) === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">난이도 설정</h3>
        <div className="flex space-x-2">
          {difficultyOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setDifficulty(opt.id)}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${
                difficulty === opt.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200">
        {isLoading ? (
          <button onClick={onCancel} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition">
            <span>생성 취소</span>
          </button>
        ) : (
          <button onClick={onGenerateQuestions} disabled={isVocabLoading || totalQuestionCount === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:bg-slate-400">
            <SparklesIcon />
            <span>문제 생성 ({totalQuestionCount}개)</span>
          </button>
        )}
        
        {isVocabLoading ? (
            <button onClick={onCancel} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition">
              <span>생성 취소</span>
            </button>
        ) : (
          <button onClick={onGenerateVocab} disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:bg-slate-400">
            <VocabIcon />
            <span>{vocabButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}