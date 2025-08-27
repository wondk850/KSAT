
export enum QuestionType {
  MainIdea = '주제/제목/요지/목적', // Groups 18, 22, 23, 24
  Mood = '심경/분위기 추론', // for 19
  Claim = '필자의 주장 추론', // for 20
  InferentialMeaning = '함축 의미 추론', // for 21
  Comprehension = '내용 일치/불일치', // for 26
  Grammar = '어법성 판단', // for 29
  Vocabulary = '어휘 추론', // for 30
  FillInTheBlank = '빈칸 추론', // for 31-34
  IrrelevantSentence = '무관한 문장 찾기', // for 35
  ReorderParagraph = '순서 배열', // for 36-37
  SentenceInsertion = '문장 삽입', // for 38-39
  SummaryCompletion = '요약문 완성', // for 40
  PronounReference = '지칭 추론', // for part of 43-45
  WordScramble = '서술형 (단어 배열)',
}

export enum Difficulty {
  EASY = '쉬움',
  NORMAL = '수능 유형 (기본)',
  HARD = '어려움',
}

export interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface VocabularyEntry {
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
}
