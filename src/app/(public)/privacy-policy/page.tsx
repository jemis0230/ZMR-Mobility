import React from "react";

export const metadata = {
  title: "Privacy Policy | ZMR Mobility",
  description: "Learn how ZMR Mobility collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 mb-4">Privacy <span className="text-primary">Policy</span></h1>
          <p className="text-white/40">Last Updated: May 10, 2026</p>
        </div>

        <div className="space-y-10 prose prose-invert prose-primary max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-white/60 leading-relaxed">
              ZMR Mobility Private Limited ("Company", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (the "Site") and use our services, including electric vehicle leasing and asset management.
            </p>
            <p className="text-white/60 leading-relaxed mt-4">
              By accessing or using our platform, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white/90 mb-2">A. Personal and Business Information</h3>
                <p className="text-white/60 leading-relaxed">
                  When you apply for a lease or contact us, we may collect:
                </p>
                <ul className="list-disc list-inside text-white/60 mt-2 space-y-1">
                  <li>Full Name and Contact Details (Email, Phone Number)</li>
                  <li>Residential and Business Addresses</li>
                  <li>KYC Documents (Aadhaar, PAN, GST details, Voter ID)</li>
                  <li>Financial Information (Bank statements, income proof)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/90 mb-2">B. Vehicle and Location Data</h3>
                <p className="text-white/60 leading-relaxed">
                  Our vehicles are equipped with IoT and telematics devices. We collect:
                </p>
                <ul className="list-disc list-inside text-white/60 mt-2 space-y-1">
                  <li>Real-time GPS location of the leased vehicle</li>
                  <li>Vehicle performance metrics (speed, battery health, mileage)</li>
                  <li>Usage patterns and charging data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/90 mb-2">C. Technical Data</h3>
                <p className="text-white/60 leading-relaxed">
                  We automatically collect certain information when you visit the Site:
                </p>
                <ul className="list-disc list-inside text-white/60 mt-2 space-y-1">
                  <li>IP Address and Device ID</li>
                  <li>Browser type and version</li>
                  <li>Operating system and platform</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-white/60 leading-relaxed">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-white/60 mt-4 space-y-2">
              <li>To provide and maintain our EV leasing services.</li>
              <li>To process your leasing applications and verify eligibility.</li>
              <li>To monitor vehicle health and security via IoT telematics.</li>
              <li>To communicate with you regarding your account, payments, and service updates.</li>
              <li>To improve our platform and develop new products.</li>
              <li>To comply with legal obligations and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
            <p className="text-white/60 leading-relaxed">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-white/60 mt-4 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services for us (e.g., payment processing, data analysis, customer support).</li>
              <li><strong>Partners:</strong> Financial institutions, insurance providers, and OEM partners involved in your lease.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights, property, or safety.</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or financing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p className="text-white/60 leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-white/60 leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-white/60 mt-4 space-y-2">
              <li>Access and receive a copy of your personal data.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Request deletion of your data (subject to legal and contractual requirements).</li>
              <li>Withdraw consent for data processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="text-white/60 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-6 glass-card border-white/5 bg-white/[0.02]">
              <p className="font-bold text-white">ZMR Mobility Private Limited</p>
              <p className="text-white/60 text-sm mt-1">Grievance Officer: Javed Ali</p>
              <p className="text-white/60 text-sm">Email: contact@zmrmobility.com</p>
              <p className="text-white/60 text-sm">Address: Gomti Nagar, Lucknow, UP, India</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
