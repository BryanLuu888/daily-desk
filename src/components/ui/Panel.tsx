interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
