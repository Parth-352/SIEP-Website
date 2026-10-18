import { NextRequest, NextResponse } from 'next/server';
import { recordInquiry } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, organization, email, phone, message } = body;

    // Validate essential fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Record inquiry into server backup store
    const savedInquiry = recordInquiry({
      name: String(name).trim(),
      organization: organization ? String(organization).trim() : undefined,
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      message: String(message).trim(),
    });

    // 2. Dispatch static mail to ebikeclubcoe@snjb.org via Google Apps Script Web App
    const gasUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
    let mailForwarded = false;

    if (gasUrl) {
      try {
        const gasRes = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'sendInquiryMail',
            to: 'ebikeclubcoe@snjb.org',
            name: savedInquiry.name,
            organization: savedInquiry.organization,
            email: savedInquiry.email,
            phone: savedInquiry.phone,
            message: savedInquiry.message,
          }),
        });

        if (gasRes.ok) {
          mailForwarded = true;
        }
      } catch (gasErr) {
        console.error('Google Apps Script mail transmission error:', gasErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been successfully sent to the team.',
      inquiryId: savedInquiry.id,
      mailForwarded,
    });
  } catch (err: unknown) {
    console.error('Contact API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
