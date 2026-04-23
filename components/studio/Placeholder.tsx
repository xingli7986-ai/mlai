export default function Placeholder({
  no,
  title,
}: {
  no: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <div
        className="text-xs font-semibold tracking-widest"
        style={{ color: "#C8A875" }}
      >
        {no}
      </div>
      <h1
        className="mt-2 text-2xl font-semibold sm:text-3xl"
        style={{ color: "#F4EFE6" }}
      >
        {title}
      </h1>
      <p className="mt-3 text-sm sm:text-base" style={{ color: "#987283" }}>
        开发中 · 即将推出
      </p>
    </div>
  );
}
