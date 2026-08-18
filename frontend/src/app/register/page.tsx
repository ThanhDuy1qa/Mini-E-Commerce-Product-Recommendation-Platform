import Link from "next/link";

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create a New Account</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Create a password (min 6 chars)" />
          </div>
          <button type="submit" className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold">Register Now</button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}