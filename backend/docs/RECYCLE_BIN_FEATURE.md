# Recycle Bin Feature Implementation

## Overview

The Recycle Bin feature provides a safety net for deleted notes by implementing soft deletion. Notes moved to the recycle bin can be restored within 30 days, after which they are automatically permanently deleted.

## Features

### 1. Soft Delete (Move to Recycle Bin)

- When a user deletes a note, it's marked as deleted instead of being removed from the database
- The note is tagged with `isDeleted: true` and `deletedAt: <timestamp>`
- Deleted notes are excluded from regular note listings

### 2. Restore Notes

- Users can restore notes from the recycle bin
- Restored notes return to their original state (excluding deletion markers)

### 3. Permanent Delete

- Users can permanently delete specific notes from the recycle bin
- Once permanently deleted, notes cannot be recovered

### 4. Empty Recycle Bin

- Users can empty the entire recycle bin at once
- This permanently deletes all notes in the recycle bin

### 5. Auto-Cleanup

- A background job runs daily to permanently delete notes older than 30 days
- Prevents the database from filling up with old deleted notes

## API Endpoints

### Get Recycle Bin Notes

```
GET /api/notes/recycle-bin
Authorization: Bearer <token>
Query Parameters:
  - page (optional): Page number (default: 1)
  - limit (optional): Items per page (default: 10)

Response:
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "content": "...",
      "isDeleted": true,
      "deletedAt": "2025-10-01T12:00:00.000Z",
      ...
    }
  ]
}
```

### Delete Note (Soft Delete)

```
DELETE /api/notes/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Note moved to recycle bin successfully",
  "data": {
    "_id": "...",
    "title": "...",
    "isDeleted": true,
    "deletedAt": "2025-10-31T12:00:00.000Z",
    ...
  }
}
```

### Restore Note

```
PUT /api/notes/:id/restore
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Note restored successfully",
  "data": {
    "_id": "...",
    "title": "...",
    "isDeleted": false,
    "deletedAt": null,
    ...
  }
}
```

### Permanently Delete Note

```
DELETE /api/notes/:id/permanent
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Note permanently deleted successfully",
  "data": {}
}
```

### Empty Recycle Bin

```
DELETE /api/notes/recycle-bin/empty
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "3 notes permanently deleted",
  "data": {
    "deletedCount": 3
  }
}
```

## Database Schema Changes

### Note Model

Added two new fields to the Note schema:

```javascript
{
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}
```

### Updated Static Methods

The `findByUser` static method now includes an `includeDeleted` option to filter out deleted notes by default:

```javascript
Note.findByUser(userId, {
  includeDeleted: false, // default - excludes deleted notes
});
```

## Frontend Integration

### Store Updates

The `notesStore` has been updated with the following methods:

1. **deleteNote(id)**: Soft deletes a note (moves to recycle bin)
2. **restoreNote(id)**: Restores a note from recycle bin
3. **permanentlyDeleteNote(id)**: Permanently deletes a specific note
4. **emptyRecycleBin()**: Empties the entire recycle bin

### RecycleBinPage Component

The RecycleBinPage displays:

- List of deleted notes with remaining days before auto-deletion
- Restore button for each note
- Permanent delete button for each note
- Empty recycle bin button (with confirmation dialog)
- Auto-deletion warning after 30 days

## Auto-Cleanup Implementation

### Cleanup Utility

Located at: `backend/src/utils/recycleBinCleanup.js`

Features:

- Runs daily at midnight
- Deletes notes older than 30 days
- Logs cleanup operations
- Configurable retention period

### Scheduler

The cleanup scheduler is initialized in `server.js`:

```javascript
const { scheduleRecycleBinCleanup } = require("./src/utils/recycleBinCleanup");
scheduleRecycleBinCleanup();
```

## Security & Authorization

1. **User Ownership**: Only note owners can:

   - Delete their notes
   - Restore their notes
   - Permanently delete their notes
   - Empty their recycle bin

2. **Authentication**: All endpoints require valid JWT authentication

3. **Data Isolation**: Users can only see and manage their own deleted notes

## Error Handling

The implementation includes comprehensive error handling:

- 404: Note not found
- 403: Unauthorized access
- 400: Invalid operations (e.g., restoring a note that's not deleted)
- 500: Server errors

## Testing

Comprehensive test suite located at: `backend/tests/recycleBin.test.js`

Test coverage includes:

- Soft deletion
- Note restoration
- Permanent deletion
- Empty recycle bin
- Auto-cleanup functionality
- Authorization checks
- Pagination
- Multi-user scenarios

Run tests:

```bash
cd backend
npm test -- recycleBin.test.js
```

## Configuration

### Retention Period

The retention period can be configured in `backend/src/utils/recycleBinCleanup.js`:

```javascript
const RECYCLE_BIN_RETENTION_DAYS = 30; // Change this value as needed
```

### Cleanup Schedule

The cleanup runs every 24 hours. To modify the schedule, update the interval in `scheduleRecycleBinCleanup()`:

```javascript
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

## Migration Notes

For existing databases, the new fields `isDeleted` and `deletedAt` will default to `false` and `null` respectively for existing notes, ensuring backward compatibility.

## Future Enhancements

Potential improvements:

1. Configurable retention period per user
2. Batch restore functionality
3. Search/filter within recycle bin
4. Email notifications before auto-deletion
5. Recycle bin statistics in user dashboard
6. Export deleted notes before permanent deletion

## Related Files

### Backend

- `backend/src/models/Note.js` - Updated schema
- `backend/src/controllers/notesController.js` - New endpoints
- `backend/src/routes/notes.js` - Route definitions
- `backend/src/utils/recycleBinCleanup.js` - Auto-cleanup utility
- `backend/server.js` - Scheduler initialization
- `backend/tests/recycleBin.test.js` - Test suite

### Frontend

- `frontend/src/pages/RecycleBinPage.tsx` - UI component
- `frontend/src/store/notesStore.ts` - State management
- `frontend/src/types/note.ts` - TypeScript types

## Support

For issues or questions about the recycle bin feature, please refer to the main project documentation or create an issue in the repository.
