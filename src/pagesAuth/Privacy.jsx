import React from 'react';

const PrivacyPolicy = () => {
  const appName = "Progz";
  const contactEmail = "admin@urbancode.in";

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm p-4 p-md-5">
            <h1 className=" fw-bold text-success mb-3"> Privacy Policy of {appName}</h1>
            <p className="text-muted mb-5">Last Updated: February 16, 2026</p>

            <section className="mb-4">
              <h2 className="h4 fw-semibold border-bottom pb-2">Introduction</h2>
              <p className="mt-3">
                Progz is a product developed by Urbancode Edutech Solutions Pvt. Ltd. At {appName}, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
              </p>
            </section>
            <section className="mb-4">
              <h2 className="h4 fw-semibold border-bottom pb-2">1. Information Collection</h2>
              <p className="mt-3">
                We collect personal information such as your name and email when you register. 
                This data is stored securely in our MongoDB database and processed via our Node.js API.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-semibold border-bottom pb-2">2. Data Usage</h2>
              <p className="mt-3">We use your information to:</p>
              <ul>
                <li>Maintain your user profile and authentication.</li>
                <li>Improve the {appName} educational experience.</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-semibold border-bottom pb-2">3. Third-Party Services</h2>
              <p className="mt-3">
                We use Vercel for hosting and MongoDB Atlas for database management. 
                These providers have their own privacy standards and policies.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-semibold border-bottom pb-2">4. Your Rights & Deletion</h2>
              <p className="mt-3">
                You can request the permanent deletion of your account and data by emailing 
                us at <span className="text-success fw-bold">{contactEmail}</span>.
              </p>
            </section>

            <footer className="mt-5 pt-4 border-top text-center text-muted">
              <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;