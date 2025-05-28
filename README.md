TradeTracker
A mobile-first income and expense tracking application designed specifically for small traders in retail and e-commerce.

Features
📊 Real-time Dashboard
Profit/loss summary with visual analytics
Interactive charts showing financial trends
Today's performance metrics
Recent transaction overview
➕ Smart Transaction Entry
Quick income/expense categorization
Voice input for hands-free data entry
Photo receipt capture and storage
Automatic timestamp tracking
🔍 Advanced Transaction Management
Search and filter capabilities
Category-based organization
Date range filtering
Transaction history with details
📈 Professional Reporting
Comprehensive financial summaries
Category breakdown analysis
CSV export for accounting software
PDF report generation
⚙️ Customizable Settings
Multiple currency support (USD, EUR, GBP)
Notification preferences
Default category settings
Data backup and export options
Technology Stack
Frontend: React with TypeScript
UI Components: Tailwind CSS + shadcn/ui
State Management: TanStack Query
Charts: Chart.js with React integration
Backend: Express.js
Storage: In-memory storage for rapid development
File Handling: Multer for receipt uploads
Voice Input: Web Speech Recognition API
Getting Started
Prerequisites
Node.js 20+
npm or yarn
Installation
Clone the repository:
git clone <your-repo-url>
cd tradetracker
Install dependencies:
npm install
Start the development server:
npm run dev
The application will be available at http://localhost:5000

Project Structure
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                # Shared types and schemas
└── uploads/               # Receipt storage directory
API Endpoints
Transactions
GET /api/transactions - Fetch all transactions
POST /api/transactions - Create new transaction
PUT /api/transactions/:id - Update transaction
DELETE /api/transactions/:id - Delete transaction
Analytics
GET /api/analytics/summary - Financial summary
GET /api/analytics/chart-data - Chart data for trends
GET /api/analytics/categories - Category breakdown
Settings
GET /api/settings - User preferences
PUT /api/settings - Update preferences
Features in Detail
Voice Input
The app supports hands-free transaction entry using the Web Speech Recognition API. Simply click the microphone icon when adding a transaction and speak your description.

Photo Receipts
Take photos of receipts directly within the app. Images are stored securely and linked to transactions for easy reference and record-keeping.

Export Options
CSV Export: Compatible with popular accounting software
PDF Reports: Professional financial reports with summaries and transaction details
Mobile-First Design
Optimized for mobile devices with:

Touch-friendly interface
Bottom navigation for easy thumb access
Responsive design that works on all screen sizes
Material Design principles for intuitive user experience
Contributing
Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Support
For support, questions, or feature requests, please open an issue in the GitHub repository.
