import { ReactNode } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication - NO PERIPHERALS',
  description: 'Login or register to access NO PERIPHERALS collective.',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex overflow-hidden">

      {/* Image side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/np1.jpg"
          alt="Background"
          fill
          className="object-cover opacity-40 blur-[2px]"
        />
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-red-900" />
              <h1 className="text-xs font-mono text-gray-400">NO PERIPHERALS</h1>
            </div>

            <h2 className="text-3xl font-bold text-white">
              ACCESS <span className="text-red-900">GRANTED</span>
            </h2>
          </div>

          {children}
        </div>
      </div>

    </div>
  );
}