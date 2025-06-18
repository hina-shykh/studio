'use client';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
       <header className="py-4 border-b">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <Link href="/" className="flex items-center gap-2 text-3xl font-headline text-primary hover:text-accent transition-colors">
            <BookOpen className="h-8 w-8" />
            FireBlog
          </Link>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground py-6 text-center">
        <p>&copy; {new Date().getFullYear()} FireBlog. All rights reserved.</p>
      </footer>
    </div>
  );
}
