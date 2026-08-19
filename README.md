# life-insurance-portal

# Life Insurance Quote & Application Portal

A full-stack Life Insurance Quote and Application Portal for managing customers, insurance quotations, and policy applications.

## Technology Stack

### Backend

* ASP.NET Core Web API 8.0
* C#
* Entity Framework Core
* REST API
* Swagger / OpenAPI

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios

### Database

* Microsoft SQL Server

### Version Control

* Git / GitHub

---

## Project Structure

```text
life-insurance-portal/
├── backend/
│   └── LifeInsurance.Api/
├── frontend/
│   └── frontend/
├── database/
│   └── Db_query.text
└── README.md
```

---

# Setup and Run

## Prerequisites

Make sure the following are installed:

* .NET 8 SDK
* Node.js and npm
* Microsoft SQL Server
* SQL Server Management Studio (SSMS)
* Visual Studio 2022 or Visual Studio Code

---

## 1. Clone the Repository

```bash
git clone https://github.com/knarf22/life-insurance-portal.git
cd life-insurance-portal
```

---

## 2. Database Setup

Open **SQL Server Management Studio (SSMS)**.

Open the following file from the repository:

```text
database/Db_query.text
```

Copy and execute the SQL script in SSMS.

The script creates:

* `LifeInsuranceDb` database
* `Customers` table
* `Quotes` table
* `PolicyApplications` table
* Primary keys
* Foreign keys
* Unique constraints
* Database validation constraints

No Entity Framework migrations are required. The database schema is created directly using the provided SQL script.

---

## 3. Configure the Backend

Open:

```text
backend/LifeInsurance.Api/appsettings.json
```

Update the SQL Server connection string according to your local SQL Server configuration.

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=LifeInsuranceDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

If your SQL Server instance uses a different server name, update the `Server` value accordingly.

For example, SQL Server Express may use:

```text
Server=localhost\SQLEXPRESS;
```

---

# 4. Run the Backend

The backend can be run using either **Visual Studio 2022** or **Visual Studio Code**.

## Option A — Visual Studio 2022

1. Open the `LifeInsurance.Api` project in Visual Studio 2022.
2. Set `LifeInsurance.Api` as the Startup Project.
3. Press **F5** or click **Start**.
4. The API will start using the HTTPS URL configured for the project.

### Current Backend URL

The current project configuration uses:

```text
https://localhost:7102/
```

Swagger:

```text
https://localhost:7102/swagger
```

### Important: Backend Port

The backend port may be different depending on the local environment or `launchSettings.json`.

If the backend starts on a different port, update the API base URL in:

```text
frontend/frontend/src/services/api.ts
```

Current configuration:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7102/api",
});

export default api;
```

If the backend starts on another port, replace `7102` with the actual HTTPS port.

For example:

```typescript
baseURL: "https://localhost:7200/api"
```

---

## Option B — Visual Studio Code

Open the backend project:

```bash
cd backend/LifeInsurance.Api
code .
```

Restore the dependencies:

```bash
dotnet restore
```

Run the API:

```bash
dotnet run
```

The backend URL will be displayed in the terminal.

If the backend starts on a different port, update:

```text
frontend/frontend/src/services/api.ts
```

so that the `baseURL` matches the backend URL.

---

# 5. Run the Frontend

Open another terminal.

Navigate to the frontend project:

```bash
cd frontend/frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the URL displayed by Vite, usually:

```text
http://localhost:5173
```

Make sure the API `baseURL` in:

```text
frontend/frontend/src/services/api.ts
```

matches the backend HTTPS URL.

For the current project configuration:

```typescript
const api = axios.create({
  baseURL: "https://localhost:7102/api",
});
```

---

# Premium Calculation

Premium calculation is performed on the **backend**.

The frontend may display premium information, but the backend recalculates and validates the premium when a quotation is created.

## Base Annual Premium

The base annual premium is calculated using:

```text
Base Annual Premium = Coverage Amount × 0.012
```

## Risk Loading

The total risk loading is the sum of all applicable loadings:

```text
Total Risk Loading =
    Age Loading
    + Smoker Loading
    + Product Loading
    + Term Loading
```

### Age Loading

| Customer Age | Risk Loading |
| ------------ | -----------: |
| 31–45        |          15% |
| 46–55        |          35% |
| 56–65        |          70% |

### Other Risk Loadings

| Rule                | Risk Loading |
| ------------------- | -----------: |
| Smoker              |          25% |
| Whole Life          |          20% |
| 15-year policy term |          10% |
| 20-year policy term |          20% |

