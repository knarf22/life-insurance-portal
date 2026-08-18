import { useEffect, useState } from "react";
import api from "../services/api";
import type { PolicyApplication } from "../types";

function Applications() {
  const [applications, setApplications] = useState<
    PolicyApplication[]
  >([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<PolicyApplication[]>(
        "/applications"
      );

      console.log(
        "APPLICATIONS RESPONSE:",
        response.data
      );

      setApplications(response.data);
    } catch (error) {
      console.error(
        "LOAD APPLICATIONS ERROR:",
        error
      );

      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadApplications();
  }, []);

  // ==========================================
  // LOCAL SEARCH
  // ==========================================

  const filteredApplications =
    applications.filter((application) => {
      const value = search
        .toLowerCase()
        .trim();

      if (!value) {
        return true;
      }

      return (
        application.applicationNumber
          ?.toLowerCase()
          .includes(value) ||

        application.customerName
          ?.toLowerCase()
          .includes(value) ||

        application.product
          ?.toLowerCase()
          .includes(value) ||

        application.status
          ?.toLowerCase()
          .includes(value)
      );
    });

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-gray-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage policy applications.
        </p>

      </div>

      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by application number, customer, product or status..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* ========================================
          TABLE
      ======================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {loading ? (

          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading applications...
          </div>

        ) : error ? (

          <div className="px-6 py-12 text-center text-sm text-red-500">
            {error}
          </div>

        ) : filteredApplications.length === 0 ? (

          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {search
              ? "No applications match your search."
              : "No applications found."}
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* ==================================
                  HEADER
              ================================== */}

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Application
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Coverage
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Premium
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Term
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                </tr>

              </thead>

              {/* ==================================
                  BODY
              ================================== */}

              <tbody className="divide-y divide-gray-100">

                {filteredApplications.map(
                  (application) => (

                    <tr
                      key={application.id}
                      className="hover:bg-gray-50"
                    >

                      {/* APPLICATION */}

                      <td className="px-6 py-4">

                        <div className="text-sm font-medium text-gray-900">
                          {
                            application.applicationNumber
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          Quote:{" "}
                          {
                            application.quoteId
                          }
                        </div>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {
                          application.customerName
                        }
                      </td>

                      {/* PRODUCT */}

                      <td className="px-6 py-4 text-sm text-gray-700">

                        {application.product ===
                        "TERM_LIFE"
                          ? "Term Life"
                          : application.product ===
                            "WHOLE_LIFE"
                          ? "Whole Life"
                          : application.product}

                      </td>

                      {/* COVERAGE */}

                      <td className="px-6 py-4 text-sm text-gray-700">

                        {formatCurrency(
                          application.coverageAmount
                        )}

                      </td>

                      {/* PREMIUM */}

                      <td className="px-6 py-4">

                        <div className="text-sm font-medium text-gray-900">

                          {formatCurrency(
                            application.annualPremium
                          )}

                        </div>

                        <div className="text-xs text-gray-500">

                          {formatCurrency(
                            application.paymentAmount
                          )}

                        </div>

                      </td>

                      {/* TERM */}

                      <td className="px-6 py-4 text-sm text-gray-700">

                        {
                          application.policyTermYears
                        }{" "}
                        years

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-sm text-gray-700">

                        {new Date(
                          application.applicationDate
                        ).toLocaleDateString()}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            application.status ===
                            "PENDING_UNDERWRITING"
                              ? "bg-yellow-50 text-yellow-700"
                              : application.status ===
                                "APPROVED"
                              ? "bg-green-50 text-green-700"
                              : application.status ===
                                "DECLINED"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {
                            application.status
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Applications;