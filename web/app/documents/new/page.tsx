import NewDocumentWizard from "@/components/NewDocumentWizard";
import UsageBanner from "@/components/UsageBanner";

export default function NewDocumentPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <UsageBanner />
      </div>
      <NewDocumentWizard />
    </div>
  );
}