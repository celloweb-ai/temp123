<div align="center">
  <img src="./images/MOC_Studio.jpg" alt="MOC Studio Banner" width="100%" />
</div>

<br />

<div align="center">

# 🛢️ MOC Studio

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?logo=vercel)](https://moc-studio-dusky.vercel.app/)

**The Ultimate Oil & Gas Management of Change (MOC) Ecosystem with real-time telemetry, risk analysis, and AI technical support.**

[View Live Demo](https://moc-studio-kappa.vercel.app/) • [Documentation](./ABOUT.md) • [Report Issue](https://github.com/celloweb-ai/MOC_Studio/issues)

</div>

---

MOC Studio is a comprehensive web application designed to manage and track changes in oil and gas operations. Built with modern technologies, it provides real-time monitoring, risk assessment, asset management, and AI-powered technical assistance for operational excellence in offshore and onshore facilities.

---

## ✨ Features

### Core Functionality
- **📊 Real-time Dashboard** - Monitor critical KPIs, MOC statistics, and operational metrics at a glance
- **📝 MOC Management** - Complete lifecycle management for Management of Change processes
- **⚠️ Risk Matrix** - Visual risk assessment and analysis tools
- **🤖 AI Chat Assistant** - Google Gemini-powered technical support for MOC-related queries
- **🗺️ Facility Mapping** - Interactive geospatial visualization of facilities and assets using Leaflet
- **📦 Asset Inventory** - Comprehensive tracking and management of industrial assets
- **👥 User Management** - Role-based access control and user administration
- **🔔 Real-time Notifications** - Instant alerts for critical events and updates
- **📚 Help Center** - Comprehensive documentation and support resources

### Technical Features
- **🌐 Multilingual Support** - Full English (EN-US) and Portuguese (PT-BR) localization
- **🌓 Dark/Light Theme** - Complete theme switching with persistent preferences
- **🔐 Authentication System** - Secure login and session management
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **🔍 Advanced Search** - Full-text search across all modules
- **📈 Data Visualization** - Interactive charts powered by Recharts
- **⚡ Emergency Wizard** - Quick-response workflow for urgent MOC scenarios

---

## 🌐 Live Demo

**Experience MOC Studio in action:** [https://moc-studio-kappa.vercel.app/]

The live demo is deployed on Vercel and showcases all features including:
- Interactive dashboard with real-time metrics
- Complete MOC workflow management
- AI-powered technical assistant
- Risk assessment matrix
- Facility mapping with geolocation
- Asset inventory system

> **Note:** The demo uses simulated data for demonstration purposes.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/celloweb-ai/MOC_Studio.git
   cd MOC_Studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

The easiest way to deploy MOC Studio is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/celloweb-ai/MOC_Studio)

---

## 🏗️ Project Structure

```
MOC_Studio/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── AIChatAssistant.tsx
│   ├── AssetInventory.tsx
│   ├── Dashboard.tsx
│   ├── FacilityMap.tsx
│   ├── HelpCenter.tsx
│   ├── MOCList.tsx
│   ├── NotificationPanel.tsx
│   ├── RiskMatrix.tsx
│   ├── Sidebar.tsx
│   └── UserManagement.tsx
├── context/            # React Context providers
├── services/           # API and service integrations
├── images/             # Static images and assets
├── App.tsx             # Main application component
├── constants.tsx       # Application constants and translations
├── types.ts            # TypeScript type definitions
├── index.tsx           # Application entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.2.4** - Modern UI component library
- **TypeScript 5.8.2** - Type-safe JavaScript

### Build & Development
- **Vite 6.2.0** - Next-generation frontend tooling
- **@vitejs/plugin-react** - React integration for Vite

### UI & Visualization
- **Lucide React 0.475.0** - Beautiful icon library
- **Recharts 2.15.0** - Composable charting library
- **React Leaflet 5.0.0** - Interactive maps
- **Leaflet 1.9.4** - Mobile-friendly mapping library

### AI Integration
- **@google/genai 1.40.0** - Google Gemini AI integration for technical assistance

### Deployment
- **Vercel** - Production hosting and continuous deployment

---

## 🌍 Internationalization

MOC Studio supports multiple languages:
- **English (EN-US)** - Default language
- **Portuguese (PT-BR)** - Full Brazilian Portuguese support

Language selection is available in the application header and persists across sessions.

---

## 🎨 Themes

The application includes two carefully designed themes:
- **Light Mode** - Professional light theme optimized for daylight use
- **Dark Mode** - Eye-friendly dark theme for extended use

Theme preference is saved locally and applied automatically on subsequent visits.

---

## 🔐 Security

- Authentication required for all operations
- Role-based access control (RBAC)
- Secure API key management via environment variables
- Session management and timeout handling

---

## 📋 Key Modules

### Dashboard
Provides real-time overview of:
- Active MOCs count and status
- Pending approvals
- Risk distribution
- Recent activities
- System telemetry

### MOC Management
- Create, edit, and track MOC requests
- Emergency wizard for urgent changes
- Approval workflows
- Document attachments
- Audit trail

### Risk Matrix
- Visual risk assessment
- Likelihood vs. Consequence analysis
- Risk categorization (Low, Medium, High, Critical)
- Historical risk trends

### AI Chat Assistant
- Context-aware technical support
- MOC procedure guidance
- Standards and compliance information
- Powered by Google Gemini AI

### Facility Map
- Geographic visualization of facilities
- Asset location tracking
- Interactive markers and popups
- Geolocation support

### Asset Inventory
- Comprehensive asset database
- Equipment tracking
- Maintenance records
- Lifecycle management

---

## 🤝 Contributing

This is a private repository. For contribution guidelines, please contact the repository owner.

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Marcus Vasconcellos**  
Celloweb AI  
GitHub: [@celloweb-ai](https://github.com/celloweb-ai)

---

## 🆘 Support

For support, documentation, or feature requests:
- Use the built-in Help Center within the application
- Contact the development team
- Review the [complete documentation](./ABOUT.md)

---

## 🔄 Version History

- **v0.0.0** - Initial development release
  - Core MOC management features
  - Dashboard and analytics
  - AI integration
  - Multilingual support
  - Vercel deployment

---

## 🙏 Acknowledgments

- Built for the Oil & Gas industry
- Designed with input from offshore operations experts
- Compliant with industry MOC standards
- Powered by modern web technologies

---

## 🔗 Links

- **🌐 Live Application**: [https://moc-studio-dusky.vercel.app/](https://moc-studio-dusky.vercel.app/)
- **📚 AI Studio App**: [https://ai.studio/apps/drive/1R0kX6GDYTGZUjY46-D2z_bPkJITIwmvM](https://ai.studio/apps/drive/1R0kX6GDYTGZUjY46-D2z_bPkJITIwmvM)
- **💻 Repository**: [https://github.com/celloweb-ai/MOC_Studio](https://github.com/celloweb-ai/MOC_Studio)
- **📖 Documentation**: [ABOUT.md](./ABOUT.md)

---

**Built with ❤️ for operational excellence in Oil & Gas operations**
