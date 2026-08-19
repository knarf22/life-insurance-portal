export interface Customer {
  id: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  isSmoker: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  product: "TERM_LIFE" | "WHOLE_LIFE";
  coverageAmount: number;
  policyTermYears: number;
  paymentFrequency: "MONTHLY" | "ANNUAL";
  annualPremium: number;
  paymentAmount: number;
  status: "DRAFT" | "ACCEPTED" | "DECLINED" | "CONVERTED";
  createdAt: string;
}

export interface PolicyApplication {
  id: string;
  applicationNumber: string;
  quoteId: string;
  customerId: string;
  customerName: string;
  product: string;
  coverageAmount: number;
  policyTermYears: number;
  annualPremium: number;
  paymentAmount: number;
  applicationDate: string;
  status: string;
}

export interface CreateQuoteRequest {
  customerId: string;
  product: "TERM_LIFE" | "WHOLE_LIFE";
  coverageAmount: number;
  policyTermYears: number;
  paymentFrequency: "MONTHLY" | "ANNUAL";
}

export interface CreateCustomerForm {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  isSmoker: boolean;
}

export interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string;
  search: string;
}

export interface AddCustomerModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export interface QuoteTableProps {
  quotes: Quote[];
  loading: boolean;
  error: string;
  search: string;
  updatingQuoteId: string | null;

  onUpdateStatus: (
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ) => void;

  onConvertQuote: (id: string) => void;

  formatCurrency: (amount: number) => string;
}

export interface CreateQuoteModalProps {
    showModal: boolean;
    customers: Customer[];

    onClose: () => void;
    onQuoteCreated: () => Promise<void>;
}

export interface CreateQuoteRequest {
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

export interface PremiumResult {
    baseAnnualPremium: number;

    riskLoadingPercent: number;

    annualPremium: number;

    paymentAmount: number;
}
