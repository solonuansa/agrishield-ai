/**
 * Panel rekomendasi penanganan penyakit dari Gemini.
 * Me-render teks markdown sederhana (heading, bullet) tanpa library tambahan.
 */

interface RecommendationPanelProps {
  markdown: string;
}

export default function RecommendationPanel({ markdown }: RecommendationPanelProps) {
  // Render baris-per-baris dengan parsing minimal
  const lines = markdown.split("\n");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">💊 Rekomendasi Penanganan</h2>
      <div className="prose prose-sm prose-green max-w-none text-gray-700 space-y-1">
        {lines.map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h3 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-1 first:mt-0">
                {line.replace("## ", "")}
              </h3>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={i} className="ml-4 list-disc text-sm">
                {renderInline(line.slice(2))}
              </li>
            );
          }
          if (line.match(/^\d+\. /)) {
            const text = line.replace(/^\d+\. /, "");
            return (
              <li key={i} className="ml-4 list-decimal text-sm">
                {renderInline(text)}
              </li>
            );
          }
          if (line.trim() === "") {
            return <div key={i} className="h-1" />;
          }
          return (
            <p key={i} className="text-sm leading-relaxed">
              {renderInline(line)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/** Render bold (**text**) secara inline */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}
