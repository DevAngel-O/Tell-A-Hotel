import Link from 'next/link';
import { BsFillSendFill, BsTelephoneOutbound } from 'react-icons/bs';
import { BiMessageDetail } from 'react-icons/bi';

const Footer = () => {
  return (
    <footer className="mt-16">
      <div className="container mx-auto px-4">
        <Link href="/" className="font-black text-tertiary-dark">
          Tell-A-Hotel
        </Link>

        <h4 className="font-semibold text-[40px] py-6">Contact</h4>

        <div className="flex flex-wrap gap-16 items-center justify-between">
          <div className="flex-1">
            <p>Malindi Road, Mombasa - Kenya</p>
            <div className="flex items-center py-4">
              <BsFillSendFill />
              <p className="ml-2">Tell-A-Hotel</p>
            </div>
            <div className="flex items-center">
              <BsTelephoneOutbound />
              <p className="ml-2">+254 201 458 923</p>
            </div>
            <div className="flex items-center pt-4">
              <BiMessageDetail />
              <p className="ml-2">Tell-A-Hotel</p>
            </div>
          </div>

          <div className="flex-1 md:text-right">
            <Link href="/our-story" className="block pb-4">
              Our Story
            </Link>
            <Link href="/contact" className="block pb-4">
              Get in Touch
            </Link>
            <Link href="/our-privacy-commitment" className="block pb-4">
              Our Privacy Commitment
            </Link>
            <Link href="/terms-of-service" className="block pb-4">
              Terms of Service
            </Link>
            <Link href="/customer-assistance" className="block">
              Customer Assistance
            </Link>
          </div>

          <div className="flex-1 md:text-right">
            <Link href="/dining-experience" className="block pb-4">
              Dining Experience
            </Link>
            <Link href="/wellness" className="block pb-4">
              Wellness
            </Link>
            <Link href="/fitness" className="block pb-4">
              Fitness
            </Link>
            <Link href="/sports" className="block pb-4">
              Sports
            </Link>
            <Link href="/events" className="block">
              Events
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-tertiary-light h-10 md:h-[70px] mt-16 w-full bottom-0 left-0" />
    </footer>
  );
};

export default Footer;
