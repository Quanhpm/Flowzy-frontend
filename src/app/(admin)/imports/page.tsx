const pageStyle = {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: 24,
} as const;

export default function AdminImportsPage() {
  return (
    <main style={pageStyle}>
      <h1>Admin imports module</h1>
    </main>
  );
}
