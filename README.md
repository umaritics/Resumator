Markdown
# Resumator 📄✨

**Live Demo:** [resumator-zeta.vercel.app](https://resumator-zeta.vercel.app)

Resumator is a full-stack web application designed to streamline the job application process. It leverages Google's Gemini API and robust PDF-parsing libraries to automatically extract unstructured data from user documents and generate highly tailored, professional resumes.

## ✨ Key Features

* **Intelligent PDF Parsing:** Extracts messy, unstructured text from uploaded documents and legacy resumes.
* **AI-Powered Data Structuring:** Utilizes the Gemini API to reliably map raw text into a strict, predictable JSON schema, minimizing AI hallucinations.
* **Tailored Generation:** Instantly formats the parsed data into a clean, modern resume layout ready for deployment.

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS, ShadCN UI
* **AI / LLM:** Google Gemini API
* **Data Processing:** PDF-parsing libraries

## 🚀 Local Development Setup

### Prerequisites

* Node.js 18+
* A free [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/resumator.git](https://github.com/your-username/resumator.git)
   cd resumator
Install dependencies:

Bash
npm install
# or yarn install / pnpm install
Configure Environment Variables:
Create a .env.local file in the root directory and add your Gemini API key:

Code snippet
GEMINI_API_KEY=your_api_key_here
Start the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to view the application.

🔮 Future Roadmap (Agentic Workflow)
While the current iteration relies on direct LLM API calls, the next phase of Resumator involves migrating to a LangGraph multi-agent architecture. This upgrade will introduce a dedicated "Validator Agent" designed to critique the generated resume against specific target job descriptions, forcing an automatic retry loop if the alignment score falls below a set quality threshold.
