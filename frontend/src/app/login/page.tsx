import Link from "next/link";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl space-y-4">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">Login</h1>
        <p className="text-center text-gray-500 mb-6">Welcome back to MiniShop!</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-4"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-sm text-center text-gray-600 pt-4 border-t border-gray-100">
          Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}