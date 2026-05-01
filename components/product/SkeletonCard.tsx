import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
