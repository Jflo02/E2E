import test, { expect } from "@playwright/test";

async function acceptCookies(page) {
  // On localise le bouton "Accepter les cookies" et on clique dessus
  const acceptCookiesButton = page.getByRole("button", { name: "Consent" });

  // On vérifie si le bouton est visible avant de cliquer
  if (await acceptCookiesButton.isVisible()) {
    await acceptCookiesButton.click();
  }
}

test.describe("Ecommerce's product page", () => {
  // Avant chaque test, on va sur la page d'accueil du site ecommerce
  // et on accepte les cookies
  test.beforeEach(async ({ page }) => {
    // On va sur la page d'accueil du site ecommerce
    await page.goto("https://automationexercise.com/");
    await acceptCookies(page);
  });

  test("should go to product page", async ({ page }) => {
    // Ceci est un Locator, il permet de localiser un élément de la page
    // https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-label
    // Ici nous localisons le lien vers la page products.
    await page.getByRole("link", { name: " Products" }).click();

    // On vérifie que l'URL de la page est bien celle de la page des produits
    expect(page).toHaveURL("https://automationexercise.com/products");
    // On vérifie que le titre de la page est bien celui de la page des produits
    expect(await page.title()).toBe("Automation Exercise - All Products");
  });

  test("should find a t-shirt", async ({ page }) => {
    await page.getByRole("link", { name: " Products" }).click();

    // On écrit dans la barre de recherche le mot "t-shirt"
    await page.getByRole("textbox", { name: "Search Product" }).fill("t-shirt");

    // On clique sur le bouton de recherche
    await page.getByRole("button", { name: "" }).click();

    // On vérifie qu'il n'y a que 3 produits affichés
    const products = page.locator(".features_items .product-image-wrapper");

    // On vérifie que le nombre de produits affichés est bien de 3
    await expect(products).toHaveCount(3);
  });

  test("should contains product's details like title and price", async ({
    page,
  }) => {
    await page.goto("https://automationexercise.com/product_details/30");

    // On vérifie que le titre de la page est bien celle du produit
    expect(await page.title()).toBe("Automation Exercise - Product Details");
    // On vérifie que le titre du produit est bien celui attendu
    await expect(
      page.getByRole("heading", { name: "Premium Polo T-Shirts" })
    ).toBeVisible();
    // On vérifie que le prix du produit est bien présent
    await expect(page.getByText("Rs.")).toBeVisible();
    // On vérifie que le bouton "Add to cart" est bien visible
    await expect(page.getByRole("button", { name: " Add to cart" })).toBeVisible();
  });
});
