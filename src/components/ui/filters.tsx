import { useRef } from "react";

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

  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);


  return (
    <section className="mb-6">
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2 px-2">
          <h2 className="text-sm font-semibold">Filters</h2>
          {/* <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">Clear</button>
            <button onClick={() => window.location.reload()} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Refresh</button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-center">
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

          <div className="flex flex-nowrap lg:flex-nowrap items-center gap-2">
            <div className="relative min-w-32.5 max-w-32.5 w-full">
              <input
                ref={fromDateRef}
                type="date"
                value={dateFrom}
                max="9999-12-31"
                onChange={(e) => setDateFrom(e.target.value)}
                className="
        w-full px-2 py-1 pr-8
        text-sm rounded-md
        border border-gray-200 dark:border-gray-700
        bg-transparent
        text-gray-900 dark:text-gray-100
        focus:ring-2 focus:ring-indigo-400
      "
              />

              <button
                type="button"
                onClick={() => {
                  const el = fromDateRef.current;
                  if (!el) return;
                  if (el.showPicker) el.showPicker();
                  else el.focus();
                }}
                className="
        absolute right-2 top-1/2 -translate-y-1/2
        text-gray-400 hover:text-gray-600
        dark:text-gray-400 dark:hover:text-gray-200
      "
                aria-label="Open calendar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
                  />
                </svg>
              </button>
            </div>

            <span className="text-gray-400 text-xs whitespace-nowrap">to</span>
            <div className="relative min-w-32.5 max-w-32.5 w-full">
              <input
                ref={toDateRef}
                type="date"
                value={dateTo}
                max="9999-12-31"
                onChange={(e) => setDateTo(e.target.value)}
                className="
        w-full px-2 py-1 pr-8
        text-sm rounded-md
        border border-gray-200 dark:border-gray-700
        bg-transparent
        text-gray-900 dark:text-gray-100
        focus:ring-2 focus:ring-indigo-400
      "
              />

              <button
                type="button"
                onClick={() => {
                  const el = toDateRef.current;
                  if (!el) return;
                  if (el.showPicker) el.showPicker();
                  else el.focus();
                }}
                className="
        absolute right-2 top-1/2 -translate-y-1/2
        text-gray-400 hover:text-gray-600
        dark:text-gray-400 dark:hover:text-gray-200
      "
                aria-label="Open calendar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center lg:ml-4" >
            <label className="sr-only">Payment mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="  w-[80%] min-w-35 px-2 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              className="w-[80%] px-2 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 
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