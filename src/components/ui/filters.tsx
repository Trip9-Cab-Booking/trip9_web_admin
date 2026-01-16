export default function CompactFilters({
  q,
  setQ,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  selectedMode,
  setSelectedMode,
  selectedStatus,
  setSelectedStatus,
  selectedTypes,
  toggleType,
  onClear,
}: {
  q: string;
  setQ: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  selectedMode: string | "";
  setSelectedMode: (v: string) => void;
  selectedStatus: string | "";
  setSelectedStatus: (v: string) => void;
  selectedTypes: string[];
  toggleType: (t: string) => void;
  onClear: () => void;
}) {
  const compactBtn = (active?: boolean) =>
    `px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors ${active ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-transparent text-gray-700 border-gray-200 dark:text-gray-300"
    }`;

  return (
    <section className="mb-6">
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-sm font-semibold">Filters</h2>
          {/* <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">Clear</button>
            <button onClick={() => window.location.reload()} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Refresh</button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-center">
          <div className="relative">
            <label className="sr-only">Search</label>
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search user / driver / txn id"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 w-full max-w-[130px] text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-transparent"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 w-full max-w-[130px] text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>

          <div>
            <label className="sr-only">Payment mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-2 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100"
            >
              <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                All modes
              </option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Netbanking</option>
              <option value="wallet">Wallet</option>
              <option value="cash">Cash</option>
            </select>

          </div>

          <div>
            <label className="sr-only">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100"
            >
              <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                All status
              </option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

          </div>
        </div>


        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["topup", "Topup"],
            ["subscription", "Subscription"],
          ].map(([val, label]) => {
            const active = selectedTypes.includes(String(val));
            return (
              <button key={val} onClick={() => toggleType(String(val))} className={compactBtn(active)} aria-pressed={active}>
                {label}
              </button>
            );
          })}

          <div className="ml-2 flex items-center text-xs text-gray-500">{selectedTypes.length ? `${selectedTypes.length} selected` : "All types"}</div>
        </div>
      </div>
    </section>
  );
}