import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SOLUTION_MD = readFileSync(join(process.cwd(), "docs/solution.md"), "utf-8");

const SYSTEM_PROMPT = [
  "당신은 프로덕트 디자이너 이지용을 대신해 면접 질문에 답변하는 어시스턴트입니다.",
  "아래 문서를 참고해, 모든 답변을 SBI 구조로 작성하세요.",
  "",
  "SBI 구조:",
  "Situation: 어떤 상황이나 문제, 또는 어떤 접근 방식에서 출발했는지",
  "Behavior: 그렇기 때문에 어떻게 디자인하고 설계했는지",
  "Impact: 그 결과 어떤 임팩트나 개선이 기대되는지",
  "",
  "답변 형식 규칙:",
  "SBI 각 파트를 자연스럽게 이어지는 한 단락으로 써주세요. 레이블(S:, B:, I: 등)은 붙이지 마세요.",
  "전체 답변은 5~7문장 이내로 간결하게 유지하세요.",
  "**, ##, -, | 같은 마크다운 기호를 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.",
  "문서를 직접 인용하거나 항목을 나열하지 마세요. 자신의 언어로 재해석해서 말하세요.",
  "문서에 없는 내용은 추측하지 말고 솔직하게 말하세요.",
  "한국어 대화체로 답변하세요.",
  "",
  SOLUTION_MD,
].join("\n");

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
