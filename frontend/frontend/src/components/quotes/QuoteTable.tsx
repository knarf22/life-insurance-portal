import type {  QuoteTableProps } from "../../types";


function QuoteTable({
  quotes,
  loading,
  error,
  search,
  updatingQuoteId,
  onUpdateStatus,
  onConvertQuote,
  formatCurrency,
}: QuoteTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center text-sm text-gray-500">
          Loading quotes...
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

  if (quotes.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center text-sm text-gray-500">
          {search
            ? "No quotes match your search."
            : "No quotes found."}
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
                Quote
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
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {quotes.map((quote) => {
              const isUpdating =
                updatingQuoteId === quote.id;

              return (
                <tr
                  key={quote.id}
                  className="hover:bg-gray-50"
                >
                  {/* Quote */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {quote.quoteNumber}
                    </div>

                    <div className="text-xs text-gray-500">
                      {new Date(
                        quote.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {quote.customerName}
                  </td>

                  {/* Product */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {quote.product ===
                    "TERM_LIFE"
                      ? "Term Life"
                      : "Whole Life"}
                  </td>

                  {/* Coverage */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatCurrency(
                      quote.coverageAmount
                    )}
                  </td>

                  {/* Premium */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        quote.annualPremium
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatCurrency(
                        quote.paymentAmount
                      )}

                      {" / "}

                      {quote.paymentFrequency ===
                      "MONTHLY"
                        ? "month"
                        : "year"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
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
                      {quote.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex min-w-max gap-2">

                      {/* DRAFT */}
                      {quote.status ===
                        "DRAFT" && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              onUpdateStatus(
                                quote.id,
                                "ACCEPTED"
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "..."
                              : "Accept"}
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              onUpdateStatus(
                                quote.id,
                                "DECLINED"
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "..."
                              : "Decline"}
                          </button>
                        </>
                      )}

                      {/* ACCEPTED */}
                      {quote.status ===
                        "ACCEPTED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            onConvertQuote(
                              quote.id
                            )
                          }
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating
                            ? "Converting..."
                            : "Convert"}
                        </button>
                      )}

                      {/* DECLINED */}
                      {quote.status ===
                        "DECLINED" && (
                        <span className="text-xs text-gray-400">
                          No actions
                        </span>
                      )}

                      {/* CONVERTED */}
                      {quote.status ===
                        "CONVERTED" && (
                        <span className="text-xs text-gray-400">
                          Converted
                        </span>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuoteTable;