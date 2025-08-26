import React from 'react';
import { UploadIcon, TextIcon } from './icons';
import { DEMO_TEXT } from '../constants';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
}

export function InputPanel({ inputText, setInputText }: InputPanelProps): React.ReactNode {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 실제 앱에서는 백엔드에서 OCR 처리를 수행합니다.
      // 이 데모에서는 메시지를 표시하고 예시 텍스트를 사용합니다.
      setInputText(`[${file.name} 파일 OCR 시뮬레이션]\n\n이것은 임시 텍스트입니다. 실제 애플리케이션에서는 PDF 또는 이미지 파일의 텍스트가 추출되어 여기에 표시됩니다.`);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-slate-700 flex items-center">
        <TextIcon />
        <span className="ml-2">1. 영어 지문 입력</span>
      </h2>
      
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="변형 문제를 만들 영어 지문을 여기에 붙여넣으세요..."
        className="w-full h-64 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <label
          htmlFor="file-upload"
          className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer transition duration-150 flex items-center justify-center space-x-2"
        >
          <UploadIcon />
          <span>PDF/이미지 업로드</span>
          <input id="file-upload" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
        </label>
        <button
          onClick={() => setInputText(DEMO_TEXT)}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-lg transition duration-150"
        >
          예시 지문 불러오기
        </button>
      </div>
    </div>
  );
}