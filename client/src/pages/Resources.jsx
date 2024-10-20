import React from "react";

const resources = [
  {
    title: "Network Security Best Practices",
    description: "Learn essential practices for securing your network from cyber threats.",
    link: "https://example.com/network-security-best-practices",
  },
  {
    title: "Incident Response Guide",
    description: "A step-by-step guide to handling security incidents effectively.",
    link: "https://example.com/incident-response-guide",
  },
  {
    title: "Data Encryption Techniques",
    description: "Explore various encryption methods to protect your sensitive data.",
    link: "https://example.com/data-encryption-techniques",
  },
  {
    title: "Cybersecurity Compliance Checklist",
    description: "Ensure your organization complies with industry cybersecurity standards.",
    link: "https://example.com/compliance-checklist",
  },
];

const ResourcesPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cybersecurity Resources</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{resource.title}</h2>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
