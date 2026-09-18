import { Routes, Route, Link } from "react-router-dom"
import IssueCard from "./components/IssueCard"
import Explore from "./pages/Explore"
import Report from "./pages/Report"
import IssueDetails from "./pages/IssueDetails"

function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6">
        <Link to="/" className="text-2xl font-bold">
          PULSE
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/explore"
            className="text-slate-300 hover:text-white"
          >
            Explore
          </Link>

          <Link
            to="/report"
            className="rounded-lg bg-white px-5 py-2 text-slate-950 hover:bg-slate-200"
          >
            Report an Issue
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-8 py-24 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-400">
          Community-powered civic reporting
        </p>

        <h2 className="text-5xl font-bold tracking-tight md:text-7xl">
          Know what's happening
          <br />
          around you.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Report local problems, discover issues near you,
          and help your community get them resolved.
        </p>

        <Link
          to="/report"
          className="mt-8 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-slate-950 hover:bg-slate-200"
        >
          Report an Issue
        </Link>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-8 pb-20 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-4xl font-bold">Pulse</p>
          <p className="mt-2 text-slate-400">Community Reports</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-4xl font-bold">Map</p>
          <p className="mt-2 text-slate-400">Explore Nearby Issues</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-4xl font-bold">Verify</p>
          <p className="mt-2 text-slate-400">Confirm Real Problems</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-20">
        <h2 className="mb-8 text-3xl font-bold">
          How Pulse Works
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <IssueCard
            title="Report"
            location="Tell the community about a local problem"
            status="Step 1"
          />

          <IssueCard
            title="Verify"
            location="Community members confirm the problem"
            status="Step 2"
          />

          <IssueCard
            title="Resolve"
            location="Track the issue through its status"
            status="Step 3"
          />
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/report" element={<Report />} />
      <Route path="/issues/:id" element={<IssueDetails />} />
    </Routes>
  )
}

export default App