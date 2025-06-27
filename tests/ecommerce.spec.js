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
    await expect(page.getByRole("button", { name: " Add to cart" })).toBeVisible();
  });

  test("should add product to cart and verify cart page with correct pricing", async ({ page }) => {
    // On va sur la page d'un produit spécifique
    await page.goto("https://automationexercise.com/product_details/30");

    // On récupère le prix du produit sur la page de détail pour vérification
    const productPriceOnDetailPage = await page.locator('.product-information h2').textContent();
    console.log('Prix sur la page produit:', productPriceOnDetailPage);

    // On ajoute le produit au panier
    await page.getByRole("button", { name: " Add to cart" }).click();

    // On clique sur "View Cart" dans la modal qui apparaît
    await page.getByRole("link", { name: "View Cart" }).click();

    // On vérifie qu'on est bien sur la page du panier
    expect(page).toHaveURL("https://automationexercise.com/view_cart");
    expect(await page.title()).toBe("Automation Exercise - Checkout");

    // On vérifie que le produit est présent dans le panier
    const cartItem = page.locator('#cart_info_table tbody tr');
    await expect(cartItem).toHaveCount(1);

    // On vérifie que le nom du produit est correct dans le panier
    await expect(page.locator('.cart_description h4 a')).toContainText('Premium Polo T-Shirts');

    // On récupère le prix unitaire dans le panier
    const cartUnitPrice = await page.locator('.cart_price p').textContent();
    console.log('Prix unitaire dans le panier:', cartUnitPrice);


    // On vérifie la quantité (par défaut 1)
    await expect(page.locator('.cart_quantity button')).toHaveText('1');

    // On récupère le prix total dans le panier
    const cartTotalPrice = await page.locator('.cart_total_price').textContent();
    console.log('Prix total dans le panier:', cartTotalPrice);

    // Pour 1 produit, le prix total doit être égal au prix unitaire
    expect(cartTotalPrice?.trim()).toBe(cartUnitPrice?.trim());

    // On vérifie que les prix contiennent bien "Rs." (roupies)
    expect(cartUnitPrice).toContain('Rs.');
    expect(cartTotalPrice).toContain('Rs.');

    // On extrait les montants numériques pour vérification
    const unitAmount = cartUnitPrice?.replace('Rs. ', '').trim();
    const totalAmount = cartTotalPrice?.replace('Rs. ', '').trim();
    
    // On vérifie que le prix unitaire est exactement de 1500 Rs.
    expect(parseFloat(unitAmount || '0')).toBe(1500);
    
    // On vérifie que les montants sont des nombres valides et positifs
    expect(parseFloat(unitAmount || '0')).toBeGreaterThan(0);
    expect(parseFloat(totalAmount || '0')).toBeGreaterThan(0);
    expect(parseFloat(unitAmount || '0')).toBe(parseFloat(totalAmount || '0'));
    
    // Vérification supplémentaire : le prix total doit aussi être de 1500 Rs. (pour quantité = 1)
    expect(parseFloat(totalAmount || '0')).toBe(1500);

    // On vérifie que les boutons de gestion du panier sont présents
    await expect(page.locator('.cart_quantity_delete')).toBeVisible();
  });
});
