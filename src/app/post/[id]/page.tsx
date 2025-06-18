'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit3, Trash2, ArrowLeft, CalendarDays, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { currentUser, isAuthor } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const postDocRef = doc(db, 'posts', postId);
          const postDocSnap = await getDoc(postDocRef);
          if (postDocSnap.exists()) {
            setPost({ id: postDocSnap.id, ...postDocSnap.data() } as Post);
            setError(null);
          } else {
            setError('Post not found.');
            setPost(null);
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Failed to load post. Please try again later.");
          setPost(null);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId]);

  const handleDelete = async () => {
    if (!post || !isAuthor(post.authorId)) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not authorized to delete this post.' });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast({ title: 'Success', description: 'Post deleted successfully.' });
      router.push('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete post.' });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive py-10 text-xl">{error}</div>;
  }

  if (!post) {
    return <div className="text-center text-muted-foreground py-10 text-xl">Post not found.</div>;
  }

  const postDate = post.createdAt instanceof Timestamp ? post.createdAt.toDate() : new Date();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to posts
      </Button>
      <Card className="shadow-xl overflow-hidden">
        <div className="relative w-full h-72 md:h-96">
          <Image 
            src={`https://placehold.co/800x400.png?random=${post.id}`} // Unique placeholder
            alt={post.title}
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="technology blog"
          />
        </div>
        <CardHeader className="pt-6">
          <CardTitle className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2 space-y-1">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>By {post.authorDisplayName || post.authorEmail}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              <time dateTime={postDate.toISOString()}>
                Published on {format(postDate, "MMMM d, yyyy 'at' h:mm a")}
              </time>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none py-6 text-foreground/90 whitespace-pre-wrap">
          {/* Using whitespace-pre-wrap to respect newlines from textarea */}
          {post.content}
        </CardContent>
        {currentUser && isAuthor(post.authorId) && (
          <CardFooter className="flex justify-end gap-3 py-4 border-t">
            <Button asChild variant="outline">
              <Link href={`/edit/${post.id}`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Yes, delete post
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
