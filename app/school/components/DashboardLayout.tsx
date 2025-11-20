"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

type Role = "management" | "principal" | "teachers" | "students" | "admin" | "parents";

type Props = {
  children: ReactNode;
  role: Role;
};

const roleLinksMap: Record<Role, { name: string; path: string }[]> = {
  parents:[
    { name: "Dashboard", path: "/school/parents/parents_dashboard" },
    { name: "Attendence", path: "/school/parents/parents_attendence" },
    { name: "Reports", path: "/school/parents/parents_report" },
    { name: "Fees", path: "/school/parents/parents_fees" },
    { name: "Activites", path: "/school/parents/parents_activities" },
    { name: "Notices", path: "/school/parents/parents_notice" },
    { name: "Programs", path: "/school/parents/parents_programs" },
    { name: "Profile", path: "/school/parents/parents_profile" },
  ],

  management: [
    { name: "Dashboard", path: "/school/management/management_dashboard" },
    { name: "Reports", path: "/school/management/management_report" },
    { name: "Activites", path: "/school/management/management_activites" },
    { name: "Students", path: "/school/management/management_students" },
    { name: "Teachers(or)Faculty", path: "/school/management/management_teachers" },
    { name: "Attendence", path: "/school/management/management_attendence" },
    { name: "Monthly Report", path: "/school/management/management_monthly_report" },
    { name: "Finance", path: "/school/management/management_finance" },
    { name: "Pendingfees", path: "/school/management/management_pending_fees" },
    { name: "Program", path: "/school/management/management_programs" },
    { name: "Notice", path: "/school/management/management_notice" },
    { name: "Transport", path: "/school/management/management_transport" },
    { name: "Calender", path: "/school/management/management_calender" },
    { name: "Raise Issues", path: "/school/management/management_issue" },
    { name: "ID card", path: "/school/management/management_id_card" },
    { name: "Profile", path: "/school/management/management_profile" },
  ],
  principal: [
    { name: "Dashboard", path: "/school/principal/principal_dashboard" },
    { name: "Activites", path: "/school/principal/principal_activities" },
    { name: "Reports", path: "/school/principal/principal_reports" },
    { name: "Teachers", path: "/school/principal/principal_teachers" },
    { name: "Students", path: "/school/principal/principal_students" },
    { name: "Attendence", path: "/school/principal/principal_attendance" },
    { name: "Monthly Report", path: "/school/principal/principal_monthly_report" },
    { name: "Notice", path: "/school/principal/principal_notice" },
    { name: "Create Timetable", path: "/school/principal/principal_timetablecreation" },
    { name: "Calender", path: "/school/principal/principal_calender" },
    { name: "Raise Issues", path: "/school/principal/principal_issues" },
    { name: "Projects", path: "/school/principal/principal_projects" },
    { name: "Programs", path: "/school/principal/principal_programs" },
    { name: "Absent Students", path: "/school/principal/principal_absent_students" },
    { name: "ID card", path: "/school/principal/principal_id_card" },
    { name: "Profile", path: "/school/principal/principal_profile" },
  ],
  teachers: [
    { name: "Dashboard", path: "/school/teachers/teachers_dashboard" },
    { name: "Time Table", path: "/school/teachers/teachers_timetable" },
    { name: "Leaves", path: "/school/teachers/teachers_leaves" },
    { name: "Student Leaves", path: "/school/teachers/teachers_student_leaves" },
    { name: "Attendance", path: "/school/teachers/teachers_attendance" },
    { name: "Assignment", path: "/school/teachers/teachers_assignment" },
    { name: "Monthly Report", path: "/school/teachers/teachers_monthly_report" },
    { name: "Marks sheet", path: "/school/teachers/teachers_marks" },
    { name: "Calender", path: "/school/teachers/teachers_calender" },
    { name: "Notice", path: "/school/teachers/teachers_notice" },
    { name: "Program", path: "/school/teachers/teachers_programs" },
    { name: "Raise Issues", path: "/school/teachers/teachers_issues" },
    { name: "Projects", path: "/school/teachers/teachers_projects" },
    { name: "Documents", path: "/school/teachers/teachers_documents" },
    { name: "ID card", path: "/school/teachers/teachers_id_card" },
    { name: "Profile", path: "/school/teachers/teachers_profile" },
  ],
  students: [
    { name: "Dashboard", path: "/school/students/students_dashboard" },
    { name: "Tasks", path: "/school/students/students_tasks" },
    { name: "Attendance", path: "/school/students/students_attendance" },
    { name: "Assignment", path: "/school/students/students_assignment" },
    { name: "TimeTable", path: "/school/students/students_timetable" },
    { name: "Leaves", path: "/school/students/students_leaves" },
    { name: "Marks", path: "/school/students/students_marks" },
    { name: "Calender", path: "/school/students/students_calender" },
    { name: "Notice", path: "/school/students/students_notice" },
    { name: "Reports", path: "/school/students/students_reports" },
    { name: "Issues", path: "/school/students/students_issues" },
    { name: "Programs", path: "/school/students/students_programs" },
    { name: "Documents", path: "/school/students/students_docs" },
    { name: "Fees", path: "/school/students/students_fees" },
    { name: "ID card", path: "/school/students/students_id_card" },
    { name: "Profile", path: "/school/students/students_profile" },
  ],
  admin: [
    { name: "Dashboard", path: "/school/admin/admin_dashboard" },
    { name: "Attendence", path: "/school/admin/admin_attendence" },
    { name: "Students", path: "/school/admin/admin_students" },
    { name: "Teachers", path: "/school/admin/admin_teachers" },
    { name: "Approvals", path: "/school/admin/admin_approval" },
    { name: "Calender", path: "/school/admin/admin_calender" },
    { name: "Notice", path: "/school/admin/admin_notice" },
    { name: "Programs", path: "/school/admin/admin_programs" },
    { name: "Reports", path: "/school/admin/admin_reports" },
    { name: "Raise Issues", path: "/school/admin/admin_issues" },
    { name: "Projects", path: "/school/admin/admin_projects" },
    { name: "ID card", path: "/school/admin/admin_id_card" },
    { name: "Profile", path: "/school/admin/admin_profile" },
  ],
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function DashboardLayout({ children, role }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("userInfo");
        let tokenRole: string | null = null;
        const token = getCookie("token");
        if (token) {
          // Attempt to parse JWT token to get role
          const parsed = parseJwt(token);
          if (parsed && typeof parsed.role === "string") {
            tokenRole = parsed.role.toLowerCase();
          } else {
            // If token is not JWT or role not found in payload, fallback to plain token string as role if it matches known roles
            const lowerToken = token.toLowerCase();
            if (["management", "principal", "teachers", "students", "admin", "parents"].includes(lowerToken)) {
              tokenRole = lowerToken;
            }
          }
        }

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const email = parsedUser.email;
            setUserEmail(email || "Unknown User");

            if (email) {
              try {
                // Use tokenRole if available, else fallback to prop role
                const effectiveRole = tokenRole || role.toLowerCase();
                // If effectiveRole not in roleLinksMap keys, fallback to role prop
                const roleForApi = Object.keys(roleLinksMap).includes(effectiveRole) ? effectiveRole : role.toLowerCase();
                // For admin, use singular endpoint; for others, use singular (no plural 's')
                const endpoint = `https://globaltechsoftwaresolutions.cloud/school-api/api/${roleForApi}/${email}/`
                console.log("Fetching user from:", endpoint);
                try {
                  const response = await fetch(endpoint);
                  if (response.ok) {
                    const data = await response.json();
                    const userDetails = data.user_details || {};
                    const fullname = data.fullname || userDetails.fullname || null;
                    const roleFromApi = userDetails.role || null;
                    const profilePic = data.profile_picture || userDetails.profile_picture || null;

                    // Use role from API if valid, else fallback to tokenRole or prop role
                    let finalRole = roleFromApi ? roleFromApi.toLowerCase() : (tokenRole || role.toLowerCase());

                    setUserName(fullname || (email.split("@")[0] || "User"));
                    setUserRole(finalRole.toUpperCase());
                    setProfilePicture(profilePic || null);
                  } else {
                    // fallback if fetch fails (404, 500, etc.)
                    console.log("ℹ️ User details endpoint not available (" + response.status + "), using defaults");
                    setUserName(email.split("@")[0] || "User");
                    setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
                    setProfilePicture(null);
                  }
                } catch (fetchErr) {
                  console.log("ℹ️ Could not fetch user details:", fetchErr);
                  setUserName(email.split("@")[0] || "User");
                  setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
                  setProfilePicture(null);
                }
              } catch {
                setUserName(email.split("@")[0] || "User");
                setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
                setProfilePicture(null);
              }
            } else {
              setUserName("Unknown User");
              setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
              setProfilePicture(null);
            }
          } catch {
            setUserEmail("Unknown User");
            setUserName("Unknown User");
            setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
            setProfilePicture(null);
          }
        } else {
          setUserEmail(null);
          setUserName(null);
          setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
          setProfilePicture(null);
        }
      }
    }
    fetchUserDetails();
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/school");
  };

  const roleLinks = roleLinksMap[role];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg flex-col z-20">
        <div className="p-6 flex items-center gap-4 border-b border-blue-700">
          <Image
            src={profilePicture || "/default-avatar.png"}
            alt="Profile"
            width={64}
            height={64}
            unoptimized
            className="rounded-full border-2 border-white shadow-md object-cover w-16 h-16"
          />
          <div className="flex flex-col min-w-0">
            <p className="text-lg font-semibold text-white truncate max-w-[150px] overflow-hidden">
              {userName ? userName : "Welcome"}
            </p>
            <p className="text-sm text-blue-200 truncate max-w-[150px] overflow-hidden">{userRole ? userRole.toUpperCase() : role.toUpperCase()}</p>
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

            <div className="p-4 flex flex-col items-center gap-2 border-b border-blue-700 mt-12">
              <Image
                src={profilePicture || "/default-avatar.png"}
                alt="Profile"
                width={56}
                height={56}
                unoptimized
                className="rounded-full border-2 border-white shadow-md object-cover w-14 h-14"
              />
              <div className="text-center min-w-0">
                <p className="text-md font-semibold text-white truncate max-w-[150px] overflow-hidden">
                  {userName ? userName : "Welcome"}
                </p>
                <p className="text-xs text-blue-200 uppercase truncate max-w-[150px] overflow-hidden">{userRole ? userRole.toUpperCase() : role.toUpperCase()}</p>
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

        </header>

        <div className="pt-20 p-6 flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}