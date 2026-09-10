import { useState } from 'react'

function App() {
  const [code, setCode] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setSummary('')
    try {
      const response = await fetch('http://127.0.0.1:8000/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      setSummary('Error: could not reach the server.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">AI Code Reviewer</h1>

      <textarea
        className="w-full h-48 p-3 border rounded-md font-mono text-sm"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !code}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
      >
        {loading ? 'Reviewing...' : 'Review Code'}
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-white border rounded-md whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  )
}

export default App