import Navbar from "@/presentation/components/Navbar";
import Footer from "@/presentation/components/Footer";
import WhatsAppButton from "@/presentation/components/WhatsAppButton";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
