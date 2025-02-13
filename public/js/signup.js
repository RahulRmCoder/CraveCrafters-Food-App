function validated(event) {
    event.preventDefault(); // Prevent default form submission

    var name = document.forms["form"]["name"].value;
    var email = document.forms["form"]["email"].value;
    var dob = document.forms["form"]["dob"].value; // Optional
    var address = document.forms["form"]["address"].value;
    var password = document.forms["form"]["password"].value;
    var selectedPreferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(checkbox => checkbox.value);

    var nameError = document.getElementById("name-error");
    var emailError = document.getElementById("email-error");
    var addressError = document.getElementById("address-error");
    var passError = document.getElementById("pass-error");
    var foodPreferencesError = document.getElementById("food-preferences-error");
    var messageDiv = document.getElementById("message");
    var submitButton = document.querySelector('form button[type="submit"]');

    var isValid = true;

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

    // Clear all previous error messages
    [nameError, emailError, addressError, passError, foodPreferencesError].forEach(error => error.style.display = 'none');

    // Validation checks
    if (!name) {
        nameError.style.display = 'block';
        isValid = false;
    }
    if (!email || !emailRegex.test(email)) {
        emailError.style.display = 'block';
        isValid = false;
    }
    if (address.trim() === '') {
        addressError.style.display = 'block';
        isValid = false;
    }
    if (!passwordRegex.test(password)) {
        passError.style.display = 'block';
        isValid = false;
    }
    if (selectedPreferences.length === 0) {
        foodPreferencesError.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        messageDiv.textContent = 'Submitting...';
        messageDiv.style.color = 'blue';
        messageDiv.style.display = 'block';
        submitButton.disabled = true;

        // Prepare food preferences array
        var foodPreferences = selectedPreferences;

        // Introduce a slight delay before making the fetch request
        setTimeout(() => {
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, dob, address, foodPreferences }),
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    messageDiv.textContent = data.message;
                    messageDiv.style.color = 'green';
                    setTimeout(() => {
                        window.location.href = '/Login1.html';
                    }, 2000);
                } else {
                    throw new Error(data.message || 'An error occurred');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                messageDiv.textContent = error.message || 'An error occurred. Please try again.';
                messageDiv.style.color = 'red';
                submitButton.disabled = false;
            });
        }, 100);
    }
}

// Add event listener to the form
document.querySelector('form').addEventListener('submit', validated);