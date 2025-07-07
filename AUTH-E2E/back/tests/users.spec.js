import { test, expect } from '@playwright/test';

test.describe('API Users Tests', () => {

  test("should get all users", async ({ request }) => {
    const response = await request.get("/users");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.users).toBeDefined();
    expect(data.total).toBeGreaterThan(0);
    expect(data.limit).toBeGreaterThan(0);
  });

  test("should get user by ID", async ({ request }) => {
    const userId = "1";
    const response = await request.get(`/users/${userId}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(userId);
    expect(data.username).toBeDefined();
    expect(data.email).toBeDefined();
  });

  test("should create a new user with unique data", async ({ request }) => {
    const timestamp = Date.now();
    const newUser = {
      username: `newuser${timestamp}`,
      email: `newuser${timestamp}@mail.com`,
      password: "NewUser123"
    };
    
    const response = await request.post("/users", {
      data: newUser
    });
    
    console.log(`Response status: ${response.status()}`);
    if (!response.ok()) {
      const errorData = await response.json();
      console.log('Error response:', errorData);
    }
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.username).toBe(newUser.username);
    expect(data.email).toBe(newUser.email);
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
    expect(data.password).toBeUndefined();
  });

  test("should handle user creation validation errors", async ({ request }) => {
    const response = await request.post("/users", {
      data: {
        username: "", 
        email: "invalid-email", 
        password: "short"
      }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    console.log('Validation error data:', data);
    expect(data.error).toBeDefined();
    expect(data.details).toBeDefined();
  });

  test("should prevent duplicate username", async ({ request }) => {
    const duplicateUser = {
      username: "admin", // Nom d'utilisateur déjà existant
      email: "newemail@example.com",
      password: "Password123"
    };
    
    const response = await request.post("/users", {
      data: duplicateUser
    });
    
    expect(response.status()).toBe(409);
    const data = await response.json();
    expect(data.error).toContain('utilisateur avec ce nom d\'utilisateur ou cet email existe déjà');
  });

  test("should prevent duplicate email", async ({ request }) => {
    const duplicateUser = {
      username: "newusername",
      email: "admin@example.com", // Email déjà existant
      password: "Password123"
    };
    
    const response = await request.post("/users", {
      data: duplicateUser
    });
    
    expect(response.status()).toBe(409);
    const data = await response.json();
    expect(data.error).toContain('utilisateur avec ce nom d\'utilisateur ou cet email existe déjà');
  });

  test("should validate password complexity", async ({ request }) => {
    const weakPasswordUser = {
      username: "testuser123",
      email: "test@example.com",
      password: "password" // Pas de majuscule ni de chiffre
    };
    
    const response = await request.post("/users", {
      data: weakPasswordUser
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('minuscule, une majuscule et un chiffre');
  });

  test("should validate username format", async ({ request }) => {
    const invalidUsernameUser = {
      username: "user@name", // Caractères invalides
      email: "test@example.com",
      password: "Password123"
    };
    
    const response = await request.post("/users", {
      data: invalidUsernameUser
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('lettres, chiffres et underscores');
  });

  test("should get user by non-existent ID", async ({ request }) => {
    const response = await request.get("/users/999");
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe('Utilisateur non trouvé');
  });
});