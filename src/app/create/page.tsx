'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import type { Post } from '@/types';

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a post.' });
      return;
    }
    setIsLoading(true);

    try {
      const newPost: Omit<Post, 'id'> = {
        title,
        content,
        authorId: currentUser.uid,
        authorEmail: currentUser.email || 'Unknown Email',
        authorDisplayName: currentUser.displayName || 'Anonymous User',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      toast({ title: 'Success!', description: 'Your post has been created.' });
      router.push(`/post/${docRef.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create post. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Create a New Post</CardTitle>
          <CardDescription>Share your thoughts with the world.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your Awesome Post Title"
                required
                className="text-xl py-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your amazing story here..."
                required
                rows={15}
                className="text-base leading-relaxed"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto text-lg py-3 px-6" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-5 w-5" />
              )}
              Publish Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(CreatePostPage);
