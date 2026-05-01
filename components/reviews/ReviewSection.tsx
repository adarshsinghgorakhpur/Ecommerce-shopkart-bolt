'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Review } from '@/types';

interface Props { productId: string; reviews: Review[]; }

export default function ReviewSection({ reviews }: Props) {
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => ({
    rating: r, count: reviews.filter(rev => rev.rating === r).length,
    percent: reviews.length ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.rating - a.rating;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ratings & Reviews</h2>
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold">{avgRating}</div>
          <div className="flex items-center justify-center md:justify-start gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
          <div className="mt-4 space-y-1.5">
            {ratingBreakdown.map(r => (
              <div key={r.rating} className="flex items-center gap-2 text-sm">
                <span className="w-3">{r.rating}</span><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${r.percent}%` }} /></div>
                <span className="w-8 text-right text-xs text-muted-foreground">{r.count}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" size="sm" onClick={() => setShowForm(!showForm)}><MessageSquare className="mr-1 h-4 w-4" /> Write a Review</Button>
        </div>
        <div>
          {showForm && (
            <div className="mb-6 rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Write a Review</h3>
              <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <button key={i} onClick={() => setNewRating(i + 1)}><Star className={`h-6 w-6 ${i < newRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} /></button>)}</div>
              <Input placeholder="Review title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} />
              <div className="flex gap-2"><Button size="sm" onClick={() => setShowForm(false)}>Submit Review</Button><Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{reviews.length} reviews</span>
            <div className="flex gap-1">
              <Button size="sm" variant={sortBy === 'newest' ? 'default' : 'ghost'} onClick={() => setSortBy('newest')}>Newest</Button>
              <Button size="sm" variant={sortBy === 'rating' ? 'default' : 'ghost'} onClick={() => setSortBy('rating')}>Top Rated</Button>
            </div>
          </div>
          <div className="space-y-4">
            {sortedReviews.map(review => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">{review.rating} <Star className="h-2.5 w-2.5 fill-white" /></span>
                  {review.is_verified_purchase && <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">Verified Purchase</span>}
                </div>
                {review.title && <h4 className="font-medium text-sm mt-1">{review.title}</h4>}
                <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
