import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { state, category, count } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stateStr = state || 'Texas';
  const categoryStr = category || 'Life Insurance Basics';
  const questionCount = Math.min(count || 10, 20);

  const prompt = `Generate exactly ${questionCount} ${stateStr} Life and Health Insurance exam simulation questions in the category "${categoryStr}" in a pop quiz format.

Return ONLY a valid JSON array, no markdown, no code blocks, no explanation. Each object must have:
- "id": sequential number starting at 1
- "category": "${categoryStr}"
- "question": the question text
- "options": array of exactly 4 answer choices
- "correctIndex": index (0-3) of the correct answer
- "rationale": brief explanation of why the answer is correct, including any ${stateStr}-specific details

Focus on concepts that are commonly tested on the ${stateStr} state licensing exam. Include state-specific regulations where relevant.

Return ONLY the JSON array, nothing else.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Parse the JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const questions = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ questions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
