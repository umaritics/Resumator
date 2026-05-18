# Resumator 📄✨

**Live Demo:** [resumator-zeta.vercel.app](https://resumator-zeta.vercel.app)

Resumator is a full-stack web application designed to streamline the job application process. It leverages Google's Gemini API and robust PDF-parsing libraries to automatically extract unstructured data from user documents and generate highly tailored, professional resumes.

---

## ✨ Key Features

- **Intelligent PDF Parsing:** Extracts messy, unstructured text from uploaded documents and legacy resumes.
- **AI-Powered Data Structuring:** Utilizes the Gemini API to reliably map raw text into a strict, predictable JSON schema, minimizing AI hallucinations.
- **Tailored Resume Generation:** Instantly formats the parsed data into a clean, modern resume layout ready for deployment.
- **Modern UI/UX:** Built with responsive and elegant UI components using Tailwind CSS and ShadCN UI.
- **Fast & Scalable:** Powered by Next.js for optimized performance and seamless deployment.

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- ShadCN UI

### AI / LLM
- Google Gemini API

### Data Processing
- PDF Parsing Libraries

---

## 🚀 Local Development Setup

### Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- A free [Google Gemini API Key](https://aistudio.google.com/)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/umaritics/Resumator.git
cd resumator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## 📂 Project Structure

```bash
resumator/
│── app/
│── components/
│── lib/
│── public/
│── styles/
│── .env.local
│── package.json
│── README.md
```

---

## 🔮 Future Roadmap (Agentic Workflow)

While the current iteration relies on direct LLM API calls, the next phase of **Resumator** involves migrating to a **LangGraph multi-agent architecture**.

### Planned Enhancements

- 🤖 **Validator Agent**
  - Critiques generated resumes against target job descriptions.
  - Evaluates alignment quality and ATS compatibility.

- 🔁 **Automatic Retry Loop**
  - If the generated resume scores below a defined threshold, the system automatically regenerates and improves the output.

- 📊 **Resume Scoring System**
  - Provides users with detailed feedback and optimization suggestions.

- 🎯 **Job-Specific Tailoring**
  - Enhances personalization for specific industries and roles.

---

## 🌟 Vision

Resumator aims to become an intelligent AI-powered career assistant that not only generates resumes but continuously optimizes them for real-world hiring success.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to fork the repository and submit a pull request.

---

## 👨‍💻 Author

Developed with ❤️ by **Muhammad Umar**
