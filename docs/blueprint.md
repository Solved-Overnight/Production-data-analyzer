# **App Name**: Lantabur Production Dashboard

## Core Features:

- PDF Upload: Allows users to upload PDF documents containing production data from Lantabur and Taqwa industries, and limit parsing to only the first page.
- Data Extraction: Parses data from uploaded PDFs and automatically extracts the necessary metrics.  App can only work with PDFs in a known, fixed format.
- Formatted Output: Automatically format and output extracted data, mimicking a YAML or indented text style, for easy reading.
- Data Visualization: Generates charts that visually represent the parsed production data. Inhouse vs Subcontract should be a bar or pie chart, loading capacities, and monthly comparison charts. Leverage the Gmini API for generating enhanced chart visualizations.
- API Key Input: Users can enter their Gmini API key for visualization rendering.
- Customization Settings: Implement settings panel with options to switch between light and dark themes and pick an accent color to customize the look of the dashboard.
- Interaction Tools: Users can copy the data summary to clipboard, send summary via WhatsApp, or clear all uploaded files, outputs, and charts.

## Style Guidelines:

- Primary color: Use a desaturated blue (#5F9EA0) to provide a professional, reliable, trustworthy and calming feeling, in line with this kind of enterprise application.
- Background color: Light background (#F0F8FF) to complement the desaturated primary blue, and establish a clean and professional setting.
- Accent color: Use a light green (#90EE90) to highlight interactive elements, which will create contrast and guide user actions. Also avoid using red or orange, since those are likely to be relevant to an indicator.
- Body text: 'Inter', sans-serif, for a modern, neutral and objective feel.
- Headlines: 'Space Grotesk', sans-serif, for a computerized, techy, scientific feel.
- Employ a consistent set of professional icons (e.g. Material Design Icons) to visually represent data types and actions.
- Create a modern and clean layout with clear sections for data input, summary, visualization, and settings. Maintain consistency and use whitespace effectively.
- Incorporate subtle animations for loading states and transitions using Framer Motion or GSAP. Keep animations professional and avoid excessive or distracting effects.