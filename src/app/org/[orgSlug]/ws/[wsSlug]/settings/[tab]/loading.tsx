export default function WsSettingsLoading() {
  return (
    <div className="px-10 pt-15 pb-10">
      <div className="skeleton h-7 w-32 rounded-lg mb-6" />
      <div className="flex flex-col gap-6 max-w-lg">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        ))}
        <div className="skeleton h-9 w-24 rounded-lg mt-2" />
      </div>
    </div>
  );
}
