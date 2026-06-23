const pageStyle = {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: 24,
} as const;

export default function AdminProblemsPage() {
  return (
    <main style={pageStyle}>
      <h1>Admin problems module</h1>
    </main>
  );
}
