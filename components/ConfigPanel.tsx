import React from 'react';
import { QuestionType } from '../types';
import { QUESTION_TYPES } from '../constants';
import { SettingsIcon, SparklesIcon } from './icons';

interface ConfigPanelProps {
  selectedTypes: Set<QuestionType>;
  setSelectedTypes: (types: Set<QuestionType>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function ConfigPanel({ selectedTypes, setSelectedTypes, onGenerate, isLoading }: ConfigPanelProps): React.ReactNode {
  
  const handleTypeChange = (type: QuestionType) => {
    const newSelection = new Set(selectedTypes);
    if (newSelection.has(type)) {
      newSelection.delete(type);
    } else {
      newSelection.add(type);
    }
    setSelectedTypes(newSelection);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-slate-700 flex items-center">
        <SettingsIcon />
        <span className="ml-2">2. 문제 유형 선택</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUESTION_TYPES.map((type) => (
          <label key={type} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedTypes.has(type)}
              onChange={() => handleTypeChange(type)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-600">{type}</span>
          </label>
        ))}
      </div>
      
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              생성 중...
            </>
          ) : (
            <>
             <SparklesIcon />
             <span className="ml-2">문제 생성</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}