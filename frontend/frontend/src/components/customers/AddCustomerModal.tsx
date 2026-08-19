import { useState } from "react";
import type { AddCustomerModalProps, CreateCustomerForm, } from "../../types";



function AddCustomerModal({
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
  const [form, setForm] =
    useState<CreateCustomerForm>({
      fullName: "",
      dateOfBirth: "",
      email: "",
      mobileNumber: "",
      isSmoker: false,
    });

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      console.log(
        "CREATE CUSTOMER REQUEST:",
        form
      );

      const { default: api } =
        await import("../../services/api");

      await api.post(
        "/customers",
        form
      );

      // Refresh customer list
      await onSuccess();

      // Close modal
      onClose();

    } catch (error: any) {
      console.error(
        "CREATE CUSTOMER ERROR:",
        error
      );

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "RESPONSE:",
        error.response?.data
      );

      // API validation errors
      if (
        error.response?.data?.errors
      ) {
        console.log(
          "VALIDATION ERRORS:",
          error.response.data.errors
        );

        const validationErrors =
          Object.values(
            error.response.data.errors
          )
            .flat()
            .join(" ");

        setFormError(
          validationErrors ||
            "Please check the form fields."
        );
      }

      // Custom backend message
      else if (
        error.response?.data?.message
      ) {
        setFormError(
          error.response.data.message
        );
      }

      // Generic error
      else {
        setFormError(
          "Failed to create customer."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        {/* ========================================
            HEADER
        ======================================== */}

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
            onClick={onClose}
            disabled={saving}
            className="text-2xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* ========================================
            FORM
        ======================================== */}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">

            {/* ERROR */}

            {formError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {/* FULL NAME */}

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

            {/* DATE OF BIRTH */}

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

            {/* EMAIL */}

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

            {/* MOBILE */}

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

            {/* SMOKER */}

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

          {/* ========================================
              FOOTER
          ======================================== */}

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
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
              {saving
                ? "Saving..."
                : "Save Customer"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;