import AdminFaqsClient from "@/app/admin/(dashboard)/faqs/AdminFaqsClient";
import { getAllFaqsAdmin, type FaqItem } from "@/app/actions/faqActions";

export default async function AdminFaqsPage() {
  let faqs: FaqItem[] = [];
  let dbError = false;

  try {
    const result = await getAllFaqsAdmin();
    if (result.success && result.data) {
      faqs = result.data;
    } else {
      dbError = true;
    }
  } catch (error) {
    console.error("Admin FAQs Page Fetch Error:", error);
    dbError = true;
  }

  return (
    <AdminFaqsClient initialFaqs={faqs} dbError={dbError} />
  );
}
