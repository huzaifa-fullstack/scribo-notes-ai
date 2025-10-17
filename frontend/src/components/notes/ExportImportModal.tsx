import { useState } from "react";
import { Download, Upload, FileJson, FileText, FileType } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
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
      let filename = noteId
        ? `note.${exportFormat}`
        : `notes_backup.${exportFormat}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: `${noteId ? "Note" : "Notes"} exported successfully.`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description:
          error.response?.data?.error || "Failed to export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [".json", ".md"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JSON or Markdown file.",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the input
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the input
        return;
      }

      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const fileContent = await importFile.text();

      const response = await api.post("/export/import", {
        format: importFormat,
        data:
          importFormat === "json" || importFormat === "notion"
            ? JSON.parse(fileContent)
            : fileContent,
      });

      toast({
        title: "Success!",
        description: `Imported ${response.data.count} notes successfully.`,
      });

      setImportFile(null);
      onClose();
      onImportSuccess?.();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description:
          error.response?.data?.error ||
          "Failed to import. Please check file format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {noteId ? "Export Note" : "Export & Import Notes"}
          </DialogTitle>
        </DialogHeader>

        {noteId ? (
          // Single Note Export - No tabs, just export options
          <div className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="json" id="export-json" />
                  <Label
                    htmlFor="export-json"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <FileJson className="h-4 w-4 mr-2 text-blue-600" />
                    <div>
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-500">
                        Perfect for backup and re-import
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="markdown" id="export-markdown" />
                  <Label
                    htmlFor="export-markdown"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2 text-purple-600" />
                    <div>
                      <div className="font-medium">Markdown</div>
                      <div className="text-xs text-gray-500">
                        Readable format for other apps
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="pdf" id="export-pdf" />
                  <Label
                    htmlFor="export-pdf"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <FileType className="h-4 w-4 mr-2 text-red-600" />
                    <div>
                      <div className="font-medium">PDF</div>
                      <div className="text-xs text-gray-500">
                        Print-ready document
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleExport}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Exporting..." : "Export Note"}
            </Button>
          </div>
        ) : (
          // All Notes - Show tabs for export and import
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export
              </TabsTrigger>
              <TabsTrigger value="import">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-3">
                <Label>Export Format</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="json" id="export-json" />
                    <Label
                      htmlFor="export-json"
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <FileJson className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-xs text-gray-500">
                          Perfect for backup and re-import
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="markdown" id="export-markdown" />
                    <Label
                      htmlFor="export-markdown"
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2 text-purple-600" />
                      <div>
                        <div className="font-medium">Markdown</div>
                        <div className="text-xs text-gray-500">
                          Readable format for other apps
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pdf" id="export-pdf" />
                    <Label
                      htmlFor="export-pdf"
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <FileType className="h-4 w-4 mr-2 text-red-600" />
                      <div>
                        <div className="font-medium">PDF</div>
                        <div className="text-xs text-gray-500">
                          {noteId
                            ? "Print-ready document"
                            : "All notes in one PDF"}
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleExport}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? "Exporting..."
                  : `Export ${noteId ? "Note" : "All Notes"}`}
              </Button>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import" className="space-y-4">
              <div className="space-y-3">
                <Label>Import Format</Label>
                <RadioGroup
                  value={importFormat}
                  onValueChange={setImportFormat}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="json" id="import-json" />
                    <Label
                      htmlFor="import-json"
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <FileJson className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-xs text-gray-500">
                          Import from backup
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="markdown" id="import-markdown" />
                    <Label
                      htmlFor="import-markdown"
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2 text-purple-600" />
                      <div>
                        <div className="font-medium">Markdown</div>
                        <div className="text-xs text-gray-500">
                          Import .md files
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">Select File</Label>
                <div className="text-xs text-gray-500 mb-2">
                  Accepted formats: JSON (.json), Markdown (.md)
                </div>
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.md"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                />
                {importFile && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Selected: {importFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleImport}
                className="w-full"
                disabled={isLoading || !importFile}
              >
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
