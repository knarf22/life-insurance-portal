import { useEffect, useMemo, useState} from "react";
import api from "../services/api";
import type {Customer, Quote} from "../types";
import QuoteTable from "../components/quotes/QuoteTable";
import CreateQuoteModal from "../components/quotes/CreateQuoteModal";

function Quotes() {
  // =========================================================
  // STATE
  // =========================================================

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updatingQuoteId, setUpdatingQuoteId] = useState<string | null>(null);


  // =========================================================
  // LOAD QUOTES
  // =========================================================

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<Quote[]>("/quotes");

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

  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================

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

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadQuotes();
    loadCustomers();
  }, []);

  // =========================================================
  // UPDATE QUOTE STATUS
  // =========================================================

  const handleUpdateStatus = async (
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

      await api.patch(
        `/quotes/${id}/status`,
        {
          status,
        }
      );

      await loadQuotes();
    } catch (error: any) {
      console.error(
        "UPDATE QUOTE STATUS ERROR:",
        error
      );

      if (
        error.response?.data?.message
      ) {
        alert(
          error.response.data.message
        );
      } else {
        alert(
          "Failed to update quote status."
        );
      }
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  // =========================================================
  // CONVERT QUOTE
  // =========================================================
  const handleConvertQuote = async (
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

      const response =
        await api.post(
          `/quotes/${id}/convert`
        );

      await loadQuotes();

      alert(
        `Application ${response.data.applicationNumber} created successfully.`
      );
    } catch (error: any) {
      console.error(
        "CONVERT QUOTE ERROR:",
        error
      );

      if (
        error.response?.data?.message
      ) {
        alert(
          error.response.data.message
        );
      } else {
        alert(
          "Failed to convert quote."
        );
      }
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const filteredQuotes =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      if (!searchValue) {
        return quotes;
      }

      return quotes.filter(
        (quote) => {
          return (
            quote.quoteNumber
              ?.toLowerCase()
              .includes(searchValue) ||

            quote.customerName
              ?.toLowerCase()
              .includes(searchValue) ||

            quote.product
              ?.toLowerCase()
              .includes(searchValue) ||

            quote.status
              ?.toLowerCase()
              .includes(searchValue)
          );
        }
      );
    }, [quotes, search]);


  // =========================================================
  // CURRENCY FORMATTER
  // =========================================================

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

  return (
    <div>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quotes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage insurance
            quotes.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowModal(true)
          }
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Quote
        </button>

      </div>


      {/* =====================================================
          SEARCH
          ===================================================== */}

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


      {/* =====================================================
          QUOTE TABLE
          ===================================================== */}

      <QuoteTable
        quotes={filteredQuotes}
        loading={loading}
        error={error}
        search={search}
        updatingQuoteId={
          updatingQuoteId
        }
        onUpdateStatus={
          handleUpdateStatus
        }
        onConvertQuote={
          handleConvertQuote
        }
        formatCurrency={
          formatCurrency
        }
      />


      {/* =====================================================
          CREATE QUOTE MODAL
          ===================================================== */}

      <CreateQuoteModal
        showModal={showModal}
        customers={customers}
        onClose={() =>
          setShowModal(false)
        }
        onQuoteCreated={
          loadQuotes
        }
      />

    </div>
  );
}

export default Quotes;