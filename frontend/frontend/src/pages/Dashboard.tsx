import { useEffect, useState } from "react";
import api from "../services/api";

import type {
  Customer,
  Quote,
  PolicyApplication,
} from "../types";

const Dashboard = () => {
  // ==========================================
  // DATA
  // ==========================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [applications, setApplications] =
    useState<PolicyApplication[]>([]);

  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      setError("");

      const [
        customersResponse,
        quotesResponse,
        applicationsResponse,
      ] = await Promise.all([
        api.get<Customer[]>(
          "/customers"
        ),

        api.get<Quote[]>(
          "/quotes"
        ),

        api.get<PolicyApplication[]>(
          "/applications"
        ),
      ]);

      setCustomers(
        customersResponse.data
      );

      setQuotes(
        quotesResponse.data
      );

      setApplications(
        applicationsResponse.data
      );

      console.log(
        "DASHBOARD DATA:",
        {
          customers:
            customersResponse.data,

          quotes:
            quotesResponse.data,

          applications:
            applicationsResponse.data,
        }
      );
    } catch (error) {
      console.error(
        "LOAD DASHBOARD ERROR:",
        error
      );

      setError(
        "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ==========================================
  // CALCULATED STATS
  // ==========================================

  const totalCustomers =
    customers.length;

  const draftQuotes =
    quotes.filter(
      (quote) =>
        quote.status === "DRAFT"
    ).length;

  const acceptedQuotes =
    quotes.filter(
      (quote) =>
        quote.status === "ACCEPTED"
    ).length;

  const pendingApplications =
    applications.filter(
      (application) =>
        application.status ===
        "PENDING_UNDERWRITING"
    ).length;

  // ==========================================
  // RECENT QUOTES
  // ==========================================

  const recentQuotes = [
    ...quotes,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    )
    .slice(0, 5);

  // ==========================================
  // RECENT APPLICATIONS
  // ==========================================

  const recentApplications = [
    ...applications,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.applicationDate
        ).getTime() -
        new Date(
          a.applicationDate
        ).getTime()
    )
    .slice(0, 5);

  // ==========================================
  // STATS
  // ==========================================

  const stats = [
    {
      title: "Total Customers",

      value: totalCustomers,

      description:
        "Registered customers",
    },

    {
      title: "Draft Quotes",

      value: draftQuotes,

      description:
        "Quotes awaiting decision",
    },

    {
      title: "Accepted Quotes",

      value: acceptedQuotes,

      description:
        "Ready for conversion",
    },

    {
      title: "Applications",

      value: pendingApplications,

      description:
        "Pending underwriting",
    },
  ];

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const formatStatus = (
    status: string
  ) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // ==========================================
  // CURRENCY
  // ==========================================

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      }
    ).format(amount);
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
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your life insurance business.
        </p>

      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ========================================
          STATS
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (

          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >

            <p className="text-sm font-medium text-gray-500">
              {stat.title}
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {loading
                ? "..."
                : stat.value}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {stat.description}
            </p>

          </div>

        ))}

      </div>

      {/* ========================================
          RECENT ACTIVITY
      ======================================== */}

      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">

          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Recent quotes and applications.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Loading recent activity...
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          recentQuotes.length === 0 &&
          recentApplications.length ===
            0 && (

            <div className="px-6 py-10 text-center text-sm text-gray-500">
              No recent activity.
            </div>

          )}

        {/* ACTIVITY */}

        {!loading &&
          (recentQuotes.length > 0 ||
            recentApplications.length >
              0) && (

            <div className="divide-y divide-gray-100">

              {/* RECENT QUOTES */}

              {recentQuotes.map(
                (quote) => (

                  <div
                    key={`quote-${quote.id}`}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div>

                      <p className="text-sm font-medium text-gray-900">

                        Quote{" "}
                        {
                          quote.quoteNumber
                        }

                      </p>

                      <p className="mt-1 text-xs text-gray-500">

                        {
                          quote.customerName
                        }

                        {" · "}

                        {quote.product ===
                        "TERM_LIFE"
                          ? "Term Life"
                          : "Whole Life"}

                      </p>

                    </div>

                    <div className="text-right">

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          quote.status ===
                          "ACCEPTED"
                            ? "bg-green-50 text-green-700"
                            : quote.status ===
                              "DECLINED"
                            ? "bg-red-50 text-red-700"
                            : quote.status ===
                              "CONVERTED"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {formatStatus(
                          quote.status
                        )}
                      </span>

                      <p className="mt-2 text-xs text-gray-500">

                        {formatCurrency(
                          quote.annualPremium
                        )}

                      </p>

                    </div>

                  </div>

                )
              )}

              {/* RECENT APPLICATIONS */}

              {recentApplications.map(
                (application) => (

                  <div
                    key={`application-${application.id}`}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div>

                      <p className="text-sm font-medium text-gray-900">

                        Application{" "}
                        {
                          application.applicationNumber
                        }

                      </p>

                      <p className="mt-1 text-xs text-gray-500">

                        {
                          application.customerName
                        }

                        {" · "}

                        {application.product ===
                        "TERM_LIFE"
                          ? "Term Life"
                          : application.product ===
                            "WHOLE_LIFE"
                          ? "Whole Life"
                          : application.product}

                      </p>

                    </div>

                    <div className="text-right">

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
                        {formatStatus(
                          application.status
                        )}
                      </span>

                      <p className="mt-2 text-xs text-gray-500">

                        {formatCurrency(
                          application.annualPremium
                        )}

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </div>
  );
};

export default Dashboard;