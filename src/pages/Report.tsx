import { useState } from "react"

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function Report() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  function getLocation() {
    setError("")
    setMessage("Getting your location...")

    if (!navigator.geolocation) {
      setMessage("")
      setError("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString())
        setLongitude(position.coords.longitude.toString())
        setMessage("Location captured successfully.")
      },
      () => {
        setMessage("")
        setError(
          "Could not get your location. Please enter coordinates manually.",
        )
      },
    )
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage("")
    setError("")

    if (
      !title ||
      !category ||
      !description ||
      !location ||
      !latitude ||
      !longitude
    ) {
      setError("Please fill in all required fields.")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          description,
          location,
          latitude: Number(latitude),
          longitude: Number(longitude),
          imageUrl: null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.duplicate) {
          setError(
            "A similar issue has already been reported nearby.",
          )
        } else {
          setError(data.message || "Failed to submit report.")
        }

        return
      }

      setMessage("Issue reported successfully!")
      setTitle("")
      setCategory("")
      setDescription("")
      setLocation("")
      setLatitude("")
      setLongitude("")
      setPhoto(null)
    } catch {
      setError(
        "Could not connect to the Pulse server. Make sure the backend is running.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div>
          <h1 className="text-4xl font-bold">
            Report an Issue
          </h1>

          <p className="mt-3 text-slate-400">
            Help your community by reporting a problem in your area.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Issue Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Large pothole near main road"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300 outline-none focus:border-slate-600"
            >
              <option value="">Select a category</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage</option>
              <option value="streetlight">Streetlight</option>
              <option value="water">Water Leakage</option>
              <option value="drainage">Drainage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the problem and provide any useful details..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="e.g. Alpha 1, Greater Noida"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Coordinates
            </label>

            <button
              type="button"
              onClick={getLocation}
              className="mb-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              📍 Use My Location
            </button>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(event) =>
                  setLatitude(event.target.value)
                }
                placeholder="Latitude"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-600"
              />

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(event) =>
                  setLongitude(event.target.value)
                }
                placeholder="Longitude"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selectedFile =
                  event.target.files?.[0] ?? null

                setPhoto(selectedFile)
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-medium file:text-slate-950"
            />

            {photo && (
              <p className="mt-2 text-sm text-slate-500">
                Selected: {photo.name}
              </p>
            )}
          </div>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Report