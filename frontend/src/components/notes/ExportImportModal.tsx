import { useState } from "react";
import { Download, Upload, FileJson, FileText, FileType } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
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

  // Reset state when modal closes
  const handleClose = () => {
    setImportFile(null);
    setExportFormat("json");
    setImportFormat("json");
    onClose();
  };

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

      handleClose();
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

    // If file is selected, validate it against new format
    if (importFile) {
      const fileExtension = importFile.name.split(".").pop()?.toLowerCase();
      let isValidFormat = false;

      switch (format) {
        case "json":
          isValidFormat = fileExtension === "json";
          break;
        case "markdown":
          isValidFormat =
            fileExtension === "md" || fileExtension === "markdown";
          break;
      }

      if (!isValidFormat) {
        const expectedExtensions =
          format === "json"
            ? ".json"
            : format === "markdown"
            ? ".md or .markdown"
            : "";
        toast({
          title: "File format mismatch",
          description: `Selected file does not match ${format} format. Expected ${expectedExtensions}`,
          variant: "destructive",
        });
      }
    }
  };

  // Check if selected file matches the import format
  const isFileFormatValid = () => {
    if (!importFile) return false;

    const fileExtension = importFile.name.split(".").pop()?.toLowerCase();

    switch (importFormat) {
      case "json":
        return fileExtension === "json";
      case "markdown":
        return fileExtension === "md" || fileExtension === "markdown";
      default:
        return false;
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

    // Validate file format matches selected import format
    const fileExtension = importFile.name.split(".").pop()?.toLowerCase();
    let isValidFormat = false;

    switch (importFormat) {
      case "json":
        isValidFormat = fileExtension === "json";
        break;
      case "markdown":
        isValidFormat = fileExtension === "md" || fileExtension === "markdown";
        break;
    }

    if (!isValidFormat) {
      const expectedExtensions =
        importFormat === "json"
          ? ".json"
          : importFormat === "markdown"
          ? ".md or .markdown"
          : "";
      toast({
        title: "File format mismatch",
        description: `Please select a ${expectedExtensions} file for ${importFormat} format.`,
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

      // Reset file and close
      setImportFile(null);
      onImportSuccess?.();
      handleClose();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">
            {noteId ? "Export Note" : "Export & Import Notes"}
          </DialogTitle>
        </DialogHeader>

        {noteId ? (
          // Single note export - No tabs needed
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">
                Export Format
              </Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="json" id="export-json" />
                    <Label
                      htmlFor="export-json"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <FileJson className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">JSON</p>
                        <p className="text-xs text-gray-500">
                          Perfect for backup and re-import
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="markdown" id="export-md" />
                    <Label
                      htmlFor="export-md"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Markdown</p>
                        <p className="text-xs text-gray-500">
                          Readable format for other apps
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pdf" id="export-pdf" />
                    <Label
                      htmlFor="export-pdf"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <FileType className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">PDF</p>
                        <p className="text-xs text-gray-500">
                          All notes in one PDF
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Download className="mr-0.5 h-4 w-4" />
              {isLoading ? "Exporting..." : "Export Note"}
            </Button>
          </div>
        ) : (
          // Bulk operations - Use tabs for Export/Import
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-6 py-4">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Export Format
                </Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="json" id="export-json-all" />
                      <Label
                        htmlFor="export-json-all"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileJson className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">JSON</p>
                          <p className="text-xs text-gray-500">
                            Perfect for backup and re-import
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="markdown" id="export-md-all" />
                      <Label
                        htmlFor="export-md-all"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Markdown</p>
                          <p className="text-xs text-gray-500">
                            Readable format for other apps
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="pdf" id="export-pdf-all" />
                      <Label
                        htmlFor="export-pdf-all"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileType className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">PDF</p>
                          <p className="text-xs text-gray-500">
                            All notes in one PDF
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Download className="mr-0.5 h-4 w-4" />
                {isLoading ? "Exporting..." : "Export All Notes"}
              </Button>
            </TabsContent>

            <TabsContent value="import" className="space-y-6 py-4">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Import Format
                </Label>
                <RadioGroup
                  value={importFormat}
                  onValueChange={handleFormatChange}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="json" id="import-json" />
                      <Label
                        htmlFor="import-json"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileJson className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">JSON</p>
                          <p className="text-xs text-gray-500">
                            Perfect for backup and re-import
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="markdown" id="import-md" />
                      <Label
                        htmlFor="import-md"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Markdown</p>
                          <p className="text-xs text-gray-500">
                            Readable format for other apps
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Sample Files
                </Label>
                <p className="text-xs text-gray-600">
                  Download sample files to see the expected format
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleFile("json")}
                    className="flex-1"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Sample JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSampleFile("markdown")}
                    className="flex-1"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Sample Markdown
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="import-file"
                  className="text-sm font-semibold text-gray-700"
                >
                  Select File
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    id="import-file"
                    type="file"
                    accept={getAcceptAttribute()}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>
                {importFile && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Selected: {importFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!importFile || !isFileFormatValid() || isLoading}
                className="w-full"
                size="lg"
              >
                <Upload className="mr-0.5 h-4 w-4" />
                {isLoading ? "Importing..." : "Import Notes"}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportModal;
