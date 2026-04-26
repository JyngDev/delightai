interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: "default" | "danger";
  topPadding?: string;
}

export default function SettingsSection({
  title,
  description,
  children,
  actions,
  headerAction,
  variant = "default",
  topPadding,
}: SettingsSectionProps) {
  const isDanger = variant === "danger";
  return (
    <>
      <div className={`pb-10 ${topPadding ?? "pt-10 first:pt-0"}`}>
        <div
          className="rounded-lg bg-white"
          style={{
            background: isDanger ? "#fef9f9" : "#ffffff",
            borderTop: isDanger ? "1px solid rgba(220,38,38,0.15)" : "none",
          }}
        >
          {(title || description || headerAction) && (
            <div className="px-0 py-1">
              <div className="flex items-center justify-between">
                {title && (
                  <h3
                    className={`text-[16px] font-semibold ${isDanger ? "text-[#dc2626]" : "text-[#171717]"}`}
                    style={{ letterSpacing: "-0.2px" }}
                  >
                    {title}
                  </h3>
                )}
                {headerAction && <div>{headerAction}</div>}
              </div>
              {description && (
                <p className="text-[14px] text-[#888888] leading-relaxed">{description}</p>
              )}
            </div>
          )}

          <div>{children}</div>

          {actions && (
            <>
              <div style={{ borderTop: isDanger ? "1px solid rgba(220,38,38,0.15)" : "1px solid #f4f4f5" }} />
              <div className="px-5 py-3 flex justify-end gap-2">{actions}</div>
            </>
          )}
        </div>
      </div>
      {!isDanger && <div className="last:hidden" style={{ borderBottom: "1px solid #f4f4f5" }} />}
    </>
  );
}

export function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 pt-4 pb-3">
      <div>
        <p className="text-[14px] font-medium text-[#4d4d4d]">{label}</p>
        {hint && <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Input({ value, placeholder, disabled }: { value?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      defaultValue={value}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full text-[14px] text-[#171717] px-3 rounded-md bg-white outline-none transition-all disabled:bg-[#fafafa] disabled:text-[#a1a1aa]"
      style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", height: "42px" }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.15) 0px 0px 0px 1px, rgba(59,130,246,0.3) 0px 0px 0px 3px"; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px"; }}
    />
  );
}

export function Select({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  return (
    <div className="relative inline-block">
      <select
        defaultValue={defaultValue}
        className="appearance-none text-[14px] text-[#171717] pl-3 pr-8 py-1.5 rounded-md bg-white outline-none cursor-pointer"
        style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
      >
        {children}
      </select>
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none"
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function SaveActions() {
  return (
    <>
      <button className="px-3 py-1.5 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        Discard
      </button>
      <button className="px-3 py-1.5 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity" style={{ background: "#171717" }}>
        Save
      </button>
    </>
  );
}

export function PageHeader(_: { title: string; description?: string }) {
  return null;
}
