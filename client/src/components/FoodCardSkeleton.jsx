export default function FoodCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 rounded" />
        
        {/* Description */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
        </div>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