No additional loading is applied for:

* Non-smokers
* Term Life
* 5-year policy term
* 10-year policy term

## Final Annual Premium

```text
Final Annual Premium =
    Base Annual Premium × (1 + Total Risk Loading)
```

## Monthly Payment

For monthly payment frequency:

```text
Monthly Payment =
    Final Annual Premium ÷ 12
```

For annual payment frequency:

```text
Annual Payment =
    Final Annual Premium
```

---

## Premium Calculation Example

For a **40-year-old smoker** requesting:

* Coverage: ₱1,000,000
* Product: Whole Life
* Policy Term: 20 years
* Payment Frequency: Monthly

### Step 1 — Base Premium

```text
₱1,000,000 × 0.012
= ₱12,000
```

### Step 2 — Risk Loading

```text
Age 31–45      = 15%
Smoker         = 25%
Whole Life     = 20%
20-year term   = 20%

Total Loading  = 80%
```

### Step 3 — Final Annual Premium

```text
₱12,000 × 1.80
= ₱21,600
```

### Step 4 — Monthly Payment

```text
₱21,600 ÷ 12
= ₱1,800
```

Therefore:

```text
Annual Premium  = ₱21,600
Monthly Payment = ₱1,800
```

---

# Money Handling

Monetary values are stored using SQL Server:

```text
DECIMAL(18,2)
```

This is used for coverage amounts and premium values to avoid floating-point precision issues when handling monetary data.

---

# Customer Validation

The backend validates submitted customer information.

The following rules are enforced:

* All customer fields are required.
* Email must use a valid format.
* Mobile number must use a valid format.
* Customer age must not exceed 65 years old at the application date.
* Date of birth is used to accurately determine the customer's age.

---

# Quote Workflow

New quotations are created with a `DRAFT` status.

The quote workflow is:

```text
              ┌───────────┐
              │   DRAFT   │
              └─────┬─────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
       ┌──────────┐   ┌──────────┐
       │ ACCEPTED │   │ DECLINED │
       └────┬─────┘   └──────────┘
            │
            ▼
       ┌───────────┐
       │ CONVERTED │
       └─────┬─────┘
             │
             ▼
    Policy Application
```

### Quote Business Rules

* Newly created quotations start with `DRAFT`.
* A Draft quote can be changed to `ACCEPTED`.
* A Draft quote can be changed to `DECLINED`.
* Only an Accepted quote can be converted.
* A Declined quote cannot be converted.
* A Draft quote cannot be converted.
* A Converted quote cannot be edited.
* A Converted quote cannot be converted again.

---

# Policy Application Workflow

When an Accepted quotation is converted:

1. A unique application number is generated.
2. A new policy application is created.
3. The application status is set to `PENDING_UNDERWRITING`.
4. The customer's quotation details are stored in the application.
5. The premium details are stored as a snapshot.
6. The original quote is marked as `CONVERTED`.

The application retains the quotation and premium information that was used at the time of conversion.

---

# API Endpoints

| Method | Endpoint                | Description                                         |
| ------ | ----------------------- | --------------------------------------------------- |
| GET    | `/customers?search=`    | Get/search customers                                |
| POST   | `/customers`            | Create a customer                                   |
| GET    | `/quotes?status=`       | Get/filter quotations                               |
| POST   | `/quotes`               | Create a quotation and calculate premium            |
| PATCH  | `/quotes/{id}/status`   | Accept or decline a quotation                       |
| POST   | `/quotes/{id}/convert`  | Convert an accepted quote into a policy application |
| GET    | `/applications?status=` | Get/filter policy applications                      |

---

# Main Features

## Customer Management

* Add customers
* Display customer list
* Search customers by full name or email
* Validate customer information
* Track smoker status

## Quote Management

* Create Term Life and Whole Life quotations
* Support 5, 10, 15, and 20-year policy terms
* Support Monthly and Annual payment frequencies
* Calculate premiums based on business rules
* Filter quotations by status
* Accept or decline Draft quotations
* Convert Accepted quotations into policy applications

## Policy Applications

* Generate unique application numbers
* Create applications from Accepted quotations
* Set application status to `PENDING_UNDERWRITING`
* Store quotation and premium information as a snapshot
* Filter applications by status

---

# Repository

GitHub repository:

https://github.com/knarf22/life-insurance-portal

---

## Author

Developed as a Life Insurance Quote & Application Portal technical assessment.
