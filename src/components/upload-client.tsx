"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";

type UploadResult = {
  discrepancyCount: number;
  impactValue: number;
  importId: string;
  processedRows: number;
  reportPath?: string;
  totalRows: number;
};

const columnHelp = [
  {
    column: "external_id",
    description: "Identificador do pedido ou transação dentro da loja ou marketplace.",
    example: "PED-1001"
  },
  {
    column: "marketplace",
    description: "Nome do canal de venda ou gateway que gerou o recebimento.",
    example: "Shopify"
  },
  {
    column: "type",
    description: "Tipo da movimentação financeira no arquivo.",
    example: "sale"
  },
  {
    column: "amount",
    description: "Valor que entrou de fato no repasse.",
    example: "120.50"
  },
  {
    column: "expected_amount",
    description: "Valor que deveria ter entrado segundo a venda.",
    example: "120.50"
  },
  {
    column: "currency",
    description: "Moeda usada na operação.",
    example: "BRL"
  },
  {
    column: "status",
    description: "Situação da transação no momento do export.",
    example: "completed"
  },
  {
    column: "date",
    description: "Data do pedido ou do repasse.",
    example: "2026-06-13"
  }
] as const;

export function UploadClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function submitUpload() {
    if (!file) {
      setError("Selecione um arquivo CSV.");
      return;
    }

    setError("");
    setResult(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/imports", {
        body: formData,
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Não foi possível importar o arquivo.");
        return;
      }

      setResult(payload);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.push(`/reports/${payload.importId}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha de rede.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="upload-grid">
      <section
        className="upload-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setFile(event.dataTransfer.files.item(0));
        }}
      >
        <span className="eyebrow">Upload CSV</span>
        <h2>Importe extratos para conciliar recebimentos.</h2>
        <p>Arraste um arquivo CSV ou selecione do computador. Excel entra na v1.1.</p>
        <input
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.item(0) ?? null)}
          ref={inputRef}
          type="file"
        />
        <div className="upload-actions">
          <button className="button button-plan" disabled={isUploading} onClick={submitUpload} type="button">
            {isUploading ? "Processando..." : "Importar e reconciliar"}
          </button>
          <a className="button button-secondary app-secondary" href="/samples/demo-repassecheck.csv" download>
            Baixar CSV de teste
          </a>
          <span>{file ? file.name : "Nenhum arquivo selecionado"}</span>
        </div>
        {error ? <p className="form-message error">{error}</p> : null}
        {result ? (
          <div className="upload-result">
            <strong>Importação concluída</strong>
            <span>{result.processedRows} transações processadas</span>
            <span>{result.discrepancyCount} divergências detectadas</span>
            <span>Impacto estimado: {formatCurrency(result.impactValue)}</span>
            <div className="upload-result-actions">
              <a className="button button-secondary app-secondary" href={`/api/reports/imports/${result.importId}`}>
                Baixar CSV
              </a>
              <a className="button button-plan" href={`/reports/${result.importId}`}>
                Abrir relatório
              </a>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="schema-card">
        <span className="eyebrow">Modelo do CSV</span>
        <h3>Como preencher cada coluna</h3>
        <p className="schema-note">
          Se o arquivo veio do Shopify, WooCommerce, Amazon, Mercado Livre, Stripe ou PayPal, basta conferir se
          os dados abaixo existem. Não precisa ser técnico.
        </p>
        <div className="schema-help-grid">
          {columnHelp.map((item) => (
            <article className="schema-help-item" key={item.column}>
              <div className="schema-help-row">
                <strong>{item.column}</strong>
                <span>Exemplo: {item.example}</span>
              </div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <h4 className="schema-subtitle">Exemplo de linha pronta</h4>
        <pre>{`external_id,marketplace,type,amount,expected_amount,currency,status,date
PED-1001,Amazon,sale,120.50,120.50,BRL,completed,2026-06-13
PED-1002,Shopee,sale,90.00,110.00,BRL,completed,2026-06-13`}</pre>
      </aside>
    </div>
  );
}
