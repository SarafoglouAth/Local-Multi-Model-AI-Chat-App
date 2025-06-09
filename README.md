# 🤖 Local Multi-Model AI Chat App

A privacy-first, local-first AI chat interface that supports multiple models like **OpenAI GPT**, **Anthropic Claude**, and **Meta’s LLaMA** (future-ready). Attach files, customize prompts, and maintain context — all without needing an external backend or cloud DB.

***

## 🌟 Features

* 🔄 Dropdown to switch between AI models (e.g. GPT-4, Claude, Meta)
* 📎 Attach files to use as context in prompts
* ✏️ Fully editable prompt input
* 💬 Context-aware conversation
* 🖥️ Runs locally — no server, no cloud storage
* 🔐 Your data, your control

***

## 🚀 Getting Started

### 1. Prerequisites

* [Node.js](https://nodejs.org/en/) (v18+ recommended)
* [npm](https://www.npmjs.com/)

### 2. Clone the Repository

```
git clone https://github.com/SarafoglouAth/Local-Multi-Model-AI-Chat-App.git
cd Local-Multi-Model-AI-Chat-App
```

### 3. Install Dependencies

```
npm install
```

***

## 🔐 Environment Setup: API Keys

Create a `.env` file in the root of your project:

```
touch .env
```

Then add the following (include only what you use):

```
# OpenAI API (for GPT-4, GPT-3.5)
OPENAI_API_KEY=your-openai-api-key

# Anthropic API (for Claude models)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Meta API (if available, optional)
META_API_KEY=your-meta-api-key

```

> ⚠️ Keep your `.env` file safe and **never commit it to GitHub**.

***

### 4. Run the App

```
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173/)

***

## 🧠 Tech Stack

* **Vite** – Superfast development environment
* **React + TypeScript** – Modern frontend architecture
* **Tailwind CSS** – Styling with utility classes
* **dotenv** – Environment variable handlin

***

## 📄 License

This project is licensed under the **MIT License**.

&#x20;
