'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { currentUser, isAuthor, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!postId || !currentUser) {
      // This should ideally be handled by withAuth, but as a fallback:
      if(!currentUser) router.replace('/login');
      return;
    }

    const fetchPost = async () => {
      setIsFetching(true);
      try {
        const postDocRef = doc(db, 'posts', postId);
        const postDocSnap = await getDoc(postDocRef);

        if (postDocSnap.exists()) {
          const postData = { id: postDocSnap.id, ...postDocSnap.data() } as Post;
          if (!isAuthor(postData.authorId)) {
             setError('You are not authorized to edit this post.');
             toast({ variant: 'destructive', title: 'Unauthorized', description: 'You cannot edit this post.' });
             router.replace(`/post/${postId}`);
             return;
          }
          setOriginalPost(postData);
          setTitle(postData.title);
          setContent(postData.content);
          setError(null);
        } else {
          setError('Post not found.');
          toast({ variant: 'destructive', title: 'Error', description: 'Post not found.' });
          router.replace('/');
        }
      } catch (err) {
        console.error("Error fetching post for edit:", err);
        setError("Failed to load post data.");
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load post data.' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPost();
  }, [postId, currentUser, router, toast, isAuthor, authLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !originalPost || !isAuthor(originalPost.authorId)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unauthorized or post data missing.' });
      return;
    }
    setIsLoading(true);

    try {
      const postDocRef = doc(db, 'posts', postId);
      await updateDoc(postDocRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success!', description: 'Your post has been updated.' });
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update post. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching || authLoading) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <p className="text-destructive text-xl mb-4">{error}</p>
        <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Go Home</Button>
      </div>
    );
  }

  if (!originalPost) { // Should be covered by error state, but good fallback
    return <div className="text-center text-muted-foreground py-10 text-xl">Loading post data or post not found.</div>;
  }


  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Edit Post</CardTitle>
          <CardDescription>Refine your story and share your updates.</CardDescription>
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
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" className="text-lg py-3 px-6" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(EditPostPage);
