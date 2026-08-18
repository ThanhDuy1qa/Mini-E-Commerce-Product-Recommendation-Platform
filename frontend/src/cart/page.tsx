import Link from "next/link";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
        <form className="space-y-3">
          <input type="email" placeholder="Email" required className="w-full px-3 py-2 border rounded-lg" />
          <input type="password" placeholder="Password" required className="w-full px-3 py-2 border rounded-lg" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Sign In
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}