import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeClient } from "@/components/providers/ThemeClient";
import AppLayout from "@/layouts/AppLayout";
import AnalyticsPage from "@/pages/AnalyticsPage";
import OverviewPage from "@/pages/OverviewPage";

export default function App() {
  return (
    <ThemeClient>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeClient>
  );
}
