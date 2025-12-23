import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Liên Hệ - NetTechPro | Hỗ Trợ 24/7",
  description: "Liên hệ NetTechPro để được tư vấn và hỗ trợ về thiết bị mạng. Chúng tôi luôn sẵn sàng phục vụ",
  // other metadata
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
