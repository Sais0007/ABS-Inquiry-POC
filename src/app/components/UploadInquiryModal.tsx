import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { FormModal, FormFooter } from "./hb/common/Form";
import { PrimaryButton, SecondaryButton } from "./hb/listing";
import { toast } from "sonner";

interface UploadInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (fileNames: string[]) => void;
}

interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "failed";
  error?: string;
}

export default function UploadInquiryModal({
  isOpen,
  onClose,
  onUploadSuccess
}: UploadInquiryModalProps) {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset files list on close or open
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setIsUploading(false);
    }
  }, [isOpen]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check type: PDF only
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return { valid: false, error: "Only PDF files are supported." };
    }
    // Check size: max 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "Maximum allowed file size is 10 MB." };
    }
    return { valid: true };
  };

  const handleFileAddition = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const updatedQueue = [...files];
    let hasInvalid = false;
    let errorMessage = "";

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const validation = validateFile(file);

      if (!validation.valid) {
        hasInvalid = true;
        errorMessage = validation.error || "Invalid file.";
        continue;
      }

      // Check if file is already in queue to prevent duplicates
      const isDuplicate = updatedQueue.some(q => q.file.name === file.name && q.file.size === file.size);
      if (isDuplicate) continue;

      updatedQueue.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: "idle"
      });
    }

    setFiles(updatedQueue);

    if (hasInvalid) {
      toast.error(errorMessage);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileAddition(e.dataTransfer.files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    if (isUploading) return;
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Run progress simulation for a single file
  const simulateFileUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Randomly simulate a 15% failure rate for demonstration
        const shouldFail = Math.random() < 0.15;
        if (shouldFail) {
          setFiles(prev => prev.map(f => f.id === fileId ? { 
            ...f, 
            status: "failed", 
            error: "Network error occurred." 
          } : f));
          toast.error("Some uploads failed. Please retry.");
        } else {
          setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "success", progress: 100 } : f));
        }
      } else {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      }
    }, 200);
  };

  const handleUploadStart = () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    // Find all files that are not already successfully uploaded
    const filesToUpload = files.filter(f => f.status !== "success");

    // Reset status to uploading/idle for simulation
    setFiles(prev => prev.map(f => f.status !== "success" ? { ...f, status: "uploading", progress: 0 } : f));

    filesToUpload.forEach(f => {
      simulateFileUpload(f.id);
    });
  };

  const handleRetry = (id: string) => {
    simulateFileUpload(id);
  };

  // Monitor files to auto-close modal once all files are successfully uploaded
  useEffect(() => {
    if (!isUploading || files.length === 0) return;

    const allFinished = files.every(f => f.status === "success" || f.status === "failed");
    const anyFailed = files.some(f => f.status === "failed");

    if (allFinished) {
      setIsUploading(false);
      if (!anyFailed) {
        // All successful! Prepend to listing
        const successfulFileNames = files.map(f => f.file.name);
        onUploadSuccess(successfulFileNames);
        onClose();
      }
    }
  }, [files, isUploading, onUploadSuccess, onClose]);

  const handleCancelClick = () => {
    if (isUploading) return;
    setFiles([]);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Calculate disabled state for upload button
  const hasFiles = files.length > 0;
  const isUploadDisabled = !hasFiles || isUploading || files.every(f => f.status === "success");

  return (
    <FormModal
      isOpen={isOpen}
      onClose={isUploading ? () => {} : handleCancelClick}
      title="Upload Inquiry"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-5 select-none">
        
        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : handleBrowseClick}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-white dark:bg-neutral-900/10 ${
            isDragActive 
              ? "border-primary bg-primary-50/20 dark:bg-primary-950/15" 
              : "border-neutral-200 dark:border-neutral-800 hover:border-primary hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileAddition(e.target.files)}
            multiple
            accept=".pdf"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-500">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {isDragActive ? "Drop files to upload" : "Drag & Drop Inquiry PDFs Here"}
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              or <span className="text-primary font-medium hover:underline">Browse PDF Files</span>
            </p>
          </div>
          <div className="text-[10px] text-neutral-400 flex flex-col items-center gap-1 mt-1 border-t border-neutral-100 dark:border-neutral-800/40 pt-2 w-full max-w-[200px]">
            <span>Supported Format: PDF Only</span>
            <span>Max File Size: 10 MB per file</span>
          </div>
        </div>

        {/* Helper info text when empty */}
        {files.length === 0 && (
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
            You can upload one or multiple inquiry PDFs at the same time.
          </p>
        )}

        {/* Upload Queue List */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            <h5 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">
              Upload Queue ({files.length} {files.length === 1 ? "file" : "files"})
            </h5>
            
            {files.map((queued) => {
              const isFailed = queued.status === "failed";
              const isSuccess = queued.status === "success";
              const isCurrentUploading = queued.status === "uploading";

              return (
                <div 
                  key={queued.id}
                  className={`flex items-center gap-3.5 p-3 rounded-lg border bg-neutral-50/50 dark:bg-neutral-950/20 transition-all ${
                    isFailed 
                      ? "border-red-200 dark:border-red-950/60 bg-red-50/5" 
                      : isSuccess 
                        ? "border-emerald-250 dark:border-emerald-950/60 bg-emerald-50/5"
                        : "border-neutral-100 dark:border-neutral-850"
                  }`}
                >
                  {/* PDF Icon */}
                  <div className={`p-2 rounded bg-white dark:bg-neutral-900 border ${
                    isFailed 
                      ? "border-red-100 dark:border-red-950" 
                      : isSuccess 
                        ? "border-emerald-100 dark:border-emerald-950"
                        : "border-neutral-200/60 dark:border-neutral-800"
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      isFailed 
                        ? "text-red-500" 
                        : isSuccess 
                          ? "text-emerald-500" 
                          : "text-neutral-400"
                    }`} />
                  </div>

                  {/* File Metadata & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <span className="truncate max-w-[280px]" title={queued.file.name}>{queued.file.name}</span>
                      <span className="font-mono text-[10px] text-neutral-400 shrink-0">{formatSize(queued.file.size)}</span>
                    </div>

                    {/* Progress Bar / Status */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-200 ${
                            isFailed 
                              ? "bg-red-500" 
                              : isSuccess 
                                ? "bg-emerald-500" 
                                : "bg-primary"
                          }`}
                          style={{ width: `${queued.progress}%` }}
                        />
                      </div>
                      
                      {/* Percent badge / Status label */}
                      <span className="font-mono text-[10px] w-10 text-right shrink-0">
                        {isFailed ? (
                          <span className="text-red-500 font-semibold">Failed</span>
                        ) : isSuccess ? (
                          <span className="text-emerald-500 font-semibold">100%</span>
                        ) : (
                          `${queued.progress}%`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0">
                    {isSuccess && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mr-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Uploaded</span>
                      </div>
                    )}
                    {isFailed && (
                      <button
                        onClick={() => handleRetry(queued.id)}
                        className="p-1.5 text-neutral-400 hover:text-primary rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-neutral-900"
                        title="Retry upload"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(!isSuccess && !isFailed) && (
                      <button
                        onClick={() => removeFile(queued.id)}
                        disabled={isUploading}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <FormFooter className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
          <SecondaryButton 
            onClick={handleCancelClick}
            disabled={isUploading}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={handleUploadStart}
            disabled={isUploadDisabled}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </PrimaryButton>
        </FormFooter>

      </div>
    </FormModal>
  );
}
