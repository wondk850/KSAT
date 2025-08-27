import React, { useState } from 'react';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedWords: Set<string>;
  onWordToggle: (word: string) => void;
  onLoadNewExample: () => void;
}

const tokenize = (text: string): string[] => {
  return text.split(/(\s+|[.,?!:;()"'])/g).filter(Boolean);
};

export function InputPanel({ inputText, setInputText, selectedWords, onWordToggle, onLoadNewExample }: InputPanelProps): React.ReactNode {
  const [isEditing, setIsEditing] = useState(inputText.length < 10);

  const handleWordClick = (word: string) => {
    const cleanedWord = word.trim().replace(/^[.,?!:;()"']+|[.,?!:;()"']+$/g, '');
    if (cleanedWord && isNaN(Number(cleanedWord))) {
      onWordToggle(cleanedWord);
    }
  };
  
  const startEditing = () => {
    setIsEditing(true);
  }

  const finishEditing = () => {
    // Trim text and only exit editing if there's content, preventing empty state lock.
    if(inputText.trim()){
      setIsEditing(false);
    }
  }


  if (isEditing) {
    return (
      <div className="space-y-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="변형 문제를 만들 영어 지문을 여기에 붙여넣으세요..."
          className="w-full h-64 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm text-slate-800"
          autoFocus
        />
        <button
          onClick={finishEditing}
          disabled={!inputText.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-400 transition"
        >
          단어 선택 모드로 전환
        </button>
      </div>
    );
  }

  const tokens = tokenize(inputText);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        아래 지문에서 단어를 클릭하여 어휘 노트를 만들 단어를 선택하세요.
      </p>
      <div className="w-full h-64 p-3 border border-slate-300 rounded-lg overflow-y-auto leading-relaxed text-sm bg-slate-50 text-slate-800">
        {tokens.map((token, index) => {
          const cleanedWord = token.trim().replace(/^[.,?!:;()"']+|[.,?!:;()"']+$/g, '');
          const isWord = cleanedWord && isNaN(Number(cleanedWord));
          const isSelected = isWord && selectedWords.has(cleanedWord);

          return (
            <span
              key={index}
              onClick={() => handleWordClick(token)}
              className={`${isWord ? 'cursor-pointer' : ''} transition-colors rounded ${isSelected ? 'bg-yellow-200 text-yellow-900' : (isWord ? 'hover:bg-blue-100' : '')}`}
            >
              {token}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={startEditing}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          지문 수정
        </button>
        <button
          onClick={onLoadNewExample}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          다른 예시 지문 보기
        </button>
      </div>
    </div>
  );
}
