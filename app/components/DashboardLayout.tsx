"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

type Role = "management" | "principal" | "teachers" | "students" | "admin" | "parents";

type Props = {
  children: ReactNode;
  role: Role;
};

const roleLinksMap: Record<Role, { name: string; path: string }[]> = {
  parents: [
    { name: "Dashboard", path: "/parents/parents_dashboard" },
    { name: "Attendence", path: "/parents/parents_attendence" },
    { name: "Reports", path: "/parents/parents_report" },
    { name: "Fees", path: "/parents/parents_fees" },
    { name: "Activites", path: "/parents/parents_activities" },
    { name: "Notices", path: "/parents/parents_notice" },
    { name: "Programs", path: "/parents/parents_programs" },
    { name: "Profile", path: "/parents/parents_profile" },
  ],

  management: [
    { name: "Dashboard", path: "/management/management_dashboard" },
    { name: "Reports", path: "/management/management_report" },
    { name: "Activites", path: "/management/management_activites" },
    { name: "Students", path: "/management/management_students" },
    { name: "Teachers(or)Faculty", path: "/management/management_teachers" },
    { name: "Attendence", path: "/management/management_attendence" },
    { name: "Finance", path: "/management/management_finance" },
    { name: "Calender", path: "/management/management_calender" },
    { name: "Notice", path: "/management/management_notice" },
    { name: "Programs", path: "/management/management_programs" },
    { name: "Raise Issues", path: "/management/management_issues" },
    { name: "Projects", path: "/management/management_projects" },
    { name: "Monthly Report", path: "/management/management_monthly_report" },
    { name: "Pending Fees", path: "/management/management_pending_fees" },
    { name: "Create Fee", path: "/management/management_create_fee" },
    { name: "Transport", path: "/management/management_transport" },
    { name: "ID card", path: "/management/management_id_card" },
    { name: "Profile", path: "/management/management_profile" },
  ],
  principal: [
    { name: "Dashboard", path: "/principal/principal_dashboard" },
    { name: "Reports", path: "/principal/principal_reports" },
    { name: "Activites", path: "/principal/principal_activities" },
    { name: "Students", path: "/principal/principal_students" },
    { name: "Teachers", path: "/principal/principal_teachers" },
    { name: "Attendence", path: "/principal/principal_attendance" },
    { name: "Calender", path: "/principal/principal_calender" },
    { name: "Notice", path: "/principal/principal_notice" },
    { name: "Raise Issues", path: "/principal/principal_raise_issues" },
    { name: "Programs", path: "/principal/principal_programs" },
    { name: "Projects", path: "/principal/principal_projects" },
    { name: "Monthly Report", path: "/principal/principal_monthly_report" },
    { name: "ID card", path: "/principal/principal_id_card" },
    { name: "Timetable Creation", path: "/principal/principal_timetablecreation" },
    { name: "Profile", path: "/principal/principal_profile" },
  ],
  teachers: [
    { name: "Dashboard", path: "/teachers/teachers_dashboard" },
    { name: "Attendance", path: "/teachers/teachers_attendance" },
    { name: "Marks", path: "/teachers/teachers_marks" },
    { name: "Assignments", path: "/teachers/teachers_assignment" },
    { name: "Online Test", path: "/teachers/teachers_online_test" },
    // { name: "Cariculum Activites", path: "/teachers/teachers_activities" },
    { name: "Calender", path: "/teachers/teachers_calender" },
    { name: "Notice", path: "/teachers/teachers_notice" },
    { name: "Programs", path: "/teachers/teachers_programs" },
    { name: "Projects", path: "/teachers/teachers_projects" },
    { name: " Monthly Report", path: "/teachers/teachers_monthly_report" },
    { name: "Leaves", path: "/teachers/teachers_leaves" },
    { name: "Raise Issues", path: "/teachers/teachers_raise_issues" },
    { name: "Student Leaves", path: "/teachers/teachers_student_leaves" },
    { name: "Documents", path: "/teachers/teachers_documents" },
    { name: "ID card", path: "/teachers/teachers_id_card" },
    { name: "Timetable", path: "/teachers/teachers_timetable" },
    { name: "Profile", path: "/teachers/teachers_profile" },
  ],
  students: [
    { name: "Dashboard", path: "/students/students_dashboard" },
    { name: "Attendance", path: "/students/students_attendance" },
    { name: "Marks", path: "/students/students_marks" },
    { name: "Assignments", path: "/students/students_assignment" },
    { name: "Tasks", path: "/students/students_tasks" },
    // { name: "Cariculum Activites", path: "/students/students_cariculum_activities" },
    { name: "Online Test", path: "/students/students_online_test" },
    { name: "Calender", path: "/students/students_calender" },
    { name: "Notice", path: "/students/students_notice" },
    { name: "Programs", path: "/students/students_programs" },
    { name: "Reports", path: "/students/students_reports" },
    { name: "Leaves", path: "/students/students_leaves" },
    { name: "Raise Issues", path: "/students/students_raise_issues" },
    { name: "TimeTable", path: "/students/students_timetable" },
    { name: "Documents", path: "/students/students_docs" },
    { name: "Fees", path: "/students/students_fees" },
    { name: "ID card", path: "/students/students_id_card" },
    { name: "Profile", path: "/students/students_profile" },
  ],
  admin: [
    { name: "Dashboard", path: "/admin/admin_dashboard" },
    { name: "Attendence", path: "/admin/admin_attendence" },
    { name: "Students", path: "/admin/admin_students" },
    { name: "Teachers", path: "/admin/admin_teachers" },
    { name: "Approvals", path: "/admin/admin_approval" },
    { name: "Calender", path: "/admin/admin_calender" },
    { name: "Notice", path: "/admin/admin_notice" },
    { name: "Programs", path: "/admin/admin_programs" },
    { name: "Reports", path: "/admin/admin_reports" },
    { name: "Raise Issues", path: "/admin/admin_issues" },
    { name: "Projects", path: "/admin/admin_projects" },
    { name: "ID card", path: "/admin/admin_id_card" },
    { name: "Profile", path: "/admin/admin_profile" },
  ],
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

function parseJwt(token: string): { [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Check authentication on mount and route changes
  useEffect(() => {
    console.log('[DASHBOARD LAYOUT] Checking authentication');

    // Check if user is authenticated
    const token = localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      getCookie("token");

    if (!token) {
      // Redirect to login if not authenticated
      console.log('[DASHBOARD LAYOUT] No token found, redirecting to login');
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    console.log('[DASHBOARD LAYOUT] Token found, proceeding with user data fetch');

    // Parse user info from token or localStorage
    let tokenRole: string | null = null;
    if (token) {
      // Attempt to parse JWT token to get role
      const parsed = parseJwt(token);
      if (parsed && typeof parsed.role === "string") {
        tokenRole = parsed.role.toLowerCase();
        console.log('[DASHBOARD LAYOUT] Role from JWT token:', tokenRole);
      } else {
        // If token is not JWT or role not found in payload, fallback to plain token string as role if it matches known roles
        const lowerToken = token.toLowerCase();
        if (["management", "principal", "teachers", "students", "admin", "parents"].includes(lowerToken)) {
          tokenRole = lowerToken;
          console.log('[DASHBOARD LAYOUT] Role from plain token:', tokenRole);
        }
      }
    }

    // Fetch user details
    async function fetchUserDetails() {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("userInfo");
        console.log('[DASHBOARD LAYOUT] Stored user info:', storedUser);

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const email = parsedUser.email;

            if (email) {
              try {
                // Use tokenRole if available, else fallback to prop role
                const effectiveRole = tokenRole || role.toLowerCase();
                const roleForApi = Object.keys(roleLinksMap).includes(effectiveRole) ? effectiveRole : role.toLowerCase();

                // Use environment variable for API base or fallback
                const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://school.globaltechsoftwaresolutions.cloud/api").replace(/\/$/, "");
                const endpoint = `${apiBase}/${roleForApi}/${email}`;

                console.log("[DASHBOARD LAYOUT] Fetching user from:", endpoint);

                const response = await fetch(endpoint, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  const data = await response.json();
                  console.log("[DASHBOARD LAYOUT] User data fetched:", data);

                  const userDetails = data.user_details || {};
                  // Try to get the full name from various possible fields
                  const fullname = data.fullname || data.name || data.first_name || userDetails.fullname || userDetails.name || userDetails.first_name || null;
                  const roleFromApi = userDetails.role || null;
                  let profilePic = data.profile_picture || data.profile_pic || userDetails.profile_picture || null;

                  // Handle relative image paths
                  if (profilePic && !profilePic.startsWith('http')) {
                    profilePic = `${apiBase}${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
                  }

                  // Use role from API if valid, else fallback to tokenRole or prop role
                  const finalRole = roleFromApi ? roleFromApi.toLowerCase() : (tokenRole || role.toLowerCase());

                  setUserName(fullname || (email.split("@")[0] || "User"));
                  setUserRole(finalRole.toUpperCase());
                  setProfilePicture(profilePic);
                } else {
                  console.warn("[DASHBOARD LAYOUT] Profile fetch failed with status:", response.status);
                  const nameFromEmail = email.split("@")[0] || "User";
                  setUserName(nameFromEmail);
                  setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
                }
              } catch (fetchErr) {
                console.error("[DASHBOARD LAYOUT] Error fetching user details:", fetchErr);
                const nameFromEmail = email.split("@")[0] || "User";
                setUserName(nameFromEmail);
                setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
              }
            } else {
              setUserName("Unknown User");
              setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
            }
          } catch (e) {
            console.error("[DASHBOARD LAYOUT] Error parsing userInfo:", e);
            setUserName("Unknown User");
            setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
          }
        } else {
          setUserRole((tokenRole || role.toLowerCase()).toUpperCase());
        }
      }
    }

    fetchUserDetails();
  }, [role, router, pathname]);

  const handleLogout = () => {
    console.log('[DASHBOARD LAYOUT] Logging out user');
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

        <nav className="flex-1 overflow-y-auto flex flex-col p-4 space-y-2 custom-scrollbar">
          {roleLinks?.map((link) => (
            <Link
              href={link.path}
              key={link.name}
              className={`px-4 py-2 rounded-lg transition-all font-medium hover:bg-blue-500 hover:shadow-md ${pathname === link.path ? "bg-blue-500 shadow-md" : ""
                }`}
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
          <div className="relative ml-4 my-4 w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="p-4 flex justify-between items-center border-b border-blue-700">
              <div className="flex items-center gap-2">
                <Image
                  src={profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  width={40}
                  height={40}
                  unoptimized
                  className="rounded-full border border-white object-cover w-10 h-10"
                />
                <div>
                  <p className="font-semibold truncate max-w-[100px] overflow-hidden">
                    {userName ? userName : "User"}
                  </p>
                  <p className="text-xs text-blue-200">{userRole ? userRole : role}</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full hover:bg-blue-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto flex flex-col p-4 space-y-2 custom-scrollbar">
              {roleLinks?.map((link) => (
                <Link
                  href={link.path}
                  key={link.name}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium hover:bg-blue-500 ${pathname === link.path ? "bg-blue-500" : ""
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="mt-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-medium flex items-center gap-2 transition-all"
              >
                <FiLogOut /> Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-72 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-2"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-bold text-blue-600 capitalize sm:block">
              {role} Dashboard
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div >

      {/* Logout Confirmation Modal */}
      {
        logoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
