import { GoogleGenAI, Type } from "@google/genai";
// FIX: Separate enum imports from type-only imports. `QuestionType` and `Difficulty` are enums used as values, so they must be imported as values.
import { QuestionType, Difficulty } from "../types";
import type { GeneratedQuestion, VocabularyEntry } from "../types";

// --- Schema for generating questions ---
const questionResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      answer: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ["type", "question", "answer", "explanation"],
  },
};

// --- Schema for generating vocabulary notes ---
const vocabularyResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: "The extracted key vocabulary word." },
      definition: { type: Type.STRING, description: "A clear and concise definition in English (like in an English-English dictionary)." },
      synonyms: { type: Type.ARRAY, description: "An array of relevant synonyms in English.", items: { type: Type.STRING } },
      antonyms: { type: Type.ARRAY, description: "An array of relevant antonyms in English.", items: { type: Type.STRING } },
      exampleSentence: { type: Type.STRING, description: "The exact sentence from the passage where the word appears." },
    },
    required: ["word", "definition", "exampleSentence"],
  },
};


export async function generateQuestions(
  passage: string,
  questionConfig: Map<QuestionType, number>,
  difficulty: Difficulty,
  apiKey: string,
  signal?: AbortSignal
): Promise<GeneratedQuestion[]> {
  if (!apiKey) {
    throw new Error("API 키가 제공되지 않았습니다. API 키를 설정해주세요.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const difficultyInstruction = {
    [Difficulty.EASY]: "Questions should be straightforward, testing direct comprehension with clear answers and obvious distractors.",
    [Difficulty.NORMAL]: "Questions should be on par with the Korean CSAT (수능). They must require some analytical skill, and distractors should be plausible and based on common student mistakes.",
    [Difficulty.HARD]: "Questions should be highly challenging, requiring deep inferential reasoning. Distractors must be very subtle and nuanced, designed to trap even high-achieving students. The logic for the correct answer might be complex."
  }

  const requestedTypesString = Array.from(questionConfig.entries())
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${type} (${count}개)`)
    .join(", ");

  const prompt = `
    You are an expert creator of English exam questions for Korean high school students. Your goal is to create high-quality, challenging, and fair questions that accurately test a student's comprehension and analytical skills.

    **Crucial Instruction 1: Difficulty Level**
    Adjust the difficulty of ALL generated questions to the following level: **${difficulty}**.
    - **Difficulty Guideline:** ${difficultyInstruction[difficulty]}

    **Crucial Instruction 2: Exact Quantities**
    You MUST generate the EXACT number of questions specified for each type. This is not a suggestion but a strict requirement. For example, if '${QuestionType.FillInTheBlank} (3개)' is requested, you MUST generate exactly 3 '${QuestionType.FillInTheBlank}' questions.

    Based on the following passage, generate a set of questions for the requested types and quantities: **${requestedTypesString}**.

    General Rules:
    - All multiple-choice questions must have 5 options, unless it's a type like Word Scramble.
    - Provide all explanations in Korean.
    - The incorrect options (distractors) are as important as the correct answer. They should be plausible and based on common student mistakes or misinterpretations of the text. Avoid creating options that are obviously wrong or irrelevant.
    
    Specific Rules for Question Types:
    - ${QuestionType.MainIdea}: Multiple-choice. Options in English. Distractors should be subtly incorrect (too broad, too narrow).
    - ${QuestionType.Mood}: Multiple-choice. Options should be pairs of adjectives in English (e.g., 'anxious → relieved').
    - ${QuestionType.Claim}: Multiple-choice. Options MUST BE IN KOREAN.
    - ${QuestionType.InferentialMeaning}: Multiple-choice. Underline a phrase and ask for its contextual meaning. Options must be in English.
    - ${QuestionType.Comprehension}: Multiple-choice. Ask what is true ('일치') or not true ('불일치'). Options MUST BE IN KOREAN.
    - ${QuestionType.Grammar}: Multiple-choice. Present passage with five underlined parts (①-⑤), one is grammatically wrong.
    - ${QuestionType.Vocabulary}: Multiple-choice. Present passage with five underlined words (①-⑤), one is contextually wrong.
    - ${QuestionType.FillInTheBlank}: Multiple-choice. Replace a key phrase with a blank. 5 tempting English options.
    - ${QuestionType.IrrelevantSentence}: IMPORTANT: First, INSERT A NEW, ORIGINAL SENTENCE that is topically related but disrupts logical flow. Then, number all sentences ① to ⑤. The question asks to find the irrelevant sentence.
    - ${QuestionType.ReorderParagraph}: Divide the passage into three blocks (A), (B), (C) after an intro sentence. Ask for the correct order.
    - ${QuestionType.SentenceInsertion}: Provide a new sentence in a box. The passage must have insertion points [①], [②], etc.
    - ${QuestionType.SummaryCompletion}: One-sentence summary with two blanks, (A) and (B). Choose words from 5 options.
    - ${QuestionType.PronounReference}: Five underlined pronouns/phrases (①-⑤), ask which one refers to a different entity.
    - ${QuestionType.WordScramble}: (Non-multiple choice) Provide scrambled words of a key sentence. The 'answer' is the correct sentence.

    Return the output strictly in the specified JSON format.

    Passage:
    ---
    ${passage}
    ---
  `;

  try {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionResponseSchema,
      },
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const jsonString = response.text.trim();
    // Sometimes the model might return a markdown block
    const cleanedJsonString = jsonString.startsWith('```json') ? jsonString.replace(/^```json\n|```$/g, '') : jsonString;
    const generated = JSON.parse(cleanedJsonString) as GeneratedQuestion[];
    return generated;
  } catch (error) {
    console.error("Error generating questions from Gemini API:", error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new Error("AI로부터 받은 응답을 처리하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}

export async function generateVocabularyNotes(
  passage: string,
  apiKey: string,
  signal?: AbortSignal,
  words?: string[]
): Promise<VocabularyEntry[]> {
  if (!apiKey) {
    throw new Error("API 키가 제공되지 않았습니다. API 키를 설정해주세요.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const selectionInstruction = words && words.length > 0
    ? `Analyze ONLY the following user-selected words: ${words.join(', ')}.`
    : `Extract the 10 most essential and high-value vocabulary words from the provided passage. Select words that are distributed throughout the passage, not just clustered in one section.`;


  const prompt = `
    You are an expert English vocabulary analyst for advanced English learners.
    ${selectionInstruction}

    For each word, you MUST provide the following in ENGLISH:
    1.  **word**: The vocabulary word itself.
    2.  **definition**: A clear, concise definition in ENGLISH (like in an English-English dictionary).
    3.  **synonyms**: A list of 2-3 relevant synonyms in ENGLISH. If none, provide an empty array.
    4.  **antonyms**: A list of 1-2 relevant antonyms in ENGLISH. If none, provide an empty array.
    5.  **exampleSentence**: The exact sentence from the passage where the word is used.

    Focus on words that are crucial for understanding the passage's main idea and nuances (e.g., academic, abstract, or context-specific terms). Avoid overly simple or common words unless specified by the user.
    Return the output strictly in the specified JSON format.

    Passage:
    ---
    ${passage}
    ---
  `;

  try {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabularyResponseSchema,
      },
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.startsWith('```json') ? jsonString.replace(/^```json\n|```$/g, '') : jsonString;
    const notes = JSON.parse(cleanedJsonString) as VocabularyEntry[];
    return notes;
  } catch (error) {
    console.error("Error generating vocabulary notes from Gemini API:", error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new Error("AI로부터 받은 어휘 노트를 처리하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}