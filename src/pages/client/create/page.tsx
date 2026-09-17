/**
 * Government "Raise request" page. Same RequestForm as console create, mode="client".
 */
import ClientLayout from "@/pages/client/components/ClientLayout";
import RequestForm from "@/components/feature/RequestForm";

export default function ClientCreatePage() {
  return (
    <ClientLayout>
      <RequestForm mode="client" />
    </ClientLayout>
  );
}