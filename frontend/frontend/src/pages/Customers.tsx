import { useEffect, useState } from "react";
import api from "../services/api";
import type { CreateCustomerForm, Customer } from "../types";



function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<CreateCustomerForm>({
    fullName: "",
    dateOfBirth: "",
    email: "",
    mobileNumber: "",
    isSmoker: false,
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // ==========================================
  // Load Customers
  // ==========================================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Customer[]>("/customers");

      setCustomers(response.data);
    } catch (error) {
      console.error("LOAD CUSTOMERS ERROR:", error);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================
  // Client-side Search
  // ==========================================
  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      customer.fullName.toLowerCase().includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue)
    );
  });

  // ==========================================
  // Form Change
  // ==========================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // Open Modal
  // ==========================================
  const handleOpenModal = () => {
    setFormError("");

    setForm({
      fullName: "",
      dateOfBirth: "",
      email: "",
      mobileNumber: "",
      isSmoker: false,
    });

    setShowModal(true);
  };

  // ==========================================
  // Close Modal
  // ==========================================
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setFormError("");
  };

  // ==========================================
  // Create Customer
  // ==========================================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      console.log("CREATE CUSTOMER REQUEST:", form);

      await api.post("/customers", form);

      // Successfully created
      setShowModal(false);

      // Reset form
      setForm({
        fullName: "",
        dateOfBirth: "",
        email: "",
        mobileNumber: "",
        isSmoker: false,
      });

      // Refresh customer list
      await loadCustomers();
    } catch (error: any) {
      console.error("CREATE CUSTOMER ERROR:", error);

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "RESPONSE:",
        error.response?.data
      );

      // ASP.NET validation errors
      if (error.response?.data?.errors) {
        console.log(
          "VALIDATION ERRORS:",
          error.response.data.errors
        );

        const validationErrors = Object.values(
          error.response.data.errors
        )
          .flat()
          .join(" ");

        setFormError(
          validationErrors || "Please check the form fields."
        );
      }

      // Custom backend message
      else if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      }

      // Generic error
      else {
        setFormError("Failed to create customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ==========================================
          Header
      ========================================== */}
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

      {/* ==========================================
          Search
      ========================================== */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* ==========================================
          Customer Table
      ========================================== */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading customers...
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {search
              ? "No customers match your search."
              : "No customers found."}
          </div>
        ) : (
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
              {filteredCustomers.map((customer) => (
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
        )}
      </div>

      {/* ==========================================
          Add Customer Modal
      ========================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Customer
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the customer's information.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 py-6">

                {/* Error */}
                {formError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Smoker */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isSmoker"
                    checked={form.isSmoker}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Customer is a smoker
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;