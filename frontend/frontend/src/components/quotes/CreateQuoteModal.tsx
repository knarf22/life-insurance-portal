import { useRef, useState } from "react";
import api from "../../services/api";
import type { CreateQuoteModalProps, CreateQuoteRequest, PremiumResult } from "../../types";

const initialForm: CreateQuoteRequest = {
    customerId: "",
    product: "TERM_LIFE",
    coverageAmount: 1000000,
    policyTermYears: 5,
    paymentFrequency: "MONTHLY",
};

function CreateQuoteModal({
    showModal,
    customers,
    onClose,
    onQuoteCreated,
}: CreateQuoteModalProps) {
    const [calculating, setCalculating] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");
    const [premiumResult, setPremiumResult] = useState<PremiumResult | null>(null);
    const [form, setForm] = useState<CreateQuoteRequest>(initialForm);
    const modalBodyRef = useRef<HTMLDivElement>(null);

    if (!showModal) {
        return null;
    }

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

    const handleCloseModal = () => {
        if (
            calculating ||
            creating
        ) {
            return;
        }

        setFormError("");
        setPremiumResult(null);

        onClose();
    };

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

        // Existing calculation becomes
        // invalid if the form changes.
        setPremiumResult(null);

        setFormError("");
    };

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

                const response =
                    await api.post<PremiumResult>(
                        "/quotes/calculate-premium",
                        form
                    );

                setPremiumResult(
                    response.data
                );

                setTimeout(() => {
                    modalBodyRef.current?.scrollTo(
                        {
                            top:
                                modalBodyRef.current
                                    ?.scrollHeight ?? 0,
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

                await api.post(
                    "/quotes",
                    form
                );

                await onQuoteCreated();

                setForm(initialForm);
                setPremiumResult(null);

                onClose();
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">

                {/* MODAL HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create Quote
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter the quote details.
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
                                        Premium Calculation
                                    </h3>

                                    <p className="mt-1 text-xs text-blue-700">
                                        Review the calculated
                                        premium before creating
                                        the quote.
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
    );
}

export default CreateQuoteModal;