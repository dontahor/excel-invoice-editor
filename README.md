# Percy's Excel Invoice Editor

**Final Release v1.0**

A secure, browser-based tool designed to edit Excel invoices while maintaining perfect formatting and mobile compatibility.

## Features

-   **Mobile Compatible**: Generates iOS-readable `.xlsx` files using a custom browser-based engine (`xlsx-populate`).
-   **Secure**: All processing happens 100% in your browser. No files are ever uploaded to a server.
-   **Preserves Formatting**: Keeps your original Excel styles, merged cells, and layouts intact.
-   **Smart Filenaming**: Automatically increments invoice numbers based on the uploaded file.

## Usage

1.  Open the [Live Application](https://dontahor.github.io/excel-invoice-editor/).
2.  Drag and drop your previous invoice (e.g., `wk_38.xlsx`).
3.  Edit the details (Hours, Rate, Dates).
4.  Click **Save & Download**.
5.  Receive a correctly named file (e.g., `wk_39.xlsx`) ready for iOS.

## Technical Details

-   **Framework**: React + Vite
-   **Excel Engine**: `xlsx-populate` (Browser Polyfills enabled)
-   **Styling**: TailwindCSS + Glassmorphism UI
-   **Deployment**: GitHub Pages (Automated CI/CD)

---
*Powered by Coffee* ☕
