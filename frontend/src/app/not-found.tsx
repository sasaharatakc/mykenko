import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-primary-500">404</p>
        <h1 className="font-display text-2xl font-bold text-gray-900 mt-4">Page not found</h1>
        <p className="text-gray-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/shop" className="btn border border-gray-200 text-gray-700 hover:bg-gray-50">Browse Shop</Link>
        </div>
      </div>
    </div>
  )
}
