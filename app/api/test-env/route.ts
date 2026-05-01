import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    openaiKeySet: !!process.env.OPENAI_API_KEY,
    openaiKeyStart: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.substring(0, 10) + '...'
      : 'not set',
  });
}
