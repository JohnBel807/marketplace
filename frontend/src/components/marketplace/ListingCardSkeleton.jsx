export default function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-8 w-20 ml-auto" />
          <div className="skeleton h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
