type IssueCardProps = {
  title: string
  location: string
  status: string
}

function IssueCard({
  title,
  location,
  status,
}: IssueCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-slate-400">
        {location}
      </p>

      <span className="mt-4 inline-block rounded-lg bg-slate-800 px-3 py-1 text-sm">
        {status}
      </span>

    </div>
  )
}

export default IssueCard