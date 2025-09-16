function Login() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-semibold mb-2">Login</h1>
          <p className="text-gray-600 mb-5">Access your Jeewan Jyoti account</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="email" className="block mb-1 font-semibold">Email</label>
            <input id="email" type="email" placeholder="you@example.com" required className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
            <label htmlFor="password" className="block mt-4 mb-1 font-semibold">Password</label>
            <input id="password" type="password" placeholder="••••••••" required className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
            <button type="submit" className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Sign in</button>
          </form>
          <a href="/register" className="inline-block mt-4 text-blue-600 hover:text-blue-700">Don’t have an account? Register</a>
        </div>
      </div>
    </div>
  )
}

export default Login 