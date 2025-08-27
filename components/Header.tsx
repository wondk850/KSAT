
import React from 'react';
import { BookIcon, KeyIcon } from './icons';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
}

export function Header({ onOpenApiKeyModal }: HeaderProps): React.ReactNode {
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
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-slate-100"
            aria-label="API 키 설정"
          >
            <KeyIcon />
            <span className="hidden sm:inline text-sm font-semibold">API 키 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
}
