import { Loader2 } from "lucide-react"

export default function LoadingSpinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin ${className}`} />
    </div>
  )
}
