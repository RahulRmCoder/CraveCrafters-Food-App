function validated(event) {
    event.preventDefault(); // Prevent default form submission

    var email = document.forms["form"]["email"].value;
    var password = document.forms["form"]["password"].value;
    var emailError = document.getElementById("email-error");
    var passError = document.getElementById("pass-error");
    var isValid = true;

    // Regular expression for validating email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Regular expression for validating password with at least 6 characters and special characters
    var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

    // Check if email is empty or invalid
    if (email == "" || !emailRegex.test(email)) {
        emailError.style.display = "block";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    // Check if password is empty or invalid
    // if (password == "" || !passwordRegex.test(password)) {
    //     if (password == "") {
    //         passError.textContent = "Please enter a password.";
    //     } else {
    //         passError.textContent = "Password is not strong.";
    //     }
    //     passError.style.display = "block";
    //     isValid = false;
    // } else {
    //     passError.style.display = "none";
    // }

    // If client-side validation passes, proceed with server-side validation
    if (isValid) {
        loginUser(email, password);
    }

    return false; // Prevent form from submitting normally
}

function loginUser(email, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            window.location.href = "Home.html";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
const modal = document.getElementById("forgot-password-modal");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const closeBtn = document.getElementsByClassName("close")[0];

forgotPasswordLink.onclick = function() {
    modal.style.display = "block";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Forgot Password Form Submission
document.getElementById("forgot-password-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("reset-email").value;
    
    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Reset code sent to your email.');
            document.getElementById("code-verification").style.display = "block";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

// Verify Reset Code
document.getElementById("verify-code").addEventListener("click", function() {
    const email = document.getElementById("reset-email").value;
    const code = document.getElementById("reset-code").value;
    
    fetch('/verify-reset-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("new-password").style.display = "block";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

// Update Password
document.getElementById("update-password").addEventListener("click", function() {
    const email = document.getElementById("reset-email").value;
    const newPassword = document.getElementById("new-password-input").value;
    const confirmPassword = document.getElementById("confirm-password-input").value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    fetch('/update-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password updated successfully.');
            modal.style.display = "none";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});