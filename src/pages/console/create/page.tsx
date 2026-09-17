/**
 * Staff create-ticket page. Same RequestForm as client, mode="console".
 */
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import RequestForm from "@/components/feature/RequestForm";

export default function ConsoleCreatePage() {
  return (
    <ConsoleLayout>
      <RequestForm mode="console" />
    </ConsoleLayout>
  );
}