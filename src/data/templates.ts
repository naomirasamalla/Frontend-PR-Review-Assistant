export interface CodeTemplate {
  name: string;
  language: string;
  context: string;
  code: string;
  description: string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    name: "Stale State Closure & Raw Event Link",
    language: "React / TSX",
    context: "Dynamic notification badge update callback logic",
    description: "Contains severe stale closures in async handlers and manual DOM selection anti-patterns.",
    code: `import React, { useState, useEffect } from 'react';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Stale closure bug: referencing 'count' directly without functional state update
    // also lacking removal of event listener on unmount
    const handleRemoteMessage = () => {
      console.log("Current count at trigger:", count);
      setCount(count + 1); 
    };

    window.addEventListener('update-badge', handleRemoteMessage);
  }, []); // Empty dependency array captures 'count' at initial value (0)

  // Manual document trigger which bypasses Virtual DOM principles
  const triggerManualReset = () => {
    const el = document.getElementById("badge-pill");
    if (el) {
      el.style.transform = "scale(1.2)";
      setTimeout(() => {
        el.style.transform = "none";
      }, 300);
    }
    setCount(0);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg">
      <div id="badge-pill" className="px-3 py-1 bg-blue-600 text-white rounded-full transition-transform">
        Notifications: {count}
      </div>
      <button onClick={triggerManualReset} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
        Reset Count
      </button>
    </div>
  );
}`
  },
  {
    name: "Infinite Re-render and Stale Logic",
    language: "React / JSX",
    context: "A user profile card that fetches and maintains dynamic views",
    description: "Contains an anti-pattern useEffect that loops infinitely on resize triggers.",
    code: `import React, { useState, useEffect } from 'react';

export default function UserCard() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState({ name: "Jane Doe", role: "Contributor" });
  
  // Triggers infinite loops because of object state creation
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Simulating updates on local user profile
    setUserData({ name: "Jane Doe", role: "Contributor" }); 
    
    return () => window.removeEventListener('resize', handleResize);
  }, [userData]); // userData reference changes every render!

  return (
    <div className="p-4 border rounded">
      <h3>{userData.name}</h3>
      <p>{userData.role}</p>
      <span>Width: {windowWidth}px</span>
    </div>
  );
}`
  },
  {
    name: "Hardcoded & Unreusable Tab Component",
    language: "React / TSX",
    context: "Tab switcher for dashboard settings tabs",
    description: "Hardcoded configuration arrays, lacking dynamic configuration templates.",
    code: `import React, { useState } from "react";

export default function TabSwitcher() {
  const [activeTab, setActiveTab] = useState("profile");

  // Completely hardcoded, unreusable tab system
  return (
    <div className="tabs-container">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("profile")}
          className={\`p-3 \${activeTab === "profile" ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-500"}\`}
        >
          Profile Config
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={\`p-3 \${activeTab === "security" ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-500"}\`}
        >
          Password & Security
        </button>
        <button 
          onClick={() => setActiveTab("integrations")}
          className={\`p-3 \${activeTab === "integrations" ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-500"}\`}
        >
          External Integrations
        </button>
      </div>

      <div className="p-4">
        {activeTab === "profile" && <div>Profile options: name, picture, public username...</div>}
        {activeTab === "security" && <div>Security controls: enable validation tokens...</div>}
        {activeTab === "integrations" && <div>Connected accounts: Github, Slack pipelines...</div>}
      </div>
    </div>
  );
}`
  }
];
