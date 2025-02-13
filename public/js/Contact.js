const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active')
    })
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active')
    })
}

function validateContactForm(event) {
    var name = document.forms["contact-form"]["name"].value;
    var email = document.forms["contact-form"]["email"].value;
    var message = document.forms["contact-form"]["message"].value;
    var emailError = document.getElementById("email-error");
    var nameError = document.getElementById("name-error");
    var messageError = document.getElementById("message-error");
    var isValid = true;

    // Regular expression for validating email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if name is empty
    if (name == "") {
        nameError.style.display = "block";
        nameError.textContent = "Please enter your name.";
        isValid = false;
    } else {
        nameError.style.display = "none";
    }

    // Check if email is empty or invalid
    if (email == "" || !emailRegex.test(email)) {
        emailError.style.display = "block";
        emailError.textContent = "Please enter a valid email.";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    // Check if message is empty
    if (message == "") {
        messageError.style.display = "block";
        messageError.textContent = "Please enter your message.";
        isValid = false;
    } else {
        messageError.style.display = "none";
    }

    return isValid;
}

// Add event listener to form submission
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    if (validateContactForm()) {
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        fetch('/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert(result.message);
                event.target.reset(); // Clear the form
            } else {
                alert("Error sending message. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        });
    }
});