import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await sendMessage({}, formData);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}