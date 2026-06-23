const pageStyle = {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: 24,
} as const;

export default function StudentTasksPage() {
  return (
    <main style={pageStyle}>
      <h1>Student tasks module</h1>
    </main>
  );
}
