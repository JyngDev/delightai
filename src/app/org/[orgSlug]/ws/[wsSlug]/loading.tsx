export default function WorkspaceLoading() {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
          <div className="skeleton h-8 w-52 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-8 w-24 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Team metrics */}
      <div className="mt-8 mb-8">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl px-5 py-4" style={{ background: "#fafafa" }}>
              <div className="skeleton h-3 w-28 mb-3" />
              <div className="skeleton h-7 w-16 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Agents title row */}
      <div className="mt-8 mb-4 flex items-center justify-between">
        <div className="skeleton h-7 w-20 rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-8 w-52 rounded-md" />
          <div className="skeleton h-8 w-28 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ boxShadow: "rgba(0,0,0,0.07) 0px 0px 0px 1px" }}
          >
            {/* Status strip */}
            <div className="px-4 py-2.5" style={{ background: "#f9f9f9" }}>
              <div className="skeleton h-3 w-16" />
            </div>
            {/* Body */}
            <div className="px-4 pt-3.5 pb-4 flex flex-col gap-3 bg-white">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-3/4" />
              <div className="flex items-center gap-6 mt-1">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-5 w-10" />
                  <div className="skeleton h-2.5 w-12" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-5 w-8" />
                  <div className="skeleton h-2.5 w-10" />
                </div>
              </div>
              {/* Pipeline nodes */}
              <div className="flex items-center mt-1">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="skeleton w-2 h-2 rounded-full" />
                      <div className="skeleton h-2 w-5" />
                      <div className="skeleton h-2.5 w-8" />
                    </div>
                    {n < 2 && <div className="flex-1 mx-1.5 mb-4" style={{ height: "1px", background: "#e4e4e7" }} />}
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
              <div className="skeleton w-4 h-4 rounded-full" />
              <div className="skeleton h-3 w-32" />
            </div>
          </div>
        ))}
        {/* Add card placeholder */}
        <div className="rounded-xl min-h-35" style={{ border: "1.5px dashed #e4e4e7" }} />
      </div>
    </div>
  );
}
