"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AlertBanner from "@/components/AlertBanner";
import Card from "@/components/Card";
import ChartCard from "@/components/ChartCard";
import Table from "@/components/Table";

export default function DashboardPage() {
  const chartData = [
    { name: "Jan", value: 30 },
    { name: "Feb", value: 50 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 40 },
  ];

  const tableColumns = ["Name", "Email", "Role"];
  const tableData = [
    { Name: "John Doe", Email: "john@example.com", Role: "Admin" },
    { Name: "Jane Smith", Email: "jane@example.com", Role: "Editor" },
    { Name: "Bob Johnson", Email: "bob@example.com", Role: "User" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex h-screen">
        {/* Sidebar sa pozadinom */}
        <Sidebar />

        {/* Glavni sadržaj */}
        <main className="flex-1 overflow-auto">
          {/* Alert full-width, van padding-a */}
          <AlertBanner />

          {/* Sadržaj sa padding-om */}
          <div className="p-6 space-y-6">
            {/* Kartice */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Users" value={1200} description="Total users" />
              <Card title="Posts" value={350} description="Published posts" />
              <Card title="Revenue" value="$12,500" description="Monthly revenue" />
            </div>

            {/* Grafikoni */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Monthly Users" data={chartData} />
              <ChartCard title="Revenue Trend" data={chartData} />
            </div>

            {/* Tabela */}
            <div className="overflow-auto">
              <Table columns={tableColumns} data={tableData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
