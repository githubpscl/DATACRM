export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Seite</h1>
        <p className="text-gray-600">Diese Seite funktioniert, wenn Next.js korrekt läuft.</p>
        <p className="text-sm text-gray-500 mt-4">
          URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
        </p>
      </div>
    </div>
  )
}
