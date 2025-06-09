'use client';

import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const NewsLetter = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const form = useRef<HTMLFormElement>(null);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.current) {
      setLoading(true);

      // Use environment variables
      emailjs
        .sendForm(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          form.current,
          {
            publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!, // Access the public key from environment
          }
        )
        .then(
          () => {
            setMessage('Thanks for subscribing!');
            form.current?.reset(); // Reset the form after success
          },
          (error) => {
            setMessage('Error submitting the form');
            console.error('FAILED...', error.text);
          }
        )
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <section className="container mx-auto px-4">
      <form
        ref={form}
        onSubmit={sendEmail}
        className="bg-primary text-white px-4 rounded-xl md:rounded-[30px] flex flex-col justify-center items-center py-6 md:py-24"
      >
        <p className="md:font-semibold text-lg md:text-xl text-center mb-3">
          Explore More About Our Hotel
        </p>
        <h6 className="md:font-semibold font-medium text-2xl md:text-3xl lg:text-5xl text-center">
          Sign Up for Our Newsletter
        </h6>

        <div className="flex-col justify-center w-full md:flex-row flex pt-12">
          <input
            type="email"
            placeholder="Your email"
            name="email"
            required
            className="bg-[#026057] h-11 md:h-16 mb-2 md:mb-0 rounded-xl pl-6 md:mr-5 md:w-[452px] text-white placeholder:text-white focus:outline-none"
          />
          <button type="submit" className="btn-tertiary" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>

        {message && <p className="text-white mt-4">{message}</p>}
      </form>
    </section>
  );
};

export default NewsLetter;
