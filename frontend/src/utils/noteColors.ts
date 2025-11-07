/**
 * Color utilities for notes
 * Generates consistent pastel colors based on tags
 */

export interface NoteColorScheme {
  background: string;
  backgroundHover: string;
  border: string;
  borderHover: string;
  text: string;
  tagBackground: string;
  tagText: string;
  shadow: string;
  shadowHover: string;
}

// Predefined pastel color schemes for light mode
const pastelColorSchemes: NoteColorScheme[] = [
  // Soft Blue
  {
    background: "bg-blue-50/80",
    backgroundHover: "hover:bg-blue-100/90",
    border: "border-blue-200",
    borderHover: "hover:border-blue-300",
    text: "text-gray-900",
    tagBackground: "bg-blue-100",
    tagText: "text-blue-700",
    shadow: "shadow-blue-100",
    shadowHover: "hover:shadow-blue-200",
  },
  // Soft Green
  {
    background: "bg-green-50/80",
    backgroundHover: "hover:bg-green-100/90",
    border: "border-green-200",
    borderHover: "hover:border-green-300",
    text: "text-gray-900",
    tagBackground: "bg-green-100",
    tagText: "text-green-700",
    shadow: "shadow-green-100",
    shadowHover: "hover:shadow-green-200",
  },
  // Soft Yellow
  {
    background: "bg-yellow-50/80",
    backgroundHover: "hover:bg-yellow-100/90",
    border: "border-yellow-200",
    borderHover: "hover:border-yellow-300",
    text: "text-gray-900",
    tagBackground: "bg-yellow-100",
    tagText: "text-yellow-700",
    shadow: "shadow-yellow-100",
    shadowHover: "hover:shadow-yellow-200",
  },
  // Soft Purple
  {
    background: "bg-purple-50/80",
    backgroundHover: "hover:bg-purple-100/90",
    border: "border-purple-200",
    borderHover: "hover:border-purple-300",
    text: "text-gray-900",
    tagBackground: "bg-purple-100",
    tagText: "text-purple-700",
    shadow: "shadow-purple-100",
    shadowHover: "hover:shadow-purple-200",
  },
  // Soft Pink
  {
    background: "bg-pink-50/80",
    backgroundHover: "hover:bg-pink-100/90",
    border: "border-pink-200",
    borderHover: "hover:border-pink-300",
    text: "text-gray-900",
    tagBackground: "bg-pink-100",
    tagText: "text-pink-700",
    shadow: "shadow-pink-100",
    shadowHover: "hover:shadow-pink-200",
  },
  // Soft Orange
  {
    background: "bg-orange-50/80",
    backgroundHover: "hover:bg-orange-100/90",
    border: "border-orange-200",
    borderHover: "hover:border-orange-300",
    text: "text-gray-900",
    tagBackground: "bg-orange-100",
    tagText: "text-orange-700",
    shadow: "shadow-orange-100",
    shadowHover: "hover:shadow-orange-200",
  },
  // Soft Indigo
  {
    background: "bg-indigo-50/80",
    backgroundHover: "hover:bg-indigo-100/90",
    border: "border-indigo-200",
    borderHover: "hover:border-indigo-300",
    text: "text-gray-900",
    tagBackground: "bg-indigo-100",
    tagText: "text-indigo-700",
    shadow: "shadow-indigo-100",
    shadowHover: "hover:shadow-indigo-200",
  },
  // Soft Teal
  {
    background: "bg-teal-50/80",
    backgroundHover: "hover:bg-teal-100/90",
    border: "border-teal-200",
    borderHover: "hover:border-teal-300",
    text: "text-gray-900",
    tagBackground: "bg-teal-100",
    tagText: "text-teal-700",
    shadow: "shadow-teal-100",
    shadowHover: "hover:shadow-teal-200",
  },
  // Soft Rose
  {
    background: "bg-rose-50/80",
    backgroundHover: "hover:bg-rose-100/90",
    border: "border-rose-200",
    borderHover: "hover:border-rose-300",
    text: "text-gray-900",
    tagBackground: "bg-rose-100",
    tagText: "text-rose-700",
    shadow: "shadow-rose-100",
    shadowHover: "hover:shadow-rose-200",
  },
  // Soft Cyan
  {
    background: "bg-cyan-50/80",
    backgroundHover: "hover:bg-cyan-100/90",
    border: "border-cyan-200",
    borderHover: "hover:border-cyan-300",
    text: "text-gray-900",
    tagBackground: "bg-cyan-100",
    tagText: "text-cyan-700",
    shadow: "shadow-cyan-100",
    shadowHover: "hover:shadow-cyan-200",
  },
  // Soft Lime
  {
    background: "bg-lime-50/80",
    backgroundHover: "hover:bg-lime-100/90",
    border: "border-lime-200",
    borderHover: "hover:border-lime-300",
    text: "text-gray-900",
    tagBackground: "bg-lime-100",
    tagText: "text-lime-700",
    shadow: "shadow-lime-100",
    shadowHover: "hover:shadow-lime-200",
  },
  // Soft Amber
  {
    background: "bg-amber-50/80",
    backgroundHover: "hover:bg-amber-100/90",
    border: "border-amber-200",
    borderHover: "hover:border-amber-300",
    text: "text-gray-900",
    tagBackground: "bg-amber-100",
    tagText: "text-amber-700",
    shadow: "shadow-amber-100",
    shadowHover: "hover:shadow-amber-200",
  },
  // Soft Violet
  {
    background: "bg-violet-50/80",
    backgroundHover: "hover:bg-violet-100/90",
    border: "border-violet-200",
    borderHover: "hover:border-violet-300",
    text: "text-gray-900",
    tagBackground: "bg-violet-100",
    tagText: "text-violet-700",
    shadow: "shadow-violet-100",
    shadowHover: "hover:shadow-violet-200",
  },
  // Soft Fuchsia
  {
    background: "bg-fuchsia-50/80",
    backgroundHover: "hover:bg-fuchsia-100/90",
    border: "border-fuchsia-200",
    borderHover: "hover:border-fuchsia-300",
    text: "text-gray-900",
    tagBackground: "bg-fuchsia-100",
    tagText: "text-fuchsia-700",
    shadow: "shadow-fuchsia-100",
    shadowHover: "hover:shadow-fuchsia-200",
  },
  // Soft Emerald
  {
    background: "bg-emerald-50/80",
    backgroundHover: "hover:bg-emerald-100/90",
    border: "border-emerald-200",
    borderHover: "hover:border-emerald-300",
    text: "text-gray-900",
    tagBackground: "bg-emerald-100",
    tagText: "text-emerald-700",
    shadow: "shadow-emerald-100",
    shadowHover: "hover:shadow-emerald-200",
  },
  // Soft Sky
  {
    background: "bg-sky-50/80",
    backgroundHover: "hover:bg-sky-100/90",
    border: "border-sky-200",
    borderHover: "hover:border-sky-300",
    text: "text-gray-900",
    tagBackground: "bg-sky-100",
    tagText: "text-sky-700",
    shadow: "shadow-sky-100",
    shadowHover: "hover:shadow-sky-200",
  },
  // Deep Blue
  {
    background: "bg-blue-100/70",
    backgroundHover: "hover:bg-blue-200/80",
    border: "border-blue-300",
    borderHover: "hover:border-blue-400",
    text: "text-gray-900",
    tagBackground: "bg-blue-200",
    tagText: "text-blue-800",
    shadow: "shadow-blue-200",
    shadowHover: "hover:shadow-blue-300",
  },
  // Deep Green
  {
    background: "bg-green-100/70",
    backgroundHover: "hover:bg-green-200/80",
    border: "border-green-300",
    borderHover: "hover:border-green-400",
    text: "text-gray-900",
    tagBackground: "bg-green-200",
    tagText: "text-green-800",
    shadow: "shadow-green-200",
    shadowHover: "hover:shadow-green-300",
  },
  // Deep Purple
  {
    background: "bg-purple-100/70",
    backgroundHover: "hover:bg-purple-200/80",
    border: "border-purple-300",
    borderHover: "hover:border-purple-400",
    text: "text-gray-900",
    tagBackground: "bg-purple-200",
    tagText: "text-purple-800",
    shadow: "shadow-purple-200",
    shadowHover: "hover:shadow-purple-300",
  },
  // Deep Pink
  {
    background: "bg-pink-100/70",
    backgroundHover: "hover:bg-pink-200/80",
    border: "border-pink-300",
    borderHover: "hover:border-pink-400",
    text: "text-gray-900",
    tagBackground: "bg-pink-200",
    tagText: "text-pink-800",
    shadow: "shadow-pink-200",
    shadowHover: "hover:shadow-pink-300",
  },
  // Deep Teal
  {
    background: "bg-teal-100/70",
    backgroundHover: "hover:bg-teal-200/80",
    border: "border-teal-300",
    borderHover: "hover:border-teal-400",
    text: "text-gray-900",
    tagBackground: "bg-teal-200",
    tagText: "text-teal-800",
    shadow: "shadow-teal-200",
    shadowHover: "hover:shadow-teal-300",
  },
  // Deep Orange
  {
    background: "bg-orange-100/70",
    backgroundHover: "hover:bg-orange-200/80",
    border: "border-orange-300",
    borderHover: "hover:border-orange-400",
    text: "text-gray-900",
    tagBackground: "bg-orange-200",
    tagText: "text-orange-800",
    shadow: "shadow-orange-200",
    shadowHover: "hover:shadow-orange-300",
  },
  // Deep Indigo
  {
    background: "bg-indigo-100/70",
    backgroundHover: "hover:bg-indigo-200/80",
    border: "border-indigo-300",
    borderHover: "hover:border-indigo-400",
    text: "text-gray-900",
    tagBackground: "bg-indigo-200",
    tagText: "text-indigo-800",
    shadow: "shadow-indigo-200",
    shadowHover: "hover:shadow-indigo-300",
  },
  // Deep Rose
  {
    background: "bg-rose-100/70",
    backgroundHover: "hover:bg-rose-200/80",
    border: "border-rose-300",
    borderHover: "hover:border-rose-400",
    text: "text-gray-900",
    tagBackground: "bg-rose-200",
    tagText: "text-rose-800",
    shadow: "shadow-rose-200",
    shadowHover: "hover:shadow-rose-300",
  },
  // Deep Cyan
  {
    background: "bg-cyan-100/70",
    backgroundHover: "hover:bg-cyan-200/80",
    border: "border-cyan-300",
    borderHover: "hover:border-cyan-400",
    text: "text-gray-900",
    tagBackground: "bg-cyan-200",
    tagText: "text-cyan-800",
    shadow: "shadow-cyan-200",
    shadowHover: "hover:shadow-cyan-300",
  },
  // Deep Amber
  {
    background: "bg-amber-100/70",
    backgroundHover: "hover:bg-amber-200/80",
    border: "border-amber-300",
    borderHover: "hover:border-amber-400",
    text: "text-gray-900",
    tagBackground: "bg-amber-200",
    tagText: "text-amber-800",
    shadow: "shadow-amber-200",
    shadowHover: "hover:shadow-amber-300",
  },
  // Deep Lime
  {
    background: "bg-lime-100/70",
    backgroundHover: "hover:bg-lime-200/80",
    border: "border-lime-300",
    borderHover: "hover:border-lime-400",
    text: "text-gray-900",
    tagBackground: "bg-lime-200",
    tagText: "text-lime-800",
    shadow: "shadow-lime-200",
    shadowHover: "hover:shadow-lime-300",
  },
  // Deep Violet
  {
    background: "bg-violet-100/70",
    backgroundHover: "hover:bg-violet-200/80",
    border: "border-violet-300",
    borderHover: "hover:border-violet-400",
    text: "text-gray-900",
    tagBackground: "bg-violet-200",
    tagText: "text-violet-800",
    shadow: "shadow-violet-200",
    shadowHover: "hover:shadow-violet-300",
  },
  // Deep Fuchsia
  {
    background: "bg-fuchsia-100/70",
    backgroundHover: "hover:bg-fuchsia-200/80",
    border: "border-fuchsia-300",
    borderHover: "hover:border-fuchsia-400",
    text: "text-gray-900",
    tagBackground: "bg-fuchsia-200",
    tagText: "text-fuchsia-800",
    shadow: "shadow-fuchsia-200",
    shadowHover: "hover:shadow-fuchsia-300",
  },
  // Deep Emerald
  {
    background: "bg-emerald-100/70",
    backgroundHover: "hover:bg-emerald-200/80",
    border: "border-emerald-300",
    borderHover: "hover:border-emerald-400",
    text: "text-gray-900",
    tagBackground: "bg-emerald-200",
    tagText: "text-emerald-800",
    shadow: "shadow-emerald-200",
    shadowHover: "hover:shadow-emerald-300",
  },
  // Deep Sky
  {
    background: "bg-sky-100/70",
    backgroundHover: "hover:bg-sky-200/80",
    border: "border-sky-300",
    borderHover: "hover:border-sky-400",
    text: "text-gray-900",
    tagBackground: "bg-sky-200",
    tagText: "text-sky-800",
    shadow: "shadow-sky-200",
    shadowHover: "hover:shadow-sky-300",
  },
  // Light Red
  {
    background: "bg-red-50/80",
    backgroundHover: "hover:bg-red-100/90",
    border: "border-red-200",
    borderHover: "hover:border-red-300",
    text: "text-gray-900",
    tagBackground: "bg-red-100",
    tagText: "text-red-700",
    shadow: "shadow-red-100",
    shadowHover: "hover:shadow-red-200",
  },
  // Deep Red
  {
    background: "bg-red-100/70",
    backgroundHover: "hover:bg-red-200/80",
    border: "border-red-300",
    borderHover: "hover:border-red-400",
    text: "text-gray-900",
    tagBackground: "bg-red-200",
    tagText: "text-red-800",
    shadow: "shadow-red-200",
    shadowHover: "hover:shadow-red-300",
  },
  // Warm Gray
  {
    background: "bg-stone-50/80",
    backgroundHover: "hover:bg-stone-100/90",
    border: "border-stone-200",
    borderHover: "hover:border-stone-300",
    text: "text-gray-900",
    tagBackground: "bg-stone-100",
    tagText: "text-stone-700",
    shadow: "shadow-stone-100",
    shadowHover: "hover:shadow-stone-200",
  },
  // Cool Gray
  {
    background: "bg-slate-50/80",
    backgroundHover: "hover:bg-slate-100/90",
    border: "border-slate-200",
    borderHover: "hover:border-slate-300",
    text: "text-gray-900",
    tagBackground: "bg-slate-100",
    tagText: "text-slate-700",
    shadow: "shadow-slate-100",
    shadowHover: "hover:shadow-slate-200",
  },
  // Neutral Gray
  {
    background: "bg-gray-50/80",
    backgroundHover: "hover:bg-gray-100/90",
    border: "border-gray-200",
    borderHover: "hover:border-gray-300",
    text: "text-gray-900",
    tagBackground: "bg-gray-100",
    tagText: "text-gray-700",
    shadow: "shadow-gray-100",
    shadowHover: "hover:shadow-gray-200",
  },
];

