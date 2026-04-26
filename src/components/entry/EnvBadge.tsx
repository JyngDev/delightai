type Env = "development" | "staging" | "production";

const ENV_CONFIG: Record<Env, { label: string; bg: string; text: string }> = {
  development: { label: "D", bg: "#ebf5ff", text: "#0068d6" },
  staging: { label: "S", bg: "#fff7ed", text: "#c2410c" },
  production: { label: "P", bg: "#f0fdf4", text: "#15803d" },
};

interface EnvBadgeProps {
  env: Env;
  active: boolean;
  version?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function EnvBadge({ env, active, version, onClick }: EnvBadgeProps) {
  const config = ENV_CONFIG[env];

  if (!active) {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold"
        style={{ background: "#f4f4f5", color: "#a1a1aa" }}
        title={`${env} (inactive)`}
      >
        {config.label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[10px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
      style={{
        background: config.bg,
        color: config.text,
        padding: "0 7px",
        height: "20px",
        minWidth: "20px",
      }}
      title={version ? `${env} ${version}` : env}
      onClick={onClick}
    >
      {config.label}
    </span>
  );
}
