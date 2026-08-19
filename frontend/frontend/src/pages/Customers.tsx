import {
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import type {
  Customer,
} from "../types";

import CustomerTable from "../components/customers/CustomerTable";

import AddCustomerModal from "../components/customers/AddCustomerModal";

function Customers() {

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<Customer[]>(
          "/customers"
        );

      setCustomers(
        response.data
      );

    } catch (error) {
      console.error(
        "LOAD CUSTOMERS ERROR:",
        error
      );

      setError(
        "Failed to load customers."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================
  // CLIENT-SIDE SEARCH
  // ==========================================

  const filteredCustomers =
    customers.filter(
      (customer) => {
        const searchValue =
          search
            .toLowerCase()
            .trim();

        if (!searchValue) {
          return true;
        }

        return (
          customer.fullName
            .toLowerCase()
            .includes(searchValue) ||

          customer.email
            .toLowerCase()
            .includes(searchValue)
        );
      }
    );

  // ==========================================
  // MODAL
  // ==========================================

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your insurance customers.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Customer
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
            setSearch(e.target.value)
          }
          placeholder="Search by name or email..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* ========================================
          CUSTOMER TABLE
      ======================================== */}

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        error={error}
        search={search}
      />

      {/* ========================================
          ADD CUSTOMER MODAL
      ======================================== */}

      {showModal && (
        <AddCustomerModal
          onClose={handleCloseModal}
          onSuccess={loadCustomers}
        />
      )}

    </div>
  );
}

export default Customers;