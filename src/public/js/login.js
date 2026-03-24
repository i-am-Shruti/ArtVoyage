const emailForm = document.getElementById('emailForm');
const otpBox = document.getElementById('otpBox');
const passwordBox = document.getElementById('passwordBox');
const loginBox = document.getElementById('loginBox');
const menuCard = document.getElementById('menuCard');
const contactSupportLink = document.getElementById('contactSupportLink');
const loginLink = document.getElementById('loginLink');

let isForgotPassword = false;

const emailButton = document.getElementById('emailButton');
const emailLoader = document.createElement('div');

emailLoader.classList.add('loader');
emailButton.appendChild(emailLoader);
emailLoader.style.display = 'none';

emailForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const email = document.getElementById('email').value;

  emailLoader.style.display = 'inline-block';
  emailButton.disabled = true;

  const endpoint = isForgotPassword ? '/auth/forgot-password' : '/auth/send-otp';

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('OTP sent to your email!');
        emailForm.style.display = 'none';
        otpBox.style.display = 'block';
      } else {
        alert(data.message);
        if (data.showLogin) {
          emailForm.style.display = 'none';
          loginBox.style.display = 'block';
          document.getElementById('loginEmail').value = email;
        }
      }
    })
    .catch(err => console.error('Error:', err))
    .finally(() => {
      emailLoader.style.display = 'none';
      emailButton.disabled = false;
    });
});

const VerifyButton = document.getElementById('VerifyButton');
const VerifyLoader = document.createElement('div');

VerifyLoader.classList.add('loader');
VerifyButton.appendChild(VerifyLoader);
VerifyLoader.style.display = 'none';

const otpForm = document.getElementById('otpForm');
otpForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const otp = document.getElementById('otp').value;
  const email = document.getElementById('email').value;

  VerifyLoader.style.display = 'inline-block';
  VerifyButton.disabled = true;

  fetch('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, otp: otp })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('OTP verified successfully!');
        otpBox.style.display = 'none';
        passwordBox.style.display = 'block';
      } else {
        alert(data.message || 'Error verifying OTP');
      }
    })
    .catch(err => console.error('Error:', err))
    .finally(() => {
      VerifyLoader.style.display = 'none';
      VerifyButton.disabled = false;
    });
});

const passwordButton = document.getElementById('passwordButton');
const passwordLoader = document.createElement('div');

passwordLoader.classList.add('loader');
passwordButton.appendChild(passwordLoader);
passwordLoader.style.display = 'none';

const passwordForm = document.getElementById('passwordForm');
passwordForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  passwordLoader.style.display = 'inline-block';
  passwordButton.disabled = true;

  fetch('/auth/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(isForgotPassword ? 'Password reset successfully! Please login.' : 'Password Set Successfully!');
        isForgotPassword = false;
        passwordBox.style.display = 'none';
        loginBox.style.display = 'block';
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
        document.querySelector('#emailForm h3').textContent = 'Enter your email to receive OTP';
      } else {
        alert(data.message || 'Error setting password');
      }
    })
    .catch(err => console.error('Error:', err))
    .finally(() => {
      passwordLoader.style.display = 'none';
      passwordButton.disabled = false;
    });
});

const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loginLoader = document.createElement('div');

loginLoader.classList.add('loader');
loginButton.appendChild(loginLoader);
loginLoader.style.display = 'none';

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const loginEmail = document.getElementById('loginEmail').value;
  const loginPassword = document.getElementById('loginPassword').value;

  loginLoader.style.display = 'inline-block';
  loginButton.disabled = true;

  fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: loginEmail, password: loginPassword })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Login Successful!');
        window.location.href = '/selection';
      } else {
        alert(data.message || 'Invalid credentials. Please try again.');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    })
    .finally(() => {
      loginLoader.style.display = 'none';
      loginButton.disabled = false;
    });
});

const forgotPasswordLoginBoxLink = document.getElementById('forgotPasswordLoginBoxLink');

forgotPasswordLoginBoxLink.addEventListener('click', function (event) {
  event.preventDefault();
  const loginEmail = document.getElementById('loginEmail').value;

  if (loginEmail.trim() === '') {
    alert('Please enter your email address in the login form first.');
    return;
  }

  isForgotPassword = true;
  document.getElementById('email').value = loginEmail;
  document.querySelector('#emailForm h3').textContent = 'Enter email to reset password';

  loginBox.style.display = 'none';
  emailForm.style.display = 'block';
});

contactSupportLink.addEventListener('click', function (event) {
  alert("Call us at: 98120436574\nWrite your query at: shrutipriya531@gmail.com");
});

loginLink.addEventListener('click', function (event) {
  event.preventDefault();
  console.log("Login link clicked");

  isForgotPassword = false;
  document.querySelector('#emailForm h3').textContent = 'Enter your email to receive OTP';

  otpBox.style.display = 'none';
  passwordBox.style.display = 'none';
  emailForm.style.display = 'none';
  menuCard.style.display = 'none';
  loginBox.style.display = 'block';
});

function toggleMenu() {
  if (menuCard.style.display === 'block') {
    menuCard.style.display = 'none';
  } else {
    menuCard.style.display = 'block';
    menuCard.style.animation = 'none';
    menuCard.offsetHeight;
    menuCard.style.animation = 'slideIn 1s ease-out forwards';
  }
}

document.getElementById('navigateButton').addEventListener('click', function () {
  window.location.href = '/';
});
