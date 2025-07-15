import './index.css'
import { createRoot } from "react-dom/client";
import { App } from "./App";

// This is the entry point of the React application.
// It renders the App component into the root element of the HTML document.
// The App component contains the main application logic, including routing and authentication.
const container = document.getElementById("root");
// If the container element is found, it creates a root for React to render into.
if (container) {
  const root = createRoot(container);
  // renders the app component into the root element
  root.render(<App />);
}
