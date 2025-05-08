export async function chatLLM(prompt: string) {
    const res = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const { answer } = await res.json();
    return answer;
  }
  