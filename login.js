document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const messageContainer = document.getElementById('message-container');

    // Jika user sudah login, arahkan ke halaman resep
    if (localStorage.getItem('firstName')) {
        window.location.href = 'recipes.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value; // Password tidak di-trim

        if (!username || !password) {
            showMessage('Username and password cannot be empty.', 'error');
            return;
        }

        setLoading(true, 'Authenticating, please wait...');

        try {
            // Step 1: Ambil data user berdasarkan username
            const response = await fetch(`https://dummyjson.com/users/filter?key=username&value=${username}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok. Could not reach server.');
            }

            const data = await response.json();

            // Step 2: Cek apakah user-nya ada
            if (data.users && data.users.length > 0) {
                const user = data.users[0];
                
                // Step 3: Bandingkan password yang diinput dengan password dari API
                // <--- INI BAGIAN PENTINGNYA
                if (user.password === password) {
                    // Password cocok, login berhasil!
                    showMessage('Login successful! Redirecting...', 'success');
                    localStorage.setItem('firstName', user.firstName);

                    setTimeout(() => {
                        window.location.href = 'recipes.html';
                    }, 1500);
                } else {
                    // Password salah
                    throw new Error('Incorrect password. Please try again.');
                }
            } else {
                // Username tidak ditemukan
                throw new Error('Username not found.');
            }

        } catch (error) {
            showMessage(error.message || 'An error occurred. Please try again.', 'error');
            setLoading(false); // Matikan loading state jika ada error
        }
    });

    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.style.color = type === 'success' ? 'var(--success-color)' : 'var(--error-color)';
    }

    function setLoading(isLoading, message = '') {
        loginButton.disabled = isLoading;
        if (isLoading) {
            showMessage(message, 'info');
        }
    }
});