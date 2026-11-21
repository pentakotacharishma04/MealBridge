import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#164e3b', '#f28b44', '#2f7d5b', '#c9a227', '#6b8f7f', '#8a5a2b'];

/** Activity: donations posted vs portions delivered, per day. */
export function ActivityChart({ data }: { data: { label: string; donations: number; delivered: number }[] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#164e3b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#164e3b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e0d4" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="delivered" name="Portions delivered" stroke="#164e3b" fill="url(#gDelivered)" strokeWidth={2} />
          <Area type="monotone" dataKey="donations" name="Donations posted" stroke="#f28b44" fill="#f28b44" fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Category distribution donut. */
export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Simple trend bars (weekly / monthly). */
export function TrendBars({ data, color = '#164e3b' }: { data: { label: string; value: number }[]; color?: string }) {
  return (
    <div className="chart-box small-h">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e0d4" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Portions" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
