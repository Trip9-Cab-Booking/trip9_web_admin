import React from "react";

const Profile: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Profile</h1>

      <div style={styles.card}>
        <h2 style={styles.subtitle}>Under Construction</h2>
        <p style={styles.text}>
          This section is currently being developed.
          Please check back soon.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "16px",
  },
  card: {
    maxWidth: "420px",
    width: "100%",
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "8px",
  },
  text: {
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default Profile;
