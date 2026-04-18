import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('analyses').select('*').limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Supabase connection successful, but query failed. Make sure tables exist.',
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase is working perfectly!',
      data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Supabase. Check your URL and key.',
      error: String(error),
    }, { status: 500 });
  }
}
