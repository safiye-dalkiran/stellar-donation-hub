
export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          Stellar Spark
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Welcome to the Stellar Micro-Donation Hub. Connect your Freighter wallet to get started.
        </p>
      </main>
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © 2026 Stellar Spark. Built with React, Vite, Tailwind CSS v4, and Stellar.
      </footer>
    </div>
  )
}
