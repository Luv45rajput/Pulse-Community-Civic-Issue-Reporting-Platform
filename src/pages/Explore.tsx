import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Map from "../components/Map"

const API_URL = "http://localhost:5000/api"

type Issue = {
  id: string
  title: string
  description: string
  category: string
  status: string
  location: string
  latitude: number
  longitude: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

function Explore() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/issues`)

        if (!response.ok) {
          throw new Error("Failed to fetch issues")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch issues")
        }

        setIssues(data.issues)
      } catch (err) {
        console.error(err)
        setError("Could not load issues. Make sure the backend is running.")
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

  const filteredIssues = issues.filter((issue) => {
    const searchText = search.toLowerCase().trim()

    const matchesSearch =
      searchText === "" ||
      issue.title.toLowerCase().includes(searchText) ||
      issue.description.toLowerCase().includes(searchText) ||
      issue.location.toLowerCase().includes(searchText)

    const matchesCategory =
      category === "all" || issue.category === category

    const matchesStatus =
      status === "all" || issue.status === status

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          Explore Issues
        </h1>

        <p className="mt-3 text-slate-400">
          Discover problems reported by the community.
        </p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search issues..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="streetlight">Streetlight</option>
            <option value="water">Water</option>
            <option value="drainage">Drainage</option>
            <option value="other">Other</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
            Loading issues...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-6">
              <p className="text-sm text-slate-400">
                Showing {filteredIssues.length} of {issues.length} issues
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <Map issues={filteredIssues} />
            </div>

            {filteredIssues.length === 0 && (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <h2 className="text-xl font-semibold">
                  No issues found
                </h2>

                <p className="mt-2 text-slate-400">
                  Try changing your search or filters.
                </p>
              </div>
            )}

            {filteredIssues.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {filteredIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issues/${issue.id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {issue.title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                          {issue.location}
                        </p>
                      </div>

                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs capitalize">
                        {issue.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                      {issue.description}
                    </p>

                    <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                      {issue.category}
                    </p>

                    <p className="mt-4 text-sm font-medium text-white">
                      View issue →
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default Explore