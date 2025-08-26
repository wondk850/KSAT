import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedQuestion, QuestionType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "The type of question.",
      },
      question: {
        type: Type.STRING,
        description: "The question text. For fill-in-the-blank, use '___' for the blank. For grammar/vocabulary questions, include the passage with numbered/underlined words.",
      },
      options: {
        type: Type.ARRAY,
        description: "An array of 5 options for multiple-choice questions. Not required for other types.",
        items: {
          type: Type.STRING,
        },
      },
      answer: {
        type: Type.STRING,
        description: "The correct answer. For multiple choice, this should be the full text of the correct option.",
      },
      explanation: {
        type: Type.STRING,
        description: "A brief explanation of why the answer is correct, in Korean.",
      },
    },
    required: ["type", "question", "answer", "explanation"],
  },
};

export async function generateQuestions(
  passage: string,
  questionTypes: QuestionType[]
): Promise<GeneratedQuestion[]> {
  const prompt = `
    You are an expert creator of English exam questions for Korean high school students. The questions should be similar in style to those found in the Korean CSAT (수능) or high school internal exams (내신).

    Based on the following passage, generate a set of questions.
    The question types required are: ${questionTypes.join(", ")}.
    
    Provide explanations in Korean.

    Please adhere to the following rules for each question type:
    - 주제/제목 찾기 (Main Idea/Title): Create a multiple-choice question asking for the main idea, topic, or best title for the passage. Provide 5 distinct options.
    - 내용 일치/불일치 (Comprehension - True/False): Create a multiple-choice question asking what is true or not true according to the passage. Provide 5 options.
    - 빈칸 추론 (Fill-in-the-Blank): Find a key sentence and remove a crucial phrase, replacing it with a blank (e.g., '_______'). The question should be multiple-choice with 5 options to fill the blank.
    - 어법성 판단 (Grammar Correction): Rewrite a portion of the text, underlining 5 parts and labeling them ①, ②, ③, ④, ⑤. One of these parts must contain a grammatical error. The 'question' field should contain this text followed by the question "위 글의 밑줄 친 부분 중, 어법상 틀린 것은?". The 'options' should be the 5 underlined phrases. The 'answer' should be the incorrect phrase.
    - 어휘 추론 (Vocabulary in Context): Similar to '어법성 판단', but the error should be a word used incorrectly in its context. Rewrite a portion of the text, underlining 5 words and labeling them ①, ②, ③, ④, ⑤. One of these words must be contextually inappropriate. The 'question' field should contain this text followed by the question "밑줄 친 부분 중 문맥상 낱말의 쓰임이 적절하지 않은 것은?". The 'options' should be the 5 underlined words. The 'answer' should be the incorrect word.
    - 문장 삽입 (Sentence Insertion): Provide a new sentence that logically fits somewhere in the passage. The question should be "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?" followed by the sentence to be inserted in a box. The passage in the 'question' field should have numbered insertion points like [①], [②], etc. The options should be ['①', '②', '③', '④', '⑤'].
    - 순서 배열 (Paragraph Ordering): The question should start with an introductory sentence from the passage. Then, present the rest of the passage divided into three blocks: (A), (B), and (C). The question prompt should be "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?". The 'question' field should contain the blocks. The options should be orderings like '(A)-(C)-(B)', '(B)-(A)-(C)', etc.
    - 요약문 완성 (Summary Completion): Provide a one-sentence summary of the passage with one or two blanks, (A) and (B). The question is to choose the words for the blanks from the options.
    - 서술형 (단어 배열) (Word Scramble): Select a key sentence from the passage. Provide the words in a scrambled order. The question must ask the user to arrange them into a correct sentence, possibly with a Korean translation hint. Do not provide options for this type. The 'answer' should be the correct, complete sentence.

    Return the output strictly in the specified JSON format. Ensure all multiple-choice questions have 5 options.

    Passage:
    ---
    ${passage}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const generatedData = JSON.parse(jsonText);

    if (Array.isArray(generatedData)) {
      return generatedData.map((item: any) => ({
        type: item.type as QuestionType,
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error generating questions from Gemini API:", error);
    throw new Error("AI로부터 받은 응답을 처리하는 데 실패했습니다. 모델이 유효하지 않은 형식을 반환했을 수 있습니다.");
  }
}
