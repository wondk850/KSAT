export enum QuestionType {
  MainIdea = '주제/제목 찾기',
  Comprehension = '내용 일치/불일치',
  FillInTheBlank = '빈칸 추론',
  Grammar = '어법성 판단',
  Vocabulary = '어휘 추론',
  SentenceInsertion = '문장 삽입',
  ReorderParagraph = '순서 배열',
  SummaryCompletion = '요약문 완성',
  WordScramble = '서술형 (단어 배열)',
}

export interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}
