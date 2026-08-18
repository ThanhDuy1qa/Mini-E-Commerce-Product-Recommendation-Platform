import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">MiniShop</Link>
          <div className="space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}