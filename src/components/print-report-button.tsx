"use client";

export function PrintReportButton() {
  return (
    <button className="button app-secondary" type="button" onClick={() => window.print()}>
      Imprimir relatório
    </button>
  );
}
