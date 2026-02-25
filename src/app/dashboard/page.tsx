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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />
        <AlertBanner />
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Users" value={1200} description="Total users" />
            <Card title="Posts" value={350} description="Published posts" />
            <Card title="Revenue" value="$12,500" description="Monthly revenue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Monthly Users" data={chartData} />
            <ChartCard title="Revenue Trend" data={chartData} />
          </div>

          <div>
            <Table columns={tableColumns} data={tableData} />
          </div>
        </main>
      </div>
    </div>
  );
}
