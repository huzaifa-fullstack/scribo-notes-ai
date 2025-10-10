import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:5000/api";

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/register`, () => {
    return HttpResponse.json(
      {
        success: true,
        token: "mock-token",
        user: {
          _id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          isEmailVerified: false,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json(
      {
        success: true,
        token: "mock-token",
        user: {
          _id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          isEmailVerified: false,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json(
      {
        success: true,
        user: {
          _id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          isEmailVerified: false,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  // Notes endpoints
  http.get(`${API_URL}/notes`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: [
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
        ],
      },
      { status: 200 }
    );
  }),

  http.post(`${API_URL}/notes`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          _id: "2",
          title: "New Note",
          content: "New Content",
          user: "1",
          tags: [],
          isPinned: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/notes/:id`, ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          _id: params.id,
          title: "Updated Note",
          content: "Updated Content",
          user: "1",
          tags: [],
          isPinned: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  http.delete(`${API_URL}/notes/:id`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: "Note deleted successfully",
      },
      { status: 200 }
    );
  }),

  http.put(`${API_URL}/notes/:id/pin`, ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          _id: params.id,
          title: "Test Note",
          content: "Test Content",
          user: "1",
          tags: [],
          isPinned: true,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  http.put(`${API_URL}/notes/:id/archive`, ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          _id: params.id,
          title: "Test Note",
          content: "Test Content",
          user: "1",
          tags: [],
          isPinned: false,
          isArchived: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),
];
