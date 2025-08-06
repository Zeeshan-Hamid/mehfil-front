import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { useVendorStore } from '../../state/userStore';

const COLORS = ['#AF8EBA', '#A3ABBD', '#22B8ED', '#B2B2B2', '#FBCB2B'];

export default function AnalyticsContent() {
  const { vendorData } = useVendorStore();
  const analytics = vendorData?.analytics || {};

  // Mock fallback data for dev/demo
  const revenueByMonth = analytics.revenueByMonth || [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];
  const bookingsByMonth = analytics.bookingsByMonth || [
    { month: 'Jan', bookings: 0 },
    { month: 'Feb', bookings: 0 },
    { month: 'Mar', bookings: 0 },
    { month: 'Apr', bookings: 0 },
    { month: 'May', bookings: 0 },
    { month: 'Jun', bookings: 0 },
  ];
  const clientVisits = analytics.clientVisits || [
    { month: 'Jan', visits: 0 },
    { month: 'Feb', visits: 0 },
    { month: 'Mar', visits: 0 },
    { month: 'Apr', visits: 0 },
    { month: 'May', visits: 0 },
    { month: 'Jun', visits: 0 },
  ];
  const inquiryToBookingRate = analytics.inquiryToBookingRate || 0;
  const avgResponseTime = analytics.avgResponseTime || 0;
  const profileViewsByCountry = analytics.profileViewsByCountry || [
    { country: 'United States', value: 0 },
    { country: 'Canada', value: 0 },
    { country: 'Mexico', value: 0 },
    { country: 'Other', value: 0 },
  ];
  const popularServices = analytics.popularServices || [
    { service: 'Catering', count: 0 },
    { service: 'Decor', count: 0 },
    { service: 'Baking', count: 0 },
    { service: 'Events', count: 0 },
    { service: 'Wedding', count: 0 },
  ];

  return (
    <div className="analytics-grid-bg">
      {/* Revenue by Month */}
      <div className="analytics-card">
        <div className="analytics-card-title">Total Revenue</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueByMonth} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#AF8EBA" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Bookings by Month */}
      <div className="analytics-card">
        <div className="analytics-card-title">Total Bookings</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bookingsByMonth} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#9CAD89" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Client Visits */}
      <div className="analytics-card">
        <div className="analytics-card-title">Client Visits</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={clientVisits} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="visits" stroke="#F8C4B4" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Inquiry to Booking Rate (Donut) */}
      <div className="analytics-card analytics-card-row">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={[{ name: 'Rate', value: inquiryToBookingRate }, { name: 'Rest', value: 1 - inquiryToBookingRate }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              fill="#AF8EBA"
              startAngle={90}
              endAngle={-270}
            >
              <Cell key="rate" fill="#AF8EBA" />
              <Cell key="rest" fill="#F3E9F9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div className="analytics-card-title">Inquiry to Booking Rate</div>
          <div style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: 36, color: '#B2B2B2', marginBottom: 4 }}>{Math.round(inquiryToBookingRate * 100)}%</div>
          <div style={{ fontFamily: 'Fira Sans', fontWeight: 400, fontSize: 16, color: '#8A8A8A' }}>Avg response time: {avgResponseTime} hrs</div>
        </div>
      </div>
      {/* Profile Views by Country (Pie) */}
      <div className="analytics-card analytics-card-row">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={profileViewsByCountry}
              dataKey="value"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#AF8EBA"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {profileViewsByCountry.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 8 }}>
          <div className="analytics-card-title">Profile Views</div>
          {profileViewsByCountry.map((entry, idx) => (
            <span key={entry.country} style={{ color: COLORS[idx % COLORS.length], fontWeight: 600 }}>{entry.country}: {entry.value}%</span>
          ))}
        </div>
      </div>
      {/* Popular Services (Bar) */}
      <div className="analytics-card">
        <div className="analytics-card-title">Popular Services</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={popularServices} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#AF8EBA" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <style jsx>{`
        .analytics-grid-bg {
          width: 100vw;
          min-height: 80vh;
          display: grid;
          place-items: center;
          grid-template-columns: repeat(3, minmax(340px, 1fr));
          grid-template-rows: repeat(2, minmax(340px, 1fr));
          gap: 2.5vw;
          padding: 3vw 2vw 3vw 2vw;
          box-sizing: border-box;
          background: #F8F8FC;
          justify-items: center;
          align-items: center;
        }
        .analytics-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px #0001;
          padding: 2.5vw 2vw;
          min-width: 0;
          min-height: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2vw;
          position: relative;
          justify-content: flex-start;
        }
        .analytics-card-row {
          flex-direction: row;
          align-items: center;
          gap: 2vw;
        }
        .analytics-card-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.5vw;
          color: #000;
          margin-bottom: 1vw;
        }
        @media (max-width: 1200px) {
          .analytics-grid-bg {
            grid-template-columns: repeat(2, minmax(320px, 1fr));
            grid-template-rows: repeat(3, minmax(320px, 1fr));
            gap: 3vw;
          }
        }
        @media (max-width: 900px) {
          .analytics-grid-bg {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, minmax(260px, 1fr));
            gap: 4vw;
            padding: 4vw 2vw;
          }
          .analytics-card {
            padding: 6vw 4vw;
            border-radius: 12px;
          }
          .analytics-card-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
} 