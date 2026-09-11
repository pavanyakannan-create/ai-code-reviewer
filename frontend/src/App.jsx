
import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import ReactMarkdown from 'react-markdown'


const LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'SQL'
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
      return python()
  }
}


function App() {

  // =====================================================
  // LOGIN STATE
  // =====================================================

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('access_token') !== null
  )

  const [showLoginPassword, setShowLoginPassword] = useState(false)


  // =====================================================
  // SIGNUP STATE
  // =====================================================

  const [isSignup, setIsSignup] = useState(false)

  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const [signupError, setSignupError] = useState('')
  const [signupMessage, setSignupMessage] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  const [showSignupPassword, setShowSignupPassword] = useState(false)


  // =====================================================
  // CODE REVIEW STATE
  // =====================================================

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Python')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)


  // =====================================================
  // REVIEW HISTORY STATE
  // =====================================================

  const [showHistory, setShowHistory] = useState(false)
  const [reviews, setReviews] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)


  // =====================================================
  // LOGIN FUNCTION
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault()

    setLoginLoading(true)
    setLoginError('')

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      )

      const data = await response.json()

      // Backend returned an error
      if (!response.ok) {

        setLoginError(
          data.detail || 'Login failed'
        )

        return
      }

      // Store JWT token
      localStorage.setItem(
        'access_token',
        data.access_token
      )

      // Login successful
      setIsLoggedIn(true)

    } catch (error) {

      setLoginError(
        'Could not connect to the server.'
      )

    } finally {

      setLoginLoading(false)

    }
  }


  // =====================================================
  // SIGNUP FUNCTION
  // =====================================================

  const handleSignup = async (e) => {

    e.preventDefault()

    setSignupLoading(true)
    setSignupError('')
    setSignupMessage('')

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/signup',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            username: signupUsername,
            password: signupPassword,
          }),
        }
      )

      const data = await response.json()

      // Backend returned an error
      if (!response.ok) {

        setSignupError(
          data.detail || 'Signup failed'
        )

        return
      }

      // Signup successful
      setSignupMessage(
        'Account created successfully! Please sign in.'
      )

      // Clear signup fields
      setSignupUsername('')
      setSignupPassword('')

      // Move back to login page
      setTimeout(() => {

        setIsSignup(false)
        setSignupMessage('')

      }, 1500)

    } catch (error) {

      setSignupError(
        'Could not connect to the server.'
      )

    } finally {

      setSignupLoading(false)

    }
  }


  // =====================================================
  // CODE REVIEW FUNCTION
  // =====================================================

  const handleSubmit = async () => {
  setLoading(true)
  setSummary('')

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      'http://127.0.0.1:8000/review',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
          language: language,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setSummary(
        data.detail || 'Review failed'
      )
      return
    }

    setSummary(data.summary)

  } catch (error) {
    setSummary(
      'Error: could not reach the server.'
    )
  } finally {
    setLoading(false)
  }
}


  // =====================================================
  // REVIEW HISTORY FUNCTION
  // =====================================================

  const handleHistory = async () => {

    setHistoryLoading(true)

    try {

      const token = localStorage.getItem(
        'access_token'
      )

      const response = await fetch(
        'http://127.0.0.1:8000/reviews',
        {
          method: 'GET',

          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {

        console.error(
          data.detail || 'Failed to fetch history'
        )

        return
      }

      setReviews(data)
      setShowHistory(true)

    } catch (error) {

      console.error(
        'Could not fetch review history:',
        error
      )

    } finally {

      setHistoryLoading(false)

    }
  }


  // =====================================================
  // LOGOUT FUNCTION
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem('access_token')

    setIsLoggedIn(false)
    setShowHistory(false)

  }


  // =====================================================
  // LOGIN / SIGNUP SECTION
  // =====================================================

  if (!isLoggedIn) {


    // ===================================================
    // SIGNUP PAGE
    // ===================================================

    if (isSignup) {

      return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

            <h1 className="text-3xl font-bold text-center text-gray-800">
              Create Account
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Create your AI Code Reviewer account
            </p>


            <form onSubmit={handleSignup}>

              {/* Username */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) =>
                    setSignupUsername(e.target.value)
                  }
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>


              {/* Password */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) =>
                      setSignupPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSignupPassword(!showSignupPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={
                      showSignupPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showSignupPassword ? '🙈' : '👁️'}
                  </button>

                </div>

              </div>


              {/* Signup Error */}

              {signupError && (

                <p className="text-red-500 text-sm mb-4">
                  {signupError}
                </p>

              )}


              {/* Signup Success */}

              {signupMessage && (

                <p className="text-green-600 text-sm mb-4">
                  {signupMessage}
                </p>

              )}


              {/* Signup Button */}

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >

                {signupLoading
                  ? 'Creating account...'
                  : 'Sign Up'}

              </button>

            </form>


            {/* Move to Login */}

            <p className="text-center text-sm text-gray-500 mt-6">

              Already have an account?{' '}

              <button
                type="button"
                onClick={() => {

                  setIsSignup(false)
                  setSignupError('')
                  setSignupMessage('')

                }}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign In
              </button>

            </p>

          </div>

        </div>

      )
    }


    // ===================================================
    // LOGIN PAGE
    // ===================================================

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center text-gray-800">
            ReviewIQ
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Sign in to review your code
          </p>


          <form onSubmit={handleLogin}>

            {/* Username */}

            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            {/* Password */}

            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowLoginPassword(!showLoginPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showLoginPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showLoginPassword ? '🙈' : '👁️'}
                </button>

              </div>

            </div>


            {/* Login Error */}

            {loginError && (

              <p className="text-red-500 text-sm mb-4">
                {loginError}
              </p>

            )}


            {/* Login Button */}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >

              {loginLoading
                ? 'Signing in...'
                : 'Sign In'}

            </button>

          </form>


          {/* Signup Link */}

          <p className="text-center text-sm text-gray-500 mt-6">

            New user?{' '}

            <button
              type="button"
              onClick={() => {

                setIsSignup(true)
                setLoginError('')

              }}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </button>

          </p>

        </div>

      </div>

    )
  }


  // =====================================================
  // REVIEW HISTORY PAGE
  // =====================================================

  if (showHistory) {

    return (

      <div className="min-h-screen bg-gray-100 p-8">

        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-6">

            <h1 className="text-2xl font-bold">
              Review History
            </h1>

            <div className="flex gap-3">

              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Reviewer
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>

            </div>

          </div>


          {historyLoading ? (

            <p className="text-gray-600">
              Loading history...
            </p>

          ) : reviews.length === 0 ? (

            <div className="bg-white p-6 rounded-lg border">

              <p className="text-gray-600">
                No previous reviews found.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {reviews.map((review) => (

                <div
                  key={review.id}
                  className="bg-white p-5 rounded-lg border shadow-sm"
                >

                  <h3 className="font-medium text-gray-700 mb-2">
                    Code:
                  </h3>

                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm mb-4">
                    {review.code_snippet}
                  </pre>

                  <h3 className="font-medium text-gray-700 mb-2">
                    Review:
                  </h3>

                  <div className="prose prose-sm max-w-none">

                    <ReactMarkdown>
                      {review.review_result}
                    </ReactMarkdown>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    )
  }


  // =====================================================
  // CODE REVIEW PAGE
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">

          <h1 className="text-2xl font-bold">
            AI Code Reviewer
          </h1>

          <div className="flex gap-3">

            <button
              onClick={handleHistory}
              disabled={historyLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {historyLoading
                ? 'Loading...'
                : 'History'}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>

          </div>

        </div>


        {/* Language Selection */}

        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="mb-3 p-2 border rounded-md"
        >

          {LANGUAGES.map((lang) => (

            <option
              key={lang}
              value={lang}
            >
              {lang}
            </option>

          ))}

        </select>


        {/* Code Editor */}

        <div className="border rounded-md overflow-hidden">

          <CodeMirror
            value={code}
            height="300px"
            extensions={[
              getLanguageExtension(language)
            ]}
            onChange={(value) =>
              setCode(value)
            }
            basicSetup={{
              tabSize: 4
            }}
          />

        </div>


        {/* Review Button */}

        <button
          onClick={handleSubmit}
          disabled={loading || !code}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >

          {loading
            ? 'Reviewing...'
            : 'Review Code'}

        </button>


        {/* Review Result */}

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

