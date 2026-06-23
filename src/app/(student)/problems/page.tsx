const pageStyle = {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: 24,
} as const;

export default function StudentProblemsPage() {
  return (
    <main style={pageStyle}>
      <h1>Student problems module</h1>
    </main>
  );
}
