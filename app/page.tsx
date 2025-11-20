"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to /school after 1 second
    const timer = setTimeout(() => {
      router.push("/school");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  const handleClick = () => {
    router.push("/school");
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#0369a1',
          marginBottom: '1rem'
        }}>
          School Management System
        </h1>
        <p style={{ 
          color: '#64748b', 
          marginBottom: '1.5rem' 
        }}>
          Redirecting to portal...
        </p>
        <button
          onClick={handleClick}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go to Portal
        </button>
      </div>
    </div>
  );
}
