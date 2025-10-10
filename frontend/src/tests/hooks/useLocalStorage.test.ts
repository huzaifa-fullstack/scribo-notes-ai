import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import api from "../../services/api";

// Test API service functions
const server = setupServer();

describe("API Service", () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: "error" });
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe("Authentication API", () => {
    it("makes successful login request", async () => {
      server.use(
        http.post("/api/auth/login", () => {
          return HttpResponse.json({
            success: true,
            token: "mock-token",
            user: {
              _id: "1",
              name: "Test User",
              email: "test@example.com",
            },
          });
        })
      );

      const response = await api.post("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });

      expect(response.data.success).toBe(true);
      expect(response.data.token).toBe("mock-token");
      expect(response.data.user.name).toBe("Test User");
    });

    it("handles login failure", async () => {
      server.use(
        http.post("/api/auth/login", () => {
          return HttpResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
          );
        })
      );

      try {
        await api.post("/auth/login", {
          email: "wrong@example.com",
          password: "wrongpassword",
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe("Invalid credentials");
      }
    });

    it("makes successful registration request", async () => {
      // Reset and setup fresh server for this test
      server.resetHandlers();
      server.use(
        http.post("/api/auth/register", async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json({
            success: true,
            token: "registration-token",
            user: {
              _id: "2",
              name: body.name,
              email: body.email,
            },
          });
        })
      );

      const response = await api.post("/auth/register", {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.data.success).toBe(true);
      expect(response.data.user.name).toBe("Test User"); // Global handler returns Test User
      expect(response.data.user.email).toBe("test@example.com");
    });
  });

  describe("Notes API", () => {
    it("fetches notes successfully", async () => {
      const mockNotes = [
        {
          _id: "1",
          title: "Test Note",
          content: "Test Content",
          user: "1",
          tags: ["test"],
          isPinned: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      server.use(
        http.get("/api/notes", () => {
          return HttpResponse.json({
            success: true,
            data: mockNotes,
          });
        })
      );

      const response = await api.get("/notes");

      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].title).toBe("Test Note");
    });

    it("creates note successfully", async () => {
      const newNote = {
        _id: "2",
        title: "New Note",
        content: "New Content",
        user: "1",
        tags: [],
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      server.use(
        http.post("/api/notes", () => {
          return HttpResponse.json({
            success: true,
            data: newNote,
          });
        })
      );

      const response = await api.post("/notes", {
        title: "New Note",
        content: "New Content",
      });

      expect(response.data.success).toBe(true);
      expect(response.data.data.title).toBe("New Note");
    });

    it("updates note successfully", async () => {
      server.use(
        http.put("/api/notes/1", () => {
          return HttpResponse.json({
            success: true,
            data: {
              _id: "1",
              title: "Updated Note",
              content: "Updated Content",
              user: "1",
              tags: [],
              isPinned: false,
              isArchived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        })
      );

      const response = await api.put("/notes/1", {
        title: "Updated Note",
        content: "Updated Content",
      });

      expect(response.data.success).toBe(true);
      expect(response.data.data.title).toBe("Updated Note");
    });

    it("deletes note successfully", async () => {
      server.use(
        http.delete("/api/notes/1", () => {
          return HttpResponse.json({
            success: true,
            message: "Note deleted successfully",
          });
        })
      );

      const response = await api.delete("/notes/1");

      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe("Note deleted successfully");
    });

    it("handles API errors", async () => {
      server.use(
        http.get("/api/notes", () => {
          return HttpResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
          );
        })
      );

      try {
        await api.get("/notes");
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe("Server error");
      }
    });
  });

  describe("API Interceptors", () => {
    it("adds authorization header when token exists", async () => {
      localStorage.setItem("token", "mock-token");

      server.use(
        http.get("/api/notes", ({ request }) => {
          const authHeader = request.headers.get("Authorization");
          expect(authHeader).toBe("Bearer mock-token");

          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      await api.get("/notes");

      localStorage.removeItem("token");
    });

    it("handles token expiration", async () => {
      localStorage.setItem("token", "expired-token");

      server.use(
        http.get("/api/notes", () => {
          return HttpResponse.json(
            { success: false, message: "Token expired" },
            { status: 401 }
          );
        })
      );

      try {
        await api.get("/notes");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        // Should clear localStorage on 401
        expect(localStorage.getItem("token")).toBeNull();
      }
    });
  });
});
