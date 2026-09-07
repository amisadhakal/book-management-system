import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#84cc16", "#0ea5e9", "#f97316"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch(() => setError("Couldn't load dashboard data. Is the API running?"));
  }, []);

  if (error) return <p className="error-banner">{error}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  const priceDistribution = Object.entries(data.priceDistribution || {}).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-cards">
        <StatCard label="Total Books" value={data.totalBooks} />
        <StatCard label="Inventory Value" value={`$${data.totalInventoryValue.toFixed(2)}`} />
        <StatCard label="Average Price" value={`$${data.averagePrice.toFixed(2)}`} />
        <StatCard label="Authors" value={data.totalAuthors} />
      </div>

      <div className="chart-grid">
        <ChartCard title="Books per Genre">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.booksPerGenre}
                dataKey="count"
                nameKey="genre"
                outerRadius={90}
                label={(entry) => entry.genre}
              >
                {data.booksPerGenre.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Books per Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.booksPerStatus} dataKey="count" nameKey="status" outerRadius={90} label={(entry) => entry.status}>
                {data.booksPerStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Books by Published Year">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.booksPerPublishedYear}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Authors">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topAuthors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="author" width={110} />
              <Tooltip />
              <Bar dataKey="bookCount" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2>Recently Added</h2>
      <div className="book-grid">
        {data.recentlyAdded.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card">
            <div className="book-cover">
              {book.coverImagePath ? (
                <img src={coverImageUrl(book.coverImagePath)} alt={book.title} />
              ) : (
                <div className="cover-placeholder">No Cover</div>
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

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
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
