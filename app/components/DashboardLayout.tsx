"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

type Role = "management" | "principal" | "teachers" | "students" | "admin";

type Props = {
  children: ReactNode;
  role: Role;
};

const roleLinksMap: Record<Role, { name: string; path: string }[]> = {
  management: [
    { name: "Dashboard", path: "/management/dashboard" },
    { name: "Reports", path: "/management/reports" },
    { name: "Employees", path: "/management/employees" },
    { name: "Attendence", path: "/management/attendence" },
    { name: "Monthly Report", path: "/management/management_monthly_report" },
    { name: "Finance", path: "/management/finance" },
    { name: "Projects", path: "/management/projects" },
    { name: "Notice", path: "/management/notice" },
    { name: "Calender", path: "/management/calender" },
    { name: "Raise Issues", path: "/management/management_issues" },
    { name: "Profile", path: "/management/profile" },
  ],
  principal: [
    { name: "Tasks", path: "/principal/tasks" },
    { name: "Reports", path: "/principal/reports" },
    { name: "Team", path: "/principal/team" },
    { name: "LeaveApprovals", path: "/principal/leaveapprovals" },
    { name: "Attendence", path: "/principal/attendence" },
    { name: "Monthly Report", path: "/principal/principal_monthly_report" },
    { name: "Notice", path: "/principal/notice" },
    { name: "Calender", path: "/principal/calender" },
    { name: "Raise Issues", path: "/principal/principal_issues" },
    { name: "Projects", path: "/principal/principal_projects" },
    { name: "Resigned Employee", path: "/principal/resigned_employee" },
    { name: "Profile", path: "/principal/profile" },
  ],
  teachers: [
    { name: "Employees", path: "/teachers/employee" },
    { name: "Leaves", path: "/teachers/leaves" },
    { name: "Attendance", path: "/teachers/attendance" },
    { name: "Monthly Report", path: "/teachers/teachers_monthly_report" },
    { name: "Payroll", path: "/teachers/payroll" },
    { name: "Onboarding", path: "/teachers/onboarding" },
    { name: "Offboarding", path: "/teachers/offboarding" },
    { name: "Calender", path: "/teachers/calender" },
    { name: "Notice", path: "/teachers/notice" },
    { name: "Raise Issues", path: "/teachers/teachers_issues" },
    { name: "Issue Documents", path: "/teachers/documents" },
    { name: "HR Careers", path: "/teachers/hrcareers" },
    { name: "Projects", path: "/teachers/hr_projects" },
    { name: "Profile", path: "/teachers/profile" },
  ],
  students: [
    { name: "Dashboard", path: "/students/dashboard" },
    { name: "Tasks", path: "/students/tasks" },
    { name: "Attendance", path: "/students/attendance" },
    { name: "Leaves", path: "/students/leaves" },
    { name: "Payroll", path: "/students/payroll" },
    { name: "Calender", path: "/students/calender" },
    { name: "Notice", path: "/students/notice" },
    { name: "KRA & KPA", path: "/students/Kra&Kpa" },
    { name: "Raise Issues", path: "/students/students_issues" },
    { name: "Projects", path: "/students/students_projects" },
    { name: "Resign", path: "/students/students_resign" },
    { name: "Profile", path: "/students/profile" },
  ],
  admin: [
    { name: "Attendence", path: "/admin/admin_attendence" },
    { name: "Students", path: "/admin/admin_students" },
    { name: "documents", path: "/admin/admin_documents" },
    { name: "Approvals", path: "/admin/admin_approval" },
    { name: "Calender", path: "/admin/admin_calender" },
    { name: "Notice", path: "/admin/admin_notice" },
    { name: "Raise Issues", path: "/admin/admin_issues" },
    { name: "Profile", path: "/admin/admin_profile" },
  ],
};

export default function DashboardLayout({ children, role }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/");
  };

  const roleLinks = roleLinksMap[role];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg flex-col z-20">
        <div className="p-6 flex items-center gap-4 border-b border-blue-700">
          <Image
            src="/default-profile.png"
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full border-2 border-white shadow-md object-cover w-16 h-16"
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-white">
              Welcome
            </p>
            <p className="text-sm text-blue-200">{role.toUpperCase()}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col p-4 space-y-2">
          {roleLinks?.map((link) => (
            <Link
              href={link.path}
              key={link.name}
              className="px-4 py-2 rounded-lg transition-all font-medium hover:bg-blue-500 hover:shadow-md"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-blue-800">
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg flex flex-col z-40">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-3 right-3 text-white"
            >
              <FiX size={24} />
            </button>

            <div className="p-4 flex flex-col items-center gap-2 border-b border-blue-700">
              <Image
                src="/default-profile.png"
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full border-2 border-white shadow-md object-cover w-14 h-14"
              />
              <div className="text-center">
                <p className="text-md font-semibold text-white">Welcome</p>
                <p className="text-xs text-blue-200 uppercase">{role.toUpperCase()}</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto flex flex-col p-2 space-y-1">
              {roleLinks?.map((link) => (
                <Link
                  href={link.path}
                  key={link.name}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg transition-all font-medium text-sm hover:bg-blue-500 hover:shadow-md"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="sticky bottom-0 p-3 bg-gradient-to-t from-blue-800">
              <button
                onClick={() => {
                  setLogoutModalOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLogoutModalOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-0 md:ml-72">
        <header className="fixed top-0 left-0 right-0 md:left-72 bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200 sticky z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="md:hidden text-blue-700"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="text-2xl font-semibold text-blue-700 tracking-wide">
              {role.toUpperCase()} Dashboard
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => router.push(`/${role}/profile`)}
              className="focus:outline-none"
            >
              <Image
                src="/default-profile.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border border-gray-300 shadow-md object-cover w-10 h-10 cursor-pointer"
              />
            </button>
          </div>
        </header>

        <div className="pt-20 p-6 flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}