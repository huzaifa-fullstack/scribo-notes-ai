import { useState } from "react";
import { Download, Upload, FileJson, FileText, FileType } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import api from "../../services/api";

interface ExportImportModalProps {
  open: boolean;
  onClose: () => void;
  noteId?: string | null;
  onImportSuccess?: () => void;
}

const ExportImportModal = ({
  open,
  onClose,
  noteId = null,
  onImportSuccess,
}: ExportImportModalProps) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState("json");
  const [importFormat, setImportFormat] = useState("json");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      const endpoint = noteId
        ? `/export/note/${noteId}/${exportFormat}`
        : `/export/notes/${exportFormat}`;

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      // Get filename from response headers or create default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `note.${exportFormat}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create and download file
      const blob = new Blob([response.data], {
        type:
          exportFormat === "pdf"
            ? "application/pdf"
            : exportFormat === "json"
            ? "application/json"
            : "text/markdown",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `${
          noteId ? "Note" : "Notes"
        } exported as ${exportFormat.toUpperCase()}`,
      });

      onClose();
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error.response?.data?.error || "Failed to export note(s)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension based on selected format
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    let isValidFormat = false;
    switch (importFormat) {
      case "json":
        isValidFormat = fileExtension === "json";
        break;
      case "markdown":
        isValidFormat = fileExtension === "md" || fileExtension === "markdown";
        break;
      default:
        isValidFormat = false;
    }

    if (!isValidFormat) {
      const expectedExtensions =
        importFormat === "json"
          ? ".json"
          : importFormat === "markdown"
          ? ".md or .markdown"
          : "";
      toast({
        title: "Invalid file format",
        description: `Please select a ${expectedExtensions} file for ${importFormat} format.`,
        variant: "destructive",
      });
      event.target.value = ""; // Clear the input
      return;
    }

    setImportFile(file);
  };

  const handleFormatChange = (format: string) => {
    setImportFormat(format);
    setImportFile(null); // Clear file when format changes

    // Clear file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const downloadSampleFile = (type: "json" | "markdown") => {
    const filename = type === "json" ? "sample-notes.json" : "sample-notes.md";
    const link = document.createElement("a");
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const fileContent = await importFile.text();

      const response = await api.post("/export/import", {
        format: importFormat,
        data: importFormat === "json" ? JSON.parse(fileContent) : fileContent,
      });

      toast({
        title: "Import successful",
        description: `Imported ${response.data.count} note(s) successfully`,
      });

      onImportSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.response?.data?.error || "Failed to import notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAcceptAttribute = () => {
    switch (importFormat) {
      case "json":
        return ".json";
      case "markdown":
        return ".md,.markdown";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {noteId ? "Export Note" : "Export & Import All Notes"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export</h3>

            <div>
              <Label className="text-base font-medium">Export Format</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="json"
                    checked={exportFormat === "json"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-4 h-4"
                  />
                  <FileJson className="h-4 w-4" />
                  <span>JSON</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="markdown"
                    checked={exportFormat === "markdown"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-4 h-4"
                  />
                  <FileText className="h-4 w-4" />
                  <span>Markdown</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="pdf"
                    checked={exportFormat === "pdf"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-4 h-4"
                  />
                  <FileType className="h-4 w-4" />
                  <span>PDF</span>
                </label>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading
                ? "Exporting..."
                : `Export ${noteId ? "Note" : "All Notes"}`}
            </Button>
          </div>

          {/* Import Section - Only show for bulk operations */}
          {!noteId && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Import</h3>

              <div>
                <Label className="text-base font-medium">Import Format</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="importFormat"
                      value="json"
                      checked={importFormat === "json"}
                      onChange={(e) => handleFormatChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <FileJson className="h-4 w-4" />
                    <span>JSON</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="importFormat"
                      value="markdown"
                      checked={importFormat === "markdown"}
                      onChange={(e) => handleFormatChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <FileText className="h-4 w-4" />
                    <span>Markdown</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Sample Files:</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleFile("json")}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Sample JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleFile("markdown")}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Sample Markdown
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="import-file" className="text-base font-medium">
                  Select File
                </Label>
                <input
                  id="import-file"
                  type="file"
                  accept={getAcceptAttribute()}
                  onChange={handleFileChange}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {importFile && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!importFile || isLoading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? "Importing..." : "Import Notes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportModal;
