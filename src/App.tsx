/**
 * Root composition.
 *
 * AuthProvider hydrates the custom session token before AppDataProvider
 * fetches tickets/projects. Do not swap that order — list RPCs need a token.
 */
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
