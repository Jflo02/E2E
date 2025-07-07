import { test, expect } from '@playwright/test';

test.describe('Interface d\'inscription utilisateur', () => {
  
  test.beforeEach(async ({ page }) => {
    // Aller sur la page d'inscription
    await page.goto('/');
  });

  test('should display registration form correctly', async ({ page }) => {
    // Vérifier que la page se charge correctement
    await expect(page).toHaveTitle('Inscription - AUTH E2E');
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();

    // Vérifier la présence de tous les champs
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();

    // Vérifier les labels des champs
    await expect(page.getByText('Nom d\'utilisateur')).toBeVisible();
    await expect(page.getByText('Adresse e-mail')).toBeVisible();
    await expect(page.getByText('Mot de passe', { exact: true })).toBeVisible();
    await expect(page.getByText('Confirmer le mot de passe')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Cliquer sur chaque champ puis en sortir pour déclencher la validation
    await page.getByTestId('username-input').click();
    await page.getByTestId('email-input').click();
    await page.getByTestId('password-input').click();
    await page.getByTestId('confirm-password-input').click();
    await page.getByTestId('submit-button').click();

    // Vérifier que les messages d'erreur apparaissent
    await expect(page.locator('#username-error')).toContainText('Le nom d\'utilisateur est requis');
    await expect(page.locator('#email-error')).toContainText('L\'adresse e-mail est requise');
    await expect(page.locator('#password-error')).toContainText('Le mot de passe est requis');
    await expect(page.locator('#confirm-password-error')).toContainText('Veuillez confirmer votre mot de passe');

    // Vérifier que les champs ont la classe error
    await expect(page.getByTestId('username-input')).toHaveClass(/error/);
    await expect(page.getByTestId('email-input')).toHaveClass(/error/);
    await expect(page.getByTestId('password-input')).toHaveClass(/error/);
    await expect(page.getByTestId('confirm-password-input')).toHaveClass(/error/);
  });

  test('should validate username requirements', async ({ page }) => {
    const usernameInput = page.getByTestId('username-input');
    
    // Test nom d'utilisateur trop court
    await usernameInput.fill('ab');
    await usernameInput.blur();
    await expect(page.locator('#username-error')).toContainText('au moins 3 caractères');

    // Test caractères invalides
    await usernameInput.fill('user@name');
    await usernameInput.blur();
    await expect(page.locator('#username-error')).toContainText('lettres, chiffres et underscores');

    // Test nom d'utilisateur valide
    await usernameInput.fill('user123');
    await usernameInput.blur();
    await expect(page.locator('#username-error')).toBeEmpty();
    await expect(usernameInput).not.toHaveClass(/error/);
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByTestId('email-input');
    
    // Test email invalide
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('#email-error')).toContainText('adresse e-mail valide');

    // Test email valide
    await emailInput.fill('user@example.com');
    await emailInput.blur();
    await expect(page.locator('#email-error')).toBeEmpty();
    await expect(emailInput).not.toHaveClass(/error/);
  });

  test('should validate password requirements', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    
    // Test mot de passe trop court
    await passwordInput.fill('123');
    await passwordInput.blur();
    await expect(page.locator('#password-error')).toContainText('au moins 6 caractères');

    // Test mot de passe sans complexité
    await passwordInput.fill('password');
    await passwordInput.blur();
    await expect(page.locator('#password-error')).toContainText('minuscule, une majuscule et un chiffre');

    // Test mot de passe valide
    await passwordInput.fill('Password123');
    await passwordInput.blur();
    await expect(page.locator('#password-error')).toBeEmpty();
    await expect(passwordInput).not.toHaveClass(/error/);
  });

  test('should validate password confirmation', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    const confirmPasswordInput = page.getByTestId('confirm-password-input');
    
    // Remplir le mot de passe
    await passwordInput.fill('Password123');
    
    // Test confirmation différente
    await confirmPasswordInput.fill('DifferentPassword123');
    await confirmPasswordInput.blur();
    await expect(page.locator('#confirm-password-error')).toContainText('ne correspondent pas');

    // Test confirmation identique
    await confirmPasswordInput.fill('Password123');
    await confirmPasswordInput.blur();
    await expect(page.locator('#confirm-password-error')).toBeEmpty();
    await expect(confirmPasswordInput).not.toHaveClass(/error/);
  });

  test('should successfully register a user with valid data', async ({ page }) => {
    // Remplir tous les champs avec des données valides
    await page.getByTestId('username-input').fill('testuser123');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('Password123');
    await page.getByTestId('confirm-password-input').fill('Password123');

    // Soumettre le formulaire
    await page.getByTestId('submit-button').click();

    // Vérifier que le bouton devient disabled et montre le loading
    await expect(page.getByTestId('submit-button')).toBeDisabled();
    await expect(page.getByTestId('submit-button')).toContainText('Inscription en cours...');

    // Attendre le message de succès
    await expect(page.locator('#successMessage')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Inscription réussie !')).toBeVisible();
    await expect(page.getByText('Votre compte a été créé avec succès.')).toBeVisible();

    // Vérifier que les informations utilisateur sont affichées
    await expect(page.locator('#userInfo')).toContainText('testuser123');
    await expect(page.locator('#userInfo')).toContainText('test@example.com');
    await expect(page.locator('#userInfo')).toContainText('Date d\'inscription');

    // Vérifier que le formulaire est masqué
    await expect(page.locator('#registrationForm')).toBeHidden();
  });

  test('should handle real-time validation on blur', async ({ page }) => {
    // Test que la validation se déclenche quand on quitte un champ
    const usernameInput = page.getByTestId('username-input');
    
    await usernameInput.fill('ab'); // Trop court
    await usernameInput.blur();
    
    // L'erreur doit apparaître immédiatement
    await expect(page.locator('#username-error')).toContainText('au moins 3 caractères');
    
    // Corriger l'erreur
    await usernameInput.fill('validusername');
    await usernameInput.blur();
    
    // L'erreur doit disparaître
    await expect(page.locator('#username-error')).toBeEmpty();
  });

  test('should prevent submission with invalid data', async ({ page }) => {
    // Remplir avec des données partiellement invalides
    await page.getByTestId('username-input').fill('ab'); // Trop court
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('Password123');
    await page.getByTestId('confirm-password-input').fill('Password123');

    // Tenter de soumettre
    await page.getByTestId('submit-button').click();

    // Vérifier que la soumission n'a pas lieu (pas de message de succès)
    await expect(page.locator('#successMessage')).toBeHidden();
    
    // Vérifier que l'erreur est affichée
    await expect(page.locator('#username-error')).toContainText('au moins 3 caractères');
  });
});
