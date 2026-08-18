import { Link, Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", path: "/" },
    { name: "Customers", path: "/customers" },
    { name: "Quotes", path: "/quotes" },
    { name: "Applications", path: "/applications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">
              Life Insurance
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Agent Portal
            </p>
          </div>

          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Agent Portal
            </h2>

            <div className="text-sm text-gray-600">
              Agent
            </div>
          </header>

          <div className="p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default Layout;