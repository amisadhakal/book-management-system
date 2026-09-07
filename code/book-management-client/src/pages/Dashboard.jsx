import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi, coverImageUrl } from "../api/client";

const COLORS = [
  "#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4",
  "#a855f7","#ec4899","#84cc16","#0ea5e9","#f97316",
];

const TOOLTIP_STYLE = {
  backgroundColor: "#171b2e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "#f0f2ff",
  fontSize: "0.82rem",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch(() => setError("Couldn't load dashboard data. Is the API running?"));
  }, []);

  if (error) return <p className="error-banner">⚠️ {error}</p>;
  if (!data)
    return (
      <div className="loading-spinner">
        <div className="spinner-ring" />
        Loading dashboard…
      </div>
    );

  const priceDistribution = Object.entries(data.priceDistribution || {}).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Library analytics and statistics</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard icon="📚" label="Total Books" value={data.totalBooks} />
        <StatCard icon="💰" label="Inventory Value" value={`$${data.totalInventoryValue.toFixed(2)}`} />
        <StatCard icon="📊" label="Average Price" value={`$${data.averagePrice.toFixed(2)}`} />
        <StatCard icon="✍️" label="Authors" value={data.totalAuthors} />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <ChartCard title="Books per Genre">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.booksPerGenre}
                dataKey="count"
                nameKey="genre"
                outerRadius={88}
                innerRadius={40}
                paddingAngle={3}
                label={({ genre, percent }) => `${genre} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.booksPerGenre.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Books per Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.booksPerStatus}
                dataKey="count"
                nameKey="status"
                outerRadius={88}
                innerRadius={40}
                paddingAngle={3}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.booksPerStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Books by Published Year">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.booksPerPublishedYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: "#6b72a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#6b72a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Authors">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.topAuthors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: "#6b72a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="author" width={110} tick={{ fill: "#c4c9e0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="bookCount" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: "#6b72a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#6b72a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recently Added */}
      <h2 className="section-title">Recently Added</h2>
      <div className="book-grid">
        {data.recentlyAdded.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card">
            <div className="book-cover">
              {book.coverImagePath ? (
                <img src={coverImageUrl(book.coverImagePath)} alt={book.title} loading="lazy" />
              ) : (
                <div className="cover-placeholder">
                  <span className="cover-placeholder-icon">📖</span>
                  No Cover
                </div>
              )}
            </div>
            <div className="book-card-body">
              <h3>{book.title}</h3>
              <p className="muted">{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
