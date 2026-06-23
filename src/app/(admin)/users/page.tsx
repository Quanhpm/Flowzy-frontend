const pageStyle = {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: 24,
} as const;

export default function AdminUsersPage() {
  return (
    <main style={pageStyle}>
      <h1>Admin users module</h1>
    </main>
  );
}
