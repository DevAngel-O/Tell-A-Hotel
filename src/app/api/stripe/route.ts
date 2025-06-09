import Stripe from 'stripe';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis'; // Your function to fetch the room details
import { createBooking, updateHotelRoom } from '@/libs/apis'; // Sanity functions to create a booking and update room status
import nodemailer from 'nodemailer'; // Import Nodemailer

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

type RequestData = {
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children: number;
  numberOfDays: number;
  hotelRoomSlug: string;
};

type SendEmailParams = {
  customerName: string;
  bookingId: string;
  roomName: string;
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  adults: number;
  children: number;
  totalPrice: string;
  userEmail: string;
};

async function sendEmail({
  customerName,
  bookingId,
  roomName,
  checkinDate,
  checkoutDate,
  numberOfDays,
  adults,
  children,
  totalPrice,
  userEmail,
}: SendEmailParams): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail or your preferred SMTP service
    auth: {
      user: process.env.NEXT_NODEMAIL_GMAIL_USER, // Your Gmail account
      pass: process.env.NEXT_NODEMAIL_GMAIL_PASS, // Your Gmail password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: 'Booking Confirmation',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - Booking Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: 2px solid #f1c40f;
          }
          h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
          }
          p {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .invoice-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
          }
          .invoice-table th, .invoice-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .invoice-table th {
            background-color: #f1c40f;
            color: white;
          }
          .invoice-table td {
            background-color: #f9f9f9;
          }
          .total-price {
            font-size: 1.2em;
            font-weight: bold;
            color: #e67e22;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #888;
          }
          .button {
            background-color: #2ecc71;
            color: white;
            padding: 10px 20px;
            text-align: center;
            display: inline-block;
            font-weight: bold;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Booking Invoice</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for booking with us! Below are the details of your reservation:</p>
          <table class="invoice-table">
            <tr><th>Booking ID</th><td>${bookingId}</td></tr>
            <tr><th>Hotel Room</th><td>${roomName}</td></tr>
            <tr><th>Check-in Date</th><td>${checkinDate}</td></tr>
            <tr><th>Check-out Date</th><td>${checkoutDate}</td></tr>
            <tr><th>Number of Days</th><td>${numberOfDays}</td></tr>
            <tr><th>Adults</th><td>${adults}</td></tr>
            <tr><th>Children</th><td>${children}</td></tr>
            <tr><th>Total Price</th><td class="total-price">$${totalPrice}</td></tr>
          </table>
          <a href="http://localhost:3000/" class="button">Visit Your Booking</a>
          <p>We look forward to hosting you! If you have any questions, feel free to contact us.</p>
          <div class="footer">
            <p>Best regards,</p>
            <p>Tell-A-Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function POST(req: Request, res: Response) {
  const {
    checkinDate,
    adults,
    checkoutDate,
    children,
    hotelRoomSlug,
    numberOfDays,
  }: RequestData = await req.json();

  // Log the incoming request data to inspect it
  console.log('Incoming request data:', {
    checkinDate,
    adults,
    checkoutDate,
    children,
    hotelRoomSlug,
    numberOfDays,
  });

  // Validate the input fields
  if (
    !checkinDate ||
    !checkoutDate ||
    !adults ||
    !hotelRoomSlug ||
    !numberOfDays
  ) {
    console.log('Missing required fields');
    return new NextResponse('Please all fields are required', { status: 400 });
  }

  const origin = req.headers.get('origin');
  console.log('Request Origin:', origin);

  // Get the user session (check if the user is authenticated)
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Authentication required');
    return new NextResponse('Authentication required', { status: 400 });
  }

  const userId = session.user.id;
  const formattedCheckoutDate = checkoutDate.split('T')[0];
  const formattedCheckinDate = checkinDate.split('T')[0];

  try {
    // Fetch the room details using the hotelRoomSlug
    const room = await getRoom(hotelRoomSlug);
    console.log('Room fetched:', room);

    const discountPrice = room.price - (room.price / 100) * room.discount;
    const totalPrice = discountPrice * numberOfDays;
    console.log('Calculated total price:', totalPrice);

    // Create a Stripe payment session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: room.name,
              images: room.images.map((image) => image.url),
            },
            unit_amount: parseInt((totalPrice * 100).toString()), // Stripe expects the amount in cents
          },
        },
      ],
      payment_method_types: ['card'],
      success_url: `${origin}/users/${userId}?roomId=${room._id}`,
      metadata: {
        adults,
        checkinDate: formattedCheckinDate,
        checkoutDate: formattedCheckoutDate,
        children,
        hotelRoom: room._id,
        numberOfDays,
        user: userId,
        discount: room.discount,
        totalPrice,
      },
    });

    console.log('Stripe Session created:', stripeSession);

    // Create the booking in Sanity after successful payment (this assumes the payment is successful)
    await createBooking({
      adults,
      checkinDate: formattedCheckinDate,
      checkoutDate: formattedCheckoutDate,
      children,
      discount: room.discount,
      hotelRoom: room._id,
      numberOfDays,
      totalPrice,
      user: userId,
    });

    // Update the room status to "booked" in Sanity
    await updateHotelRoom(room._id);

    // Send the booking confirmation email via Nodemailer
    await sendEmail({
      customerName: session.user.name ?? 'Customer',
      bookingId: stripeSession.id,
      roomName: room.name,
      checkinDate: formattedCheckinDate,
      checkoutDate: formattedCheckoutDate,
      numberOfDays,
      adults,
      children,
      totalPrice: totalPrice.toFixed(2),
      userEmail: session.user.email ?? 'customer@email.com', // Assuming the user email is available in session
    });

    // Return the Stripe session details in the response
    return NextResponse.json(stripeSession, {
      status: 200,
      statusText:
        'Payment session created, booking stored in Sanity, and email sent.',
    });
  } catch (error: any) {
    console.log('Payment failed:', error);

    // Log the full error response for debugging
    if (error.response) {
      console.log('Sanity API Error Response:', error.response.data);
    } else {
      console.log('Error without response:', error.message);
    }

    return new NextResponse(error.message, { status: 500 });
  }
}
