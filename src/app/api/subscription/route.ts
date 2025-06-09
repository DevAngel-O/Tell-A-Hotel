// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

export async function POST(req: NextRequest) {
  const { email }: { email?: string } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    // Initialize EmailJS
    emailjs.init({
      publicKey: 'zHOafXo9C2oKxa8qp',
      // Do not allow headless browsers
      // blockHeadless: true,
      blockList: {
        // Block the suspended emails
        list: ['foo@emailjs.com', 'bar@emailjs.com'],
        // The variable contains the email address
        watchVariable: 'userEmail',
      },
    });

    const serviceID = 'service_uhwqkrp';
    const templateID = 'template_fay440c';

    // Send the email via EmailJS
    await emailjs.send(serviceID, templateID, { email });

    return NextResponse.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
