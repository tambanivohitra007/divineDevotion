# Divine Devotion - AI-Powered Spiritual Content Generator

[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

Divine Devotion is a web application that generates spiritually uplifting content using the power of AI. It can create personalized **Devotionals** or **Faith & Learning Integration Ideas** for educators. All content aims to be strictly rooted in and aligned with: (1) The Holy Bible, (2) The complete, published writings of Ellen G. White, and (3) The official doctrines and fundamental beliefs of the Seventh-day Adventist Church.

## ✨ Features

*   **AI-Powered Content Generation:**
    *   **Devotionals:** Generate unique devotionals on various topics.
    *   **Faith & Learning Ideas:** Get AI-generated suggestions for integrating faith into educational topics.
*   **SDA Aligned Content:** Content is carefully generated to align with SDA beliefs, the Bible, and Ellen G. White's writings.
*   **Light/Dark Mode Toggle:** Switch between light and dark themes for comfortable reading, powered by Bootstrap 5.3. Theme preference is saved.
*   **Save Your Favorites:** Store generated content (devotionals or ideas) locally in your browser.
*   **Collapsible Sidebar:** Easily access saved content and search through them.
*   **Responsive Design:** Enjoy a seamless experience across desktop and mobile devices.
*   **Secure API Key Handling:** OpenAI API key is managed via environment variables.
*   **PWA Enabled:** Installable as a Progressive Web App for an app-like experience.
*   **Share Content:** Easily share generated content using the Web Share API (with clipboard fallback).
*   **Clickable Bible Verses:** Bible verses in devotionals link directly to Bible Gateway for further study.

## 🛠️ Tech Stack

*   **Frontend:** Vue 3 (Composition API), Vite, TypeScript
*   **Styling:** Bootstrap 5.3, Custom CSS Variables for Theming
*   **AI:** OpenAI API (e.g., gpt-4.1-nano)
*   **State Management:** Vue Reactivity (`ref`, `computed`, `watchEffect`)
*   **Persistence:** Browser `localStorage` for theme preference and saved content.
*   **PWA:** `vite-plugin-pwa`

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js) or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/divine-devotion.git
    cd divine-devotion
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your OpenAI API key:
    ```env
    VITE_OPENAI_API_KEY=your_openai_api_key_here
    ```
    *Note: The `.env` file is already included in `.gitignore` to prevent accidental commits of your API key.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application should now be running on `http://localhost:5173` (or the port specified by Vite).

## 📖 Usage

1.  **Select Content Type:** Choose between generating a "Devotion" or a "Faith & Learning Idea" using the tabs.
2.  **Enter a Topic:** In the input field, type a topic relevant to your selected content type.
    *   For Devotions: e.g., "Finding peace in hardship", "Gratitude".
    *   For Faith & Learning Ideas: e.g., "Teaching biology through a faith lens", "Ethics in computer science".
3.  **Generate Content:** Click the "Generate" button. The AI will create content based on your input.
4.  **View and Read:** The generated text (and relevant Bible verses for devotions) will be displayed.
5.  **Save Content:** If you like the generated piece, click the "Save" button to store it.
6.  **View Saved Content:** Access your saved items in the sidebar. You can search and filter them.
7.  **Toggle Theme:** Use the theme toggle button (sun/moon icon) to switch between light and dark modes.
8.  **Share:** Use the "Share" button to share the current content.
9.  **PWA Installation:** If your browser supports it, you may be prompted to install Divine Devotion as an app.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or want to contribute to the codebase, please feel free to:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please ensure your code adheres to the project's coding standards and includes tests where applicable.

## 📄 License

This project is currently not licensed. You are free to use, modify, and distribute the code for personal or educational purposes. For commercial use or other distribution, please contact the project maintainer.

---

We hope Divine Devotion brings you moments of peace, spiritual insight, and useful ideas for faith integration.
If you encounter any issues or have feedback, please open an issue on GitHub.
Last Updated: May 22, 2025
