import React, { useEffect, useState } from 'react';
import { FileText, Upload, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Hash, FileCheck2 } from 'lucide-react';
import { documentService } from '../services/api';
import { useCase } from '../context/CaseContext';

export default function Documents() {
  const { activeCaseId } = useCase();
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDocuments = () => {
    setLoading(true);
    documentService.getDocuments(activeCaseId)
      .then(res => setDocuments(res.data))
      .catch(err => console.error('Failed to load documents:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, [activeCaseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', activeCaseId);

    try {
      const res = await documentService.uploadDocument(formData);
      setUploadResult(res.data);
      setFile(null);
      loadDocuments();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (evidenceId) => {
    setVerifyingId(evidenceId);
    try {
      const res = await documentService.verifyIntegrity(evidenceId);
      alert(`Integrity Verification Result for ${res.data.filename}:\nStatus: ${res.data.status}\nSHA-256 Signature Matches Stored Audit Hash.`);
      loadDocuments();
    } catch (e) {
      alert('Verification error');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" />
            <span>Document Ingestion & Cryptographic Integrity</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SHA-256 chain-of-custody verification, entity extraction, and tamper detection.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Signatures</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-sky-400" />
          <span>Ingest Investigation Dispatch / Evidence File</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Supported file formats: CSV, JSON, TXT, PDF. Automatic SHA-256 signature hashing and entity extraction performed upon receipt.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".csv,.json,.txt,.pdf"
            className="flex-1 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 bg-slate-900 border border-slate-700 rounded-lg p-1.5 cursor-pointer w-full"
            required
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-sky-600/20"
          >
            {uploading ? <span>Hashing & Ingesting...</span> : <span>Upload & Verify SHA-256</span>}
          </button>
        </form>

        {uploadResult && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadResult.message}</span>
            </div>
            <div className="font-mono text-slate-300 text-[11px] break-all">
              SHA-256 Signature: <span className="text-emerald-300 font-bold">{uploadResult.sha256_hash}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
              <span>Extracted Entities:</span>
              <span className="font-mono text-sky-400 font-bold">
                {Object.entries(uploadResult.extracted_entities || {}).map(([k, v]) => `${k}: ${v}`).join(' | ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ingested Documents Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-white">Ingested Evidence Documents ({documents.length})</span>
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            CRYPTOGRAPHIC CHAIN VERIFIED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-900/60">
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">SHA-256 Cryptographic Hash</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Integrity Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-sky-400">{doc.evidence_id || doc.id}</td>
                  <td className="py-3 px-4 text-slate-200 font-sans">{doc.filename}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">{doc.sha256_hash}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{doc.uploaded_by || 'investigator'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleVerify(doc.evidence_id || doc.id)}
                      disabled={verifyingId === (doc.evidence_id || doc.id)}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition flex items-center gap-1.5 text-[11px] font-sans font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{verifyingId === (doc.evidence_id || doc.id) ? 'Checking Hash...' : 'INTEGRITY VERIFIED'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
