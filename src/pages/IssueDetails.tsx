import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const VISITOR_KEY = "pulse_visitor_id"

type StatusHistory = {
  id: string
  status: string
  note: string | null
  createdAt: string
}

type Confirmation = {
  id: string
  visitorId: string
  createdAt: string
}

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
  statusHistory: StatusHistory[]
  confirmations: Confirmation[]
}

function getVisitorId() {
  const existingId = localStorage.getItem(VISITOR_KEY)

  if (existingId) {
    return existingId
  }

  const newId = crypto.randomUUID()

  localStorage.setItem(VISITOR_KEY, newId)

  return newId
}

function IssueDetails() {
  const { id } = useParams()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchIssue() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/issues/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch issue")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch issue")
        }

        const fetchedIssue = data.issue

        setIssue({
          ...fetchedIssue,
          statusHistory: Array.isArray(fetchedIssue.statusHistory)
            ? fetchedIssue.statusHistory
            : [],
          confirmations: Array.isArray(fetchedIssue.confirmations)
            ? fetchedIssue.confirmations
            : [],
        })

        setSelectedStatus(fetchedIssue.status)
      } catch (err) {
        console.error(err)
        setError("Could not load this issue.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchIssue()
    }
  }, [id])

  async function handleConfirm() {
    if (!id || !issue || confirming) {
      return
    }

    try {
      setConfirming(true)
      setMessage("")
      setError("")

      const visitorId = getVisitorId()

      const response = await fetch(`${API_URL}/issues/${id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Could not confirm this issue.")
        return
      }

      setIssue({
        ...issue,
        confirmations: [
          ...issue.confirmations,
          {
            id: crypto.randomUUID(),
            visitorId,
            createdAt: new Date().toISOString(),
          },
        ],
      })

      setMessage("Thanks! You confirmed this issue.")
    } catch (err) {
      console.error(err)

      setError(
        "Could not confirm this issue. Make sure the backend is running.",
      )
    } finally {
      setConfirming(false)
    }
  }

  async function handleStatusUpdate() {
    if (!id || !issue || updatingStatus) {
      return
    }

    if (selectedStatus === issue.status) {
      setMessage("The issue is already in this status.")
      return
    }

    try {
      setUpdatingStatus(true)
      setMessage("")
      setError("")

      const response = await fetch(`${API_URL}/issues/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Could not update the issue status.")
        return
      }

      setIssue({
        ...issue,
        status: selectedStatus,
        statusHistory: [
          ...issue.statusHistory,
          {
            id: crypto.randomUUID(),
            status: selectedStatus,
            note: null,
            createdAt: new Date().toISOString(),
          },
        ],
      })

      setMessage("Issue status updated successfully.")
    } catch (err) {
      console.error(err)

      setError(
        "Could not update the issue status. Make sure the backend is running.",
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-400">Loading issue...</p>
        </div>
      </main>
    )
  }

  if (error && !issue) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-400">{error}</p>

          <Link
            to="/explore"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2 font-medium text-slate-950"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    )
  }

  if (!issue) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/explore"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Explore
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">
                {issue.category}
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {issue.title}
              </h1>

              <p className="mt-2 text-slate-400">
                📍 {issue.location}
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-800 px-4 py-2 text-sm capitalize">
              {issue.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <p className="mt-2 leading-7 text-slate-400">
              {issue.description}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-500">
                Latitude
              </p>

              <p className="mt-1 font-mono text-sm">
                {issue.latitude}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-500">
                Longitude
              </p>

              <p className="mt-1 font-mono text-sm">
                {issue.longitude}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Community Confirmation
            </h2>

            <div className="mt-3 rounded-xl border border-slate-800 p-5">
              <p className="text-3xl font-bold">
                {issue.confirmations.length}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                people confirmed this issue
              </p>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
                className="mt-5 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirming
                  ? "Confirming..."
                  : "I can confirm this problem exists"}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Update Status
            </h2>

            <div className="mt-3 rounded-xl border border-slate-800 p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value)
                  }
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                >
                  <option value="reported">
                    Reported
                  </option>

                  <option value="verified">
                    Verified
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Status History
            </h2>

            <div className="mt-4 space-y-3">
              {issue.statusHistory.map((history) => (
                <div
                  key={history.id}
                  className="rounded-xl border border-slate-800 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium capitalize">
                      {history.status.replace("_", " ")}
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(history.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {history.note && (
                    <p className="mt-2 text-sm text-slate-400">
                      {history.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default IssueDetails