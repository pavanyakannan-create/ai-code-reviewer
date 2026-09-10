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
      return python()
  }
}

function App() {
  // ---------------- LOGIN STATE ----------------
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // ---------------- CODE REVIEW STATE ----------------
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Python')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  // ---------------- LOGIN FUNCTION ----------------
  const handleLogin = async (e) => {
    e.preventDefault()

    setLoginLoading(true)
    setLoginError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.detail || 'Login failed')
        return
      }

      // Save JWT token
      localStorage.setItem('access_token', data.access_token)

      // Show Code Reviewer
      setIsLoggedIn(true)

    } catch (error) {
      setLoginError('Could not connect to the server.')
    } finally {
      setLoginLoading(false)
    }
  }

  // ---------------- CODE REVIEW FUNCTION ----------------
  const handleSubmit = async () => {
    setLoading(true)
    setSummary('')

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch('http://127.0.0.1:8000/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSummary(data.detail || 'Review failed')
        return
      }

      setSummary(data.summary)

    } catch (error) {
      setSummary('Error: could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  // ---------------- LOGIN PAGE ----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center text-gray-800">
            AI Code Reviewer
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Sign in to review your code
          </p>

          <form onSubmit={handleLogin}>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm mb-4">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

        </div>
      </div>
    )
  }

  // ---------------- CODE REVIEW PAGE ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">
          AI Code Reviewer
        </h1>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-3 p-2 border rounded-md"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
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
            <ReactMarkdown>
              {summary}
            </ReactMarkdown>
          </div>
        )}

      </div>

    </div>
  )
}

export default App