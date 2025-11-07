import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import type { Note } from "../../types/note";
import { useNotesStore } from "../../store/notesStore";
import { useToast } from "../ui/use-toast";
import RichTextEditor from "../editor/RichTextEditor";
import { useTheme } from "../../context/ThemeContext";

const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title must be 60 characters or less"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content too long"),
  tags: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface EditNoteModalProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
}

const EditNoteModal = ({ open, note, onClose }: EditNoteModalProps) => {
  const { updateNote, isLoading } = useNotesStore();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags?.join(", ") || "",
      });
    }
  }, [note, form]);

  const onSubmit = async (data: NoteFormData) => {
    if (!note) return;

    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      await updateNote(note._id, {
        title: data.title,
        content: data.content,
        tags,
      });

      toast({
        title: "Success!",
        description: "Note updated successfully.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[600px] p-6 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader className="mb-4">
          <DialogTitle
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Note
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter note title"
                      className={`h-11 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-teal-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      }`}
                      maxLength={60}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {field.value?.length || 0}/60
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Content
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Write your note here..."
                      onTagsSuggested={(tags) => {
                        const currentTagsStr = form.getValues("tags") || "";
                        const currentTags = currentTagsStr
                          ? currentTagsStr.split(",").map((t) => t.trim())
                          : [];
                        const newTags = [...new Set([...currentTags, ...tags])];
                        form.setValue("tags", newTags.join(", "));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Tags (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="work, ideas, personal (comma separated)"
                      className={`h-11 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-teal-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className={`transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-200 hover:text-white"
                    : "bg-white/90 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
                }`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Note"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteModal;
