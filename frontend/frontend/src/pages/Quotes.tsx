import {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../services/api";

import type {
  Quote,
  Customer,
} from "../types";

interface CreateQuoteRequest {
  customerId: string;

  product:
    | "TERM_LIFE"
    | "WHOLE_LIFE";

  coverageAmount: number;

  policyTermYears: number;

  paymentFrequency:
    | "MONTHLY"
    | "ANNUAL";
}

interface PremiumResult {
  baseAnnualPremium: number;

  riskLoadingPercent: number;

  annualPremium: number;

  paymentAmount: number;
}

function Quotes() {
  // ==========================================
  // DATA
  // ==========================================

  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  // ==========================================
  // UI STATE
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [calculating, setCalculating] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [updatingQuoteId, setUpdatingQuoteId] =
    useState<string | null>(null);

  // ==========================================
  // PREMIUM RESULT
  // ==========================================

  const [premiumResult, setPremiumResult] =
    useState<PremiumResult | null>(null);

  // ==========================================
  // MODAL SCROLL REF
  // ==========================================

  const modalBodyRef =
    useRef<HTMLDivElement>(null);

  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] =
    useState<CreateQuoteRequest>({
      customerId: "",

      product: "TERM_LIFE",

      coverageAmount: 1000000,

      policyTermYears: 5,

      paymentFrequency: "MONTHLY",
    });

  // ==========================================
  // LOAD QUOTES
  // ==========================================

  const loadQuotes = async () => {
    try {
      setLoading(true);

      setError("");

      const response =
        await api.get<Quote[]>(
          "/quotes"
        );

      setQuotes(response.data);
    } catch (error) {
      console.error(
        "LOAD QUOTES ERROR:",
        error
      );

      setError(
        "Failed to load quotes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================

  const loadCustomers = async () => {
    try {
      const response =
        await api.get<Customer[]>(
          "/customers"
        );

      setCustomers(response.data);
    } catch (error) {
      console.error(
        "LOAD CUSTOMERS ERROR:",
        error
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadQuotes();
    loadCustomers();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredQuotes =
    quotes.filter((quote) => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return true;
      }

      return (
        quote.quoteNumber
          ?.toLowerCase()
          .includes(value) ||
        quote.customerName
          ?.toLowerCase()
          .includes(value) ||
        quote.product
          ?.toLowerCase()
          .includes(value) ||
        quote.status
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
    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      }
    ).format(amount);
  };

  // ==========================================
  // OPEN MODAL
  // ==========================================

  const handleOpenModal = () => {
    setFormError("");

    setPremiumResult(null);

    setForm({
      customerId: "",

      product: "TERM_LIFE",

      coverageAmount: 1000000,

      policyTermYears: 5,

      paymentFrequency: "MONTHLY",
    });

    setShowModal(true);

    setTimeout(() => {
      modalBodyRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }, 50);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (
      calculating ||
      creating
    ) {
      return;
    }

    setShowModal(false);

    setFormError("");

    setPremiumResult(null);
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        name ===
          "coverageAmount" ||
        name ===
          "policyTermYears"
          ? Number(value)
          : value,
    }));

    // Existing calculation becomes invalid
    // if the form changes.

    setPremiumResult(null);

    setFormError("");
  };

  // ==========================================
  // CALCULATE PREMIUM
  // ==========================================

  const handleCalculatePremium =
    async () => {
      if (!form.customerId) {
        setFormError(
          "Please select a customer."
        );

        return;
      }

      if (
        form.coverageAmount <
        100000
      ) {
        setFormError(
          "Coverage must be at least ₱100,000."
        );

        return;
      }

      if (
        form.coverageAmount >
        5000000
      ) {
        setFormError(
          "Coverage cannot exceed ₱5,000,000."
        );

        return;
      }

      try {
        setCalculating(true);

        setFormError("");

        setPremiumResult(null);

        console.log(
          "CALCULATE PREMIUM REQUEST:",
          form
        );

        const response =
          await api.post<PremiumResult>(
            "/quotes/calculate-premium",
            form
          );

        console.log(
          "CALCULATE PREMIUM RESPONSE:",
          response.data
        );

        setPremiumResult(
          response.data
        );

        // Automatically scroll to
        // the premium calculation.

        setTimeout(() => {
          modalBodyRef.current?.scrollTo(
            {
              top:
                modalBodyRef.current
                  .scrollHeight,

              behavior: "smooth",
            }
          );
        }, 100);
      } catch (error: any) {
        console.error(
          "CALCULATE PREMIUM ERROR:",
          error
        );

        if (
          error.response?.data
            ?.message
        ) {
          setFormError(
            error.response.data
              .message
          );
        } else if (
          error.response?.data
            ?.errors
        ) {
          const validationErrors =
            Object.values(
              error.response.data
                .errors
            )
              .flat()
              .join(" ");

          setFormError(
            validationErrors ||
              "Failed to calculate premium."
          );
        } else {
          setFormError(
            "Failed to calculate premium."
          );
        }
      } finally {
        setCalculating(false);
      }
    };

  // ==========================================
  // CREATE QUOTE
  // ==========================================

  const handleCreateQuote =
    async () => {
      if (!premiumResult) {
        setFormError(
          "Please calculate the premium first."
        );

        return;
      }

      try {
        setCreating(true);

        setFormError("");

        console.log(
          "CREATE QUOTE REQUEST:",
          form
        );

        const response =
          await api.post(
            "/quotes",
            form
          );

        console.log(
          "CREATE QUOTE RESPONSE:",
          response.data
        );

        setShowModal(false);

        setForm({
          customerId: "",

          product: "TERM_LIFE",

          coverageAmount: 1000000,

          policyTermYears: 5,

          paymentFrequency:
            "MONTHLY",
        });

        setPremiumResult(null);

        // Refetch after creating.

        await loadQuotes();
      } catch (error: any) {
        console.error(
          "CREATE QUOTE ERROR:",
          error
        );

        if (
          error.response?.data
            ?.message
        ) {
          setFormError(
            error.response.data
              .message
          );
        } else if (
          error.response?.data
            ?.errors
        ) {
          const validationErrors =
            Object.values(
              error.response.data
                .errors
            )
              .flat()
              .join(" ");

          setFormError(
            validationErrors ||
              "Failed to create quote."
          );
        } else {
          setFormError(
            "Failed to create quote."
          );
        }
      } finally {
        setCreating(false);
      }
    };

  // ==========================================
  // ACCEPT / DECLINE QUOTE
  // ==========================================

  const handleUpdateStatus =
    async (
      id: string,
      status:
        | "ACCEPTED"
        | "DECLINED"
    ) => {
      const message =
        status === "ACCEPTED"
          ? "Are you sure you want to accept this quote?"
          : "Are you sure you want to decline this quote?";

      if (!window.confirm(message)) {
        return;
      }

      try {
        setUpdatingQuoteId(id);

        console.log(
          "UPDATE QUOTE STATUS:",
          {
            id,
            status,
          }
        );

        await api.patch(
          `/quotes/${id}/status`,
          {
            status,
          }
        );

        // Refetch only after
        // successful mutation.

        await loadQuotes();
      } catch (error: any) {
        console.error(
          "UPDATE QUOTE STATUS ERROR:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Failed to update quote status."
        );
      } finally {
        setUpdatingQuoteId(null);
      }
    };

  // ==========================================
  // CONVERT QUOTE
  // ==========================================

  const handleConvertQuote =
    async (
      id: string
    ) => {
      if (
        !window.confirm(
          "Are you sure you want to convert this accepted quote into an application?"
        )
      ) {
        return;
      }

      try {
        setUpdatingQuoteId(id);

        console.log(
          "CONVERT QUOTE:",
          id
        );

        const response =
          await api.post(
            `/quotes/${id}/convert`
          );

        console.log(
          "CONVERT QUOTE RESPONSE:",
          response.data
        );

        alert(
          `Application ${response.data.applicationNumber} created successfully.`
        );

        // Refetch after conversion.

        await loadQuotes();
      } catch (error: any) {
        console.error(
          "CONVERT QUOTE ERROR:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Failed to convert quote."
        );
      } finally {
        setUpdatingQuoteId(null);
      }
    };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quotes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage
            insurance quotes.
          </p>
        </div>

        <button
          onClick={
            handleOpenModal
          }
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Quote
        </button>

      </div>

      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search by quote number, customer, product or status..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* ========================================
          TABLE
      ======================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {loading ? (

          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading quotes...
          </div>

        ) : error ? (

          <div className="px-6 py-12 text-center text-sm text-red-500">
            {error}
          </div>

        ) : filteredQuotes.length ===
          0 ? (

          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {search
              ? "No quotes match your search."
              : "No quotes found."}
          </div>

        ) : (

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

                {filteredQuotes.map(
                  (quote) => {

                    const isUpdating =
                      updatingQuoteId ===
                      quote.id;

                    return (
                      <tr
                        key={quote.id}
                        className="hover:bg-gray-50"
                      >

                        {/* Quote */}

                        <td className="px-6 py-4">

                          <div className="text-sm font-medium text-gray-900">
                            {
                              quote.quoteNumber
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {new Date(
                              quote.createdAt
                            ).toLocaleDateString()}
                          </div>

                        </td>

                        {/* Customer */}

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {
                            quote.customerName
                          }
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
                            {
                              quote.status
                            }
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
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(
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
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(
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
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  handleConvertQuote(
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
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ========================================
          CREATE QUOTE MODAL
      ======================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">

          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Create Quote
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the quote
                  details.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  calculating ||
                  creating
                }
                className="text-2xl leading-none text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div
              ref={modalBodyRef}
              className="flex-1 overflow-y-auto px-6 py-5"
            >

              <div className="space-y-4">

                {/* ERROR */}

                {formError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* CUSTOMER */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Customer
                  </label>

                  <select
                    name="customerId"
                    value={
                      form.customerId
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !!premiumResult ||
                      calculating ||
                      creating
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >

                    <option value="">
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {
                            customer.fullName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* PRODUCT */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Product
                  </label>

                  <select
                    name="product"
                    value={
                      form.product
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !!premiumResult ||
                      calculating ||
                      creating
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >

                    <option value="TERM_LIFE">
                      Term Life
                    </option>

                    <option value="WHOLE_LIFE">
                      Whole Life
                    </option>

                  </select>

                </div>

                {/* COVERAGE */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Coverage Amount
                  </label>

                  <input
                    type="number"
                    name="coverageAmount"
                    value={
                      form.coverageAmount
                    }
                    onChange={
                      handleChange
                    }
                    min="100000"
                    max="5000000"
                    disabled={
                      !!premiumResult ||
                      calculating ||
                      creating
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    ₱100,000 -
                    ₱5,000,000
                  </p>

                </div>

                {/* POLICY TERM */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Policy Term
                  </label>

                  <select
                    name="policyTermYears"
                    value={
                      form.policyTermYears
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !!premiumResult ||
                      calculating ||
                      creating
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >

                    <option value={5}>
                      5 Years
                    </option>

                    <option value={10}>
                      10 Years
                    </option>

                    <option value={15}>
                      15 Years
                    </option>

                    <option value={20}>
                      20 Years
                    </option>

                  </select>

                </div>

                {/* PAYMENT FREQUENCY */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payment Frequency
                  </label>

                  <select
                    name="paymentFrequency"
                    value={
                      form.paymentFrequency
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !!premiumResult ||
                      calculating ||
                      creating
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >

                    <option value="MONTHLY">
                      Monthly
                    </option>

                    <option value="ANNUAL">
                      Annual
                    </option>

                  </select>

                </div>

                {/* PREMIUM RESULT */}

                {premiumResult && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                    <div className="mb-3">

                      <h3 className="text-sm font-semibold text-blue-900">
                        Premium
                        Calculation
                      </h3>

                      <p className="mt-1 text-xs text-blue-700">
                        Review the
                        calculated
                        premium before
                        creating the
                        quote.
                      </p>

                    </div>

                    <div className="space-y-2">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-gray-600">
                          Base Premium
                        </span>

                        <span className="font-medium text-gray-900">
                          {formatCurrency(
                            premiumResult.baseAnnualPremium
                          )}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-gray-600">
                          Risk Loading
                        </span>

                        <span className="font-medium text-gray-900">
                          {(
                            premiumResult.riskLoadingPercent *
                            100
                          ).toFixed(0)}
                          %
                        </span>

                      </div>

                      <div className="flex items-center justify-between border-t border-blue-200 pt-2">

                        <span className="font-semibold text-gray-900">
                          Annual Premium
                        </span>

                        <span className="font-bold text-blue-700">
                          {formatCurrency(
                            premiumResult.annualPremium
                          )}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-gray-600">
                          Payment Amount
                        </span>

                        <span className="font-semibold text-gray-900">
                          {formatCurrency(
                            premiumResult.paymentAmount
                          )}
                        </span>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  calculating ||
                  creating
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              {!premiumResult ? (

                <button
                  type="button"
                  onClick={
                    handleCalculatePremium
                  }
                  disabled={
                    calculating ||
                    !form.customerId
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {calculating
                    ? "Calculating..."
                    : "Calculate Premium"}
                </button>

              ) : (

                <button
                  type="button"
                  onClick={
                    handleCreateQuote
                  }
                  disabled={creating}
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Quote"}
                </button>

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Quotes;