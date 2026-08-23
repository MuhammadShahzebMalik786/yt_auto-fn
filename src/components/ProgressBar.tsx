interface ProgressBarProps {
  current: number;
  total: number;
  isGenerating?: boolean;
}

export default function ProgressBar({ current, total, isGenerating = false }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  
  // Decide color based on percentage or state
  let colorClass = "from-purple-500 to-blue-500";
  if (percentage === 100) colorClass = "from-green-500 to-emerald-400";
  else if (isGenerating) colorClass = "from-purple-500 to-indigo-500";

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 font-medium">Progress</span>
        <span className={percentage === 100 ? "text-green-400 font-bold" : "text-purple-400 font-bold"}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {isGenerating && percentage < 100 && (
            <div className="absolute inset-0 progress-striped opacity-30"></div>
          )}
          {percentage === 100 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}
