'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Post as PostType } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

function PostCard({ post }: { post: PostType }) {
  const { isAuthor } = useAuth();
  const postDate = post.createdAt instanceof Timestamp ? post.createdAt.toDate() : new Date();
  
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image 
          src={`https://placehold.co/600x400.png?random=${post.id}`} // Unique placeholder per post
          alt={post.title}
          layout="fill"
          objectFit="cover"
          data-ai-hint="abstract blog"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl hover:text-primary transition-colors">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription>
          By {post.authorDisplayName || post.authorEmail}
          <span className="mx-1">&bull;</span> 
          <time dateTime={postDate.toISOString()}>
            {formatDistanceToNow(postDate, { addSuffix: true })}
          </time>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 pt-4 border-t">
        <Button asChild variant="outline" size="sm">
          <Link href={`/post/${post.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View Post
          </Link>
        </Button>
        {isAuthor(post.authorId) && (
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/edit/${post.id}`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(q);
        const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostType));
        setPosts(postsList);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive py-10">{error}</div>;
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold text-primary-foreground mb-4">Discover Amazing Stories</h1>
        <p className="text-xl text-primary-foreground/90">
          Explore a world of ideas and perspectives on FireBlog.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-xl py-10">
          No posts available yet. Be the first to create one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
