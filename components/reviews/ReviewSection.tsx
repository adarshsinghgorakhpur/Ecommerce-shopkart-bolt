'use client';

import { useState, useMemo } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
}

type SortOption = 'newest' | 'rating';

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function ReviewSection({ productId, reviews }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Rating summary
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const ratingBreakdown = useMemo(() => {
    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
      return { star, count };
    });
    return breakdown;
  }, [reviews]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    return sorted;
  }, [reviews, sortBy]);

  const handleSubmit = () => {
    if (formRating === 0 || !formTitle.trim() || !formComment.trim()) return;

    // In a real app, this would call an API to submit the review
    console.log('Submitting review:', {
      productId,
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
    });

    // Reset form
    setFormRating(0);
    setFormTitle('');
    setFormComment('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        {/* Average + Stars */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
          <StarDisplay rating={averageRating} size="lg" />
          <span className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex flex-1 flex-col gap-1.5">
          {ratingBreakdown.map(({ star, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-right">{star} star</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Write Review Button */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 self-start"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Write a Review
        </Button>
      </div>

      <Separator />

      {/* Write Review Form */}
      {showForm && (
        <div className="space-y-4 rounded-lg border p-4 md:p-6">
          <h3 className="text-lg font-semibold">Write a Review</h3>

          {/* Star Rating Selector */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      i < (hoverRating || formRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Summarize your experience"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Your Review</label>
            <Textarea
              placeholder="Tell others about your experience with this product..."
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={formRating === 0 || !formTitle.trim() || !formComment.trim()}
            >
              Submit Review
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sort Controls + Review Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('rating')}
          >
            Rating
          </Button>
        </div>
      </div>

      <Separator />

      {/* Review List */}
      {sortedReviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {review.rating}
                    </Badge>
                    {review.is_verified_purchase && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold">{review.title}</h4>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeDate(review.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
