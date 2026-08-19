import type { Customer, CustomerTableProps } from "../../types";


function CustomerTable({
  customers,
  loading,
  error,
  search,
}: CustomerTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center text-sm text-gray-500">
          Loading customers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center text-sm text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center text-sm text-gray-500">
          {search
            ? "No customers match your search."
            : "No customers found."}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Date of Birth
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Email
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Mobile
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Smoker
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.fullName}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(
                    customer.dateOfBirth
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.email}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.mobileNumber}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      customer.isSmoker
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {customer.isSmoker
                      ? "Yes"
                      : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerTable;