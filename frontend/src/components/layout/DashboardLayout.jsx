import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}