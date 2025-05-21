# Divine Devotion - AI-Powered Devotional Generator

[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com/)

Divine Devotion is a web application that generates spiritually uplifting devotionals using the power of AI. It aims to provide comfort, guidance, and a moment of reflection based on user-provided topics, strictly adhering to teachings from the Holy Bible, Ellen G. White's writings, and official Seventh-day Adventist (SDA) doctrines.

## ✨ Features

*   **AI-Powered Devotionals:** Generate unique devotionals on various topics.
*   **SDA Aligned Content:** Content is carefully generated to align with SDA beliefs, the Bible, and Ellen G. White's writings.
*   **Light/Dark Mode Toggle:** Switch between light and dark themes for comfortable reading, powered by Bootstrap 5.3.
*   **Save Your Favorites:** Store generated devotionals locally in your browser for later access.
*   **Responsive Design:** Enjoy a seamless experience across different devices.
*   **Secure API Key Handling:** OpenAI API key is managed via environment variables.

## 🛠️ Tech Stack

*   **Frontend:** Vue 3 (Composition API), Vite, TypeScript
*   **Styling:** Bootstrap 5.3, Custom CSS
*   **AI:** OpenAI API (gpt-4.1-nano or preferred model)
*   **State Management:** Vue Reactivity (ref, reactive)
*   **Persistence:** Browser `localStorage` for theme preference and saved devotions.

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

1.  **Enter a Topic:** In the input field, type a topic for which you'd like a devotional (e.g., "Faith", "Hope", "Love").
2.  **Generate Devotional:** Click the "Generate" button. The AI will create a devotional based on your topic.
3.  **View and Read:** The generated devotional text and relevant Bible verses will be displayed.
4.  **Save Devotional:** If you like the devotional, click the "Save" button to store it in your browser.
5.  **View Saved Devotions:** Access your saved devotionals in the "Saved Devotions" section.
6.  **Toggle Theme:** Use the theme toggle button (usually a sun/moon icon) to switch between light and dark modes. Your preference will be saved.

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

We hope Divine Devotion brings you moments of peace and spiritual insight.
If you encounter any issues or have feedback, please open an issue on GitHub.
