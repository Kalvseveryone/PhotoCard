'use client';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function PhotoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2 border border-gray-100 rounded-sm">
      <Skeleton className="aspect-[4/5] w-full rounded-sm" />
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-2 w-1/4" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center py-8 space-y-4">
      <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="w-full mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {[...Array(6)].map((_, i) => (
          <PhotoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b border-gray-50">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
