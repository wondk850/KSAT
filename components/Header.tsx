
import React from 'react';
import { BookIcon, KeyIcon } from './icons';

interface HeaderProps {
  onApiKeyClick: () => void;
}

export function Header({ onApiKeyClick }: HeaderProps): React.ReactNode {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <span className="text-blue-600">
              <BookIcon />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              AI 영어 변형문제 생성기
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={onApiKeyClick}
              className="flex items-center space-x-2 p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="API 키 설정"
            >
              <KeyIcon />
              <span className="hidden sm:inline text-sm font-medium">API 키 설정</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
