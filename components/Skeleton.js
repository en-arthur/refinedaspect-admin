export default function Skeleton({ w = "100%", h = "1rem", className = "" }) {
  return (
    <div
      className={className}
      style={{
        width: w, height: h,
        background: "var(--surface-2)",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }}
    />
  );
}
