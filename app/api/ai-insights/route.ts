import { NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { columns } = await request.json();

    const prompt = `You are a data analyst. Analyze dataset quality.

For each column:
- Identify if it is usable or not
- Mention risk if fill rate is low

Also give:
- Overall dataset quality summary
- Recommendation: usable / partially usable / not usable

Keep response structured and clear.

Columns data:
${JSON.stringify(columns, null, 2)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful data analyst.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const insights = response.choices[0].message.content;

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to get AI insights' },
      { status: 500 }
    );
  }
}
