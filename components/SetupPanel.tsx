import React, { useState } from 'react';
import { InputPanel } from './InputPanel';
import { ConfigPanel } from './ConfigPanel';
import type { QuestionType, Difficulty } from '../types';
import { TextIcon, SettingsIcon } from './icons';

interface SetupPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedWords: Set<string>;
  onWordToggle: (word: string) => void;
  onLoadNewExample: () => void;
  questionConfig: Map<QuestionType, number>;
  setQuestionConfig: (config: Map<QuestionType, number>) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onGenerateQuestions: () => void;
  onGenerateVocab: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isVocabLoading: boolean;
}

type ActiveTab = 'input' | 'config';

export function SetupPanel(props: SetupPanelProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');

  const getTabClass = (tabName: ActiveTab) => {
    return `flex-1 py-3 px-2 text-center text-sm font-semibold border-b-2 transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2 ${
      activeTab === tabName
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
    }`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab('input')} className={getTabClass('input')}>
          <TextIcon />
          <span>1. 지문 입력</span>
        </button>
        <button onClick={() => setActiveTab('config')} className={getTabClass('config')}>
          <SettingsIcon />
          <span>2. 문제 설정</span>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'input' && (
          <InputPanel
            inputText={props.inputText}
            setInputText={props.setInputText}
            selectedWords={props.selectedWords}
            onWordToggle={props.onWordToggle}
            onLoadNewExample={props.onLoadNewExample}
          />
        )}
        {activeTab === 'config' && (
          <ConfigPanel
            questionConfig={props.questionConfig}
            setQuestionConfig={props.setQuestionConfig}
            difficulty={props.difficulty}
            setDifficulty={props.setDifficulty}
            onGenerateQuestions={props.onGenerateQuestions}
            onGenerateVocab={props.onGenerateVocab}
            onCancel={props.onCancel}
            isLoading={props.isLoading}
            isVocabLoading={props.isVocabLoading}
            selectedWordsCount={props.selectedWords.size}
          />
        )}
      </div>
    </div>
  );
}
