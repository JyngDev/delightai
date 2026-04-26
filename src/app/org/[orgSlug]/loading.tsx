export default function OrgLoading() {
  return (
    <div className="px-8 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="skeleton h-9 w-48 rounded-lg" />
        <div className="skeleton h-8 w-20 rounded-md" />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-8 w-24 rounded-md" />
          <div className="skeleton h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Workspace cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ boxShadow: "rgba(0,0,0,0.07) 0px 0px 0px 1px" }}
          >
            <div className="px-5 py-4 bg-white flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
                <div className="skeleton h-4 w-32" />
              </div>
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
              <div className="flex items-center gap-4 mt-1">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
