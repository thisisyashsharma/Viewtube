// /mnt/data/ReportHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null); // selected report for detail view
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const PAGE_SIZE = 8;

  useEffect(() => {
    fetchReports();
  }, [page, filter, query]);

// replace fetchReports in ReportHistory.jsx with this:
async function fetchReports() {
  setLoading(true);
  try {
    const res = await axios.get("/api/v1/reports", { withCredentials: true });
    // expect: { reports: [...], totalPages }
    setReports(res.data.reports || res.data.data || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    console.warn("Reports fetch failed — falling back to localStorage:", err?.message || err);
    // If API returns 404 (not implemented) or any error, read localStorage
    const local = JSON.parse(localStorage.getItem("local_reports") || "[]");
    if (local && local.length) {
      // Make sure the shape matches what UI expects
      setReports(local);
      setTotalPages(1);
    } else {
      // no local reports either
      setReports([]);
      setTotalPages(1);
    }
  } finally {
    setLoading(false);
  }
}


  async function fetchReportDetail(reportId) {
    try {
      const res = await axios.get(`/api/v1/reports/${reportId}`);
      setSelected(res.data.report);
    } catch (err) {
      console.error('Failed to fetch report detail', err);
    }
  }

  function openDetail(report) {
    setSelected(report);
    if (!report.full) fetchReportDetail(report._id || report.id);
  }

  async function withdrawReport(id) {
    if (!confirm('Withdraw this report?')) return;
    try {
      await axios.post(`/api/v1/reports/${id}/withdraw`);
      // optimistic update
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'withdrawn' } : r));
      if (selected && (selected._id === id || selected.id === id))
        setSelected(prev => prev ? { ...prev, status: 'withdrawn' } : prev);
    } catch (err) {
      console.error('Failed to withdraw', err);
      alert('Failed to withdraw report.');
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gray-50 dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Report History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your reports for videos and their status.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by video title or reason"
              className="flex-1 md:flex-none w-full md:w-64 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="review">Under Review</option>
              <option value="closed">Closed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <div className="col-span-full text-center p-6 text-gray-500 dark:text-gray-400">Loading…</div>}

            {!loading && reports.length === 0 && (
              <div className="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">No reports found.</div>
            )}

            {reports.map((r) => (
              <div key={r._id || r.id} className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <img src={r.videoThumbnail || r.thumbnail || '/src/assets/img/video-placeholder.jpg'} alt={r.videoTitle || 'video'} className="w-24 h-14 object-cover rounded" />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-xs">{r.videoTitle || 'Untitled video'}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Reported: {formatDistanceToNow(new Date(r.createdAt || r.date || Date.now()))} ago</div>
                      </div>

                      <div className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ background: r.status === 'closed' ? '#6b7280' : r.status === 'review' ? '#f59e0b' : r.status === 'withdrawn' ? '#ef4444' : '#10b981' }}>
                        {r.status || 'open'}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">Reason: {r.reason || 'N/A'}</div>

                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => openDetail(r)} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">View</button>
                      <a href={r.videoUrl || '#'} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm">video</a>
                      {r.status !== 'withdrawn' && r.status !== 'closed' && (
                        <button onClick={() => withdrawReport(r._id || r.id)} className="px-3 py-1 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50">Withdraw</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* detail drawer/modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="relative w-full md:w-3/4 lg:w-1/2 bg-white dark:bg-[#0f0f0f] rounded-t-xl md:rounded-xl p-4 md:p-6 shadow-xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report details</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Video: {selected.videoTitle}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs px-2 py-1 rounded-full text-white" style={{ background: selected.status === 'closed' ? '#6b7280' : selected.status === 'review' ? '#f59e0b' : selected.status === 'withdrawn' ? '#ef4444' : '#10b981' }}>{selected.status}</div>
                  <button onClick={() => setSelected(null)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Close</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img src={selected.videoThumbnail || '/src/assets/img/video-placeholder.jpg'} alt="thumb" className="w-full h-40 object-cover rounded" />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Reported by you on {new Date(selected.createdAt).toLocaleString()}</div>
                  <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">Reason: <span className="font-medium text-gray-900 dark:text-gray-100">{selected.reason}</span></div>

                  {selected.notes && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Your notes</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{selected.notes}</p>
                    </div>
                  )}

                  {selected.actions && selected.actions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Moderator actions</h3>
                      <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {selected.actions.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex gap-2">
                    {selected.status !== 'withdrawn' && selected.status !== 'closed' && (
                      <button onClick={() => withdrawReport(selected._id || selected.id)} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">Withdraw report</button>
                    )}
                    <a href={selected.videoUrl || '#'} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded">video</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
