# FitGuide - AI-Powered Diet & Fitness Tracker

FitGuide is a comprehensive web application designed to help users track their diet, exercise, water intake, sleep, and weight. It features AI-powered food suggestions and detailed graphical reports to monitor progress over time.

## 🚀 Features

-   **User Dashboard**: At-a-glance summary of daily progress (Calories, Carbs, Protein, Fat).
-   **Food Tracking**: Log meals with detailed nutritional info.
-   **AI Diet Suggestions**: Get personalized diet recommendations powered by Google GenAI.
-   **Activity Tracker**: Log exercises and track calories burned.
-   **Water & Weight Tracker**: Monitor hydration and weight trends.
-   **Sleep Tracker**: Track sleep duration and quality.
-   **Visual Analytics**: Interactive weekly and monthly charts.
-   **Reports**: Generate download monthly PDF reports.
-   **Dark Mode**: Sleek, modern dark-themed UI.
-   **Responsive Design**: Fully optimized for mobile and desktop.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React 19 (Vite)
-   **Styling**: Tailwind CSS v4
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **HTTP Client**: Axios

### Backend
-   **Framework**: Django 5.1
-   **API**: Django REST Framework
-   **Database**: SQLite (Default)
-   **AI Integration**: Google Generative AI (Gemini)
-   **PDF Generation**: xhtml2pdf / WeasyPrint
-   **Utilities**: Whitenoise for static files

## 📋 Prerequisites

Ensure you have the following installed:
-   **Node.js** (v18+ recommended)
-   **Python** (v3.10+ recommended)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sabirmhd/FitGuide.git
cd FitGuide
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run migrations:
```bash
python manage.py migrate
```

Start the server:
```bash
python manage.py runserver
```
The backend will run at `http://127.0.0.1:8000/`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will run at `http://localhost:5173/` (or similar).

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory with the following keys:

```ini
SECRET_KEY=your_django_secret_key
DEBUG=True
GOOGLE_API_KEY=your_gemini_api_key
```

## 📄 License

This project is open-source and available under the MIT License.