/**
 * Simple hash function to generate a consistent number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Global tag-to-color mapping
 * This ensures that the same tag always gets the same color across all notes
 */
const tagColorMap = new Map<string, number>();

/**
 * Get a consistent color index for a tag
 */
function getTagColorIndex(tag: string): number {
  const normalizedTag = tag.toLowerCase().trim();

  if (tagColorMap.has(normalizedTag)) {
    return tagColorMap.get(normalizedTag)!;
  }

  const hash = hashString(normalizedTag);
  const colorIndex = hash % pastelColorSchemes.length;
  tagColorMap.set(normalizedTag, colorIndex);

  return colorIndex;
}

/**
 * Get color scheme for a note based on its tags
 * If a note has multiple tags, use the first tag's color
 * If a note has no tags, assign a random color based on note ID
 */
export function getNoteColorScheme(
  tags: string[] | undefined,
  noteId: string
): NoteColorScheme {
  if (tags && tags.length > 0) {
    // Use the first tag to determine the color
    const colorIndex = getTagColorIndex(tags[0]);
    return pastelColorSchemes[colorIndex];
  }

  // If no tags, use note ID to generate a consistent color
  const hash = hashString(noteId);
  const colorIndex = hash % pastelColorSchemes.length;
  return pastelColorSchemes[colorIndex];
}

/**
 * Get all unique tag colors currently in use
 * Useful for displaying a legend or filter
 */
export function getUsedTagColors(
  allNotes: Array<{ tags?: string[] }>
): Map<string, NoteColorScheme> {
  const tagColors = new Map<string, NoteColorScheme>();

  allNotes.forEach((note) => {
    if (note.tags && note.tags.length > 0) {
      note.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase().trim();
        if (!tagColors.has(normalizedTag)) {
          const colorIndex = getTagColorIndex(tag);
          tagColors.set(normalizedTag, pastelColorSchemes[colorIndex]);
        }
      });
    }
  });

  return tagColors;
}

/**
 * Clear the tag color mapping cache
 * Useful when starting a new session or resetting colors
 */
export function clearTagColorCache(): void {
  tagColorMap.clear();
}

/**
 * Combine multiple Tailwind classes into a single string
 */
export function combineColorClasses(...classes: string[]): string {
  return classes.join(" ");
}
