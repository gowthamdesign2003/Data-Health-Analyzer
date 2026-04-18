import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('=== SUPABASE SAVE STARTED ===');
    console.log('File:', body.fileName);
    console.log('Columns:', body.columnStats?.length);

    const { fileName, columnStats, aiInsights, reportData } = body;

    if (!fileName || !columnStats) {
      return NextResponse.json(
        { success: false, error: 'Missing data' },
        { status: 400 }
      );
    }

    // Insert analysis with AI insights and report data!
    console.log('Step 1: Saving analysis with AI insights and report...');
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({ 
        file_name: fileName,
        ai_insights: aiInsights || null,
        report_data: reportData || null
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Analysis error:', analysisError);
      throw analysisError;
    }

    console.log('✅ Analysis saved with AI insights and report:', analysis?.id);

    // Insert column stats
    console.log('Step 2: Saving column stats...');
    const statsToInsert = columnStats.map((stat: any) => ({
      analysis_id: analysis.id,
      column_name: stat.columnName,
      total_rows: stat.totalRows,
      non_null_count: stat.nonNullCount,
      null_count: stat.nullCount,
      fill_rate: stat.fillRate,
    }));

    const { data: stats, error: statsError } = await supabase
      .from('column_stats')
      .insert(statsToInsert)
      .select();

    if (statsError) {
      console.error('Stats error:', statsError);
      throw statsError;
    }

    console.log('✅ Column stats saved:', stats?.length);
    console.log('=== SUPABASE SAVE COMPLETE ===');

    return NextResponse.json({
      success: true,
      message: 'All data saved to Supabase!',
    });
  } catch (error: any) {
    console.error('=== SUPABASE SAVE FAILED ===');
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Save failed' },
      { status: 500 }
    );
  }
}
