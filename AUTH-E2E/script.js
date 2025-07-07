document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Éléments du formulaire
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Messages d'erreur
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    // Validation en temps réel
    usernameInput.addEventListener('blur', validateUsername);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    // Soumission du formulaire
    form.addEventListener('submit', handleSubmit);

    function validateUsername() {
        const username = usernameInput.value.trim();
        
        if (username.length === 0) {
            showError(usernameInput, usernameError, 'Le nom d\'utilisateur est requis');
            return false;
        }
        
        if (username.length < 3) {
            showError(usernameInput, usernameError, 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError(usernameInput, usernameError, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
            return false;
        }
        
        clearError(usernameInput, usernameError);
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email.length === 0) {
            showError(emailInput, emailError, 'L\'adresse e-mail est requise');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            showError(emailInput, emailError, 'Veuillez entrer une adresse e-mail valide');
            return false;
        }
        
        clearError(emailInput, emailError);
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        
        if (password.length === 0) {
            showError(passwordInput, passwordError, 'Le mot de passe est requis');
            return false;
        }
        
        if (password.length < 6) {
            showError(passwordInput, passwordError, 'Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showError(passwordInput, passwordError, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
            return false;
        }
        
        clearError(passwordInput, passwordError);
        
        // Re-valider la confirmation si elle existe déjà
        if (confirmPasswordInput.value) {
            validateConfirmPassword();
        }
        
        return true;
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword.length === 0) {
            showError(confirmPasswordInput, confirmPasswordError, 'Veuillez confirmer votre mot de passe');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'Les mots de passe ne correspondent pas');
            return false;
        }
        
        clearError(confirmPasswordInput, confirmPasswordError);
        return true;
    }

    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    function clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        // Valider tous les champs
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        
        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }
        
        // Simuler l'inscription
        submitBtn.disabled = true;
        submitBtn.textContent = 'Inscription en cours...';
        submitBtn.classList.add('loading');
        
        // Simuler un délai d'API
        setTimeout(() => {
            const userData = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                registeredAt: new Date().toLocaleString('fr-FR')
            };
            
            showSuccessMessage(userData);
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'S\'inscrire';
            submitBtn.classList.remove('loading');
        }, 2000);
    }

    function showSuccessMessage(userData) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <p><strong>Nom d'utilisateur:</strong> ${userData.username}</p>
            <p><strong>E-mail:</strong> ${userData.email}</p>
            <p><strong>Date d'inscription:</strong> ${userData.registeredAt}</p>
        `;
    }
});
