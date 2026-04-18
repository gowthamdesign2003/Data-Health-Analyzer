import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say hello!' },
      ],
      max_tokens: 10,
    });

    return NextResponse.json({
      success: true,
      message: 'OpenAI API key is working perfectly!',
      response: response.choices[0].message.content,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      type: error.type,
    }, { status: 500 });
  }
}
