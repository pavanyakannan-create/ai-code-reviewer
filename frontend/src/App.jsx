import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import ReactMarkdown from 'react-markdown'

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL'
]

// Map dropdown language to a CodeMirror language extension
const getLanguageExtension = (lang) => {
  switch (lang) {
    case 'Python':
      return python()
    case 'JavaScript':
    case 'TypeScript':
      return javascript()
    case 'Java':
    case 'Kotlin':
      return java()
    case 'C':
    case 'C++':
    case 'C#':
      return cpp()
    default:
      return python() // fallback: at least get indentation behavior
  }
}

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Python')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setSummary('')
    try {
      const response = await fetch('http://127.0.0.1:8000/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
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

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mb-3 p-2 border rounded-md"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      <div className="border rounded-md overflow-hidden">
        <CodeMirror
          value={code}
          height="300px"
          extensions={[getLanguageExtension(language)]}
          onChange={(value) => setCode(value)}
          basicSetup={{ tabSize: 4 }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !code}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
      >
        {loading ? 'Reviewing...' : 'Review Code'}
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-white border rounded-md prose prose-sm max-w-none">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default App