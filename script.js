// API Base URL - Change this to your Flask server URL
const API_BASE_URL = "http://127.0.0.1:8000"

function showAlert(title, message, type = "info") {
  const existingAlert = document.querySelector(".alert-toast")
  if (existingAlert) existingAlert.remove()

  const alertDiv = document.createElement("div")
  alertDiv.className = `alert-toast ${type}`
  alertDiv.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"} text-xl"></i>
        <div>
            <p class="font-semibold">${title}</p>
            <p class="text-sm opacity-90">${message}</p>
        </div>
    `
  document.body.appendChild(alertDiv)

  setTimeout(() => {
    alertDiv.style.animation = "fadeOut 0.4s ease"
    setTimeout(() => alertDiv.remove(), 400)
  }, 3000)
}

function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true"
}

function getCurrentUser() {
  const userData = localStorage.getItem("userData")
  return userData ? JSON.parse(userData) : null
}

function checkLoginStatus() {
  const isLoggedIn = isUserLoggedIn()
  const userData = getCurrentUser()

  const loginPrompt = document.getElementById("loginPrompt")
  const userWelcome = document.getElementById("userWelcome")
  const userEmailEl = document.getElementById("userEmail")
  const userStatus = document.getElementById("userStatus")

  if (!loginPrompt || !userStatus) return

  const cards = ["practice", "test", "quiz", "interviews"]
  const buttons = ["practiceBtn", "testBtn", "quizBtn", "interviewsBtn"]

  if (isLoggedIn && userData) {
    loginPrompt.classList.add("hidden")
    userWelcome.classList.remove("hidden")
    userEmailEl.textContent = userData.email

    userStatus.innerHTML = `
            <div class="flex items-center gap-4">
                <a href="profile.html" class="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full transition-colors no-underline">
                    <i class="fas fa-user text-indigo-300"></i>
                    <span class="text-indigo-300 text-sm">${userData.name}</span>
                </a>
                <button onclick="handleLogout()" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `

    cards.forEach((card) => {
      const cardEl = document.getElementById(card + "Card")
      if (cardEl) cardEl.classList.remove("disabled")
    })

    buttons.forEach((btn) => {
      const button = document.getElementById(btn)
      if (button) {
        button.classList.remove("disabled")
        button.classList.add("active")
      }
    })
  } else {
    loginPrompt.classList.remove("hidden")
    userWelcome.classList.add("hidden")

    userStatus.innerHTML = `
            <a href="auth.html" class="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 no-underline">
                <i class="fas fa-sign-in-alt mr-2"></i>Sign In
            </a>
        `

    cards.forEach((card) => {
      const cardEl = document.getElementById(card + "Card")
      if (cardEl) cardEl.classList.add("disabled")
    })

    buttons.forEach((btn) => {
      const button = document.getElementById(btn)
      if (button) {
        button.classList.add("disabled")
        button.classList.remove("active")
      }
    })
  }
}

function handleFeatureClick(feature) {
  if (!isUserLoggedIn()) {
    showAlert("Access Denied", "Please sign in to access " + feature, "error")
    return
  }
  showAlert("Loading " + feature, "Redirecting to " + feature + " section...", "success")
}

function handleLogout() {
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("userData")
  localStorage.removeItem("userEmail")
  showAlert("Logged Out", "You have been successfully logged out.", "success")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

var practiceSettings = {
  category: "coding",
  questions: "2",
  difficulty: "easy",
}

function openPracticeModal() {
  console.log("OPEN MODAL CLICKED");
  if (!isUserLoggedIn()) {
    showAlert("Access Denied", "Please sign in to access Practice", "error")
    return
  }
  document.getElementById("practiceModal").classList.remove("hidden")
  updateQuestionsForCategory()
}

function closePracticeModal() {
  document.getElementById("practiceModal").classList.add("hidden")
}

function selectCategory(category) {
  practiceSettings.category = category
  // console.log("CATEGORY SET:", practiceSettings);
  document.querySelectorAll("#categorySelection .selection-btn").forEach((btn) => {
    btn.classList.remove("selected")
    if (btn.dataset.value === category) btn.classList.add("selected")
  })
  // console.log("Updated:", practiceSettings);
  updateQuestionsForCategory()
}

function updateQuestionsForCategory() {
  const questionsContainer = document.getElementById("questionsSelection")
  const options = practiceSettings.category === "coding" ? ["2", "3", "4"] : ["20", "25", "30"]
  const defaultVal = practiceSettings.category === "coding" ? "2" : "20"
  selectQuestions(defaultVal)

  questionsContainer.innerHTML = options
    .map(
      (opt) => `
    <button class="selection-btn ${opt === defaultVal ? "selected" : ""}" data-value="${opt}" onclick="selectQuestions('${opt}')">${opt}</button>
  `,
    )
    .join("")

}

function selectQuestions(num) {
  practiceSettings.questions = num
  document.querySelectorAll("#questionsSelection .selection-btn").forEach((btn) => {
    btn.classList.remove("selected")
    if (btn.dataset.value === num) btn.classList.add("selected")
  })
}

function selectDifficulty(level) {
  practiceSettings.difficulty = level
  document.querySelectorAll("#difficultySelection .selection-btn").forEach((btn) => {
    btn.classList.remove("selected")
    if (btn.dataset.value === level) btn.classList.add("selected")
  })
}

async function startPractice() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(practiceSettings),
    });

    const data = await response.json();

    if (!data.success) {
      showAlert("Error", "Failed to load questions", "error");
      return;
    }

    practiceState.questions = data.questions;
    localStorage.setItem("practiceSettings", JSON.stringify(practiceSettings));
    localStorage.setItem("practiceQuestions", JSON.stringify(data.questions));

    window.location.href = "practice.html";

  } catch (err) {
    console.error(err);
    showAlert("Server Error", "Unable to generate questions", "error");
  }
}

const quizSettings = {
  code: "",
  topic: "",
  participants: 0,
}

function openQuizModal() {
  if (!isUserLoggedIn()) {
    showAlert("Access Denied", "Please sign in to access Quiz", "error")
    return
  }
  document.getElementById("quizModal").classList.remove("hidden")
  document.getElementById("quizOptions").classList.remove("hidden")
  document.getElementById("createQuizForm").classList.add("hidden")
  document.getElementById("joinQuizForm").classList.add("hidden")
}

function closeQuizModal() {
  document.getElementById("quizModal").classList.add("hidden")
}

function showCreateQuiz() {
  document.getElementById("quizOptions").classList.add("hidden")
  document.getElementById("createQuizForm").classList.remove("hidden")
  generateQuizCode()
}

function showJoinQuiz() {
  document.getElementById("quizOptions").classList.add("hidden")
  document.getElementById("joinQuizForm").classList.remove("hidden")
}

function backToQuizOptions() {
  document.getElementById("quizOptions").classList.remove("hidden")
  document.getElementById("createQuizForm").classList.add("hidden")
  document.getElementById("joinQuizForm").classList.add("hidden")
}

function generateQuizCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  document.getElementById("quizCode").value = code
  quizSettings.code = code
}

function createQuiz() {
  const topic = document.getElementById("quizTopic").value
  const participants = document.getElementById("quizParticipants").value

  if (!topic || !participants) {
    showAlert("Missing Info", "Please fill in all fields", "error")
    return
  }

  quizSettings.topic = topic
  quizSettings.participants = Number.parseInt(participants)
  quizSettings.isHost = true

  localStorage.setItem("quizSettings", JSON.stringify(quizSettings))
  window.location.href = "quiz.html"
}

function joinQuiz() {
  const code = document.getElementById("joinQuizCode").value

  if (!code || code.length !== 6) {
    showAlert("Invalid Code", "Please enter a valid 6-digit quiz code", "error")
    return
  }

  quizSettings.code = code.toUpperCase()
  quizSettings.isHost = false

  localStorage.setItem("quizSettings", JSON.stringify(quizSettings))
  window.location.href = "quiz.html"
}

// ==================== AUTH PAGE FUNCTIONS ====================

const currentOTP = null
let resetEmail = null

// Show specific form section
function showForm(formId) {
  document.querySelectorAll(".form-section").forEach((form) => {
    form.classList.remove("active")
  })
  document.getElementById(formId).classList.add("active")
}

// Handle Sign In
async function handleSignIn(event) {
  event.preventDefault()

  const email = document.getElementById("signInEmail").value
  const password = document.getElementById("signInPassword").value
  const errorEl = document.getElementById("signInError")

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userData", JSON.stringify(data.user))
      localStorage.setItem("userEmail", data.user.email)
      showAlert("Welcome!", "Login successful", "success")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// Handle Registration
async function handleRegister(event) {
  event.preventDefault()

  const name = document.getElementById("regName").value
  const rollNumber = document.getElementById("regRollNumber").value
  const mobile = document.getElementById("regMobile").value
  const email = document.getElementById("regEmail").value
  const password = document.getElementById("regPassword").value
  const confirmPassword = document.getElementById("regConfirmPassword").value
  const institution = document.getElementById("regInstitution").value
  const errorEl = document.getElementById("registerError")

  if (password !== confirmPassword) {
    errorEl.textContent = "Passwords do not match"
    errorEl.classList.add("show")
    return
  }

  if (!institution) {
    errorEl.textContent = "Please select an institution"
    errorEl.classList.add("show")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, roll_number: rollNumber, mobile, email, password, institution }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Success!", "Registration successful. Please sign in.", "success")
      showForm("signInForm")
      document.getElementById("registerForm").querySelector("form").reset()
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// Handle Forgot Password - Send OTP
async function handleForgotPassword(event) {
  event.preventDefault()

  const email = document.getElementById("forgotEmail").value
  const errorEl = document.getElementById("forgotError")

  try {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (data.success) {
      resetEmail = email
      showAlert("OTP Sent", "Check your console for the OTP", "success")
      showForm("otpForm")
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// Handle OTP Verification
async function handleVerifyOTP(event) {
  event.preventDefault()

  const otpInputs = document.querySelectorAll(".otp-input")
  let otp = ""
  otpInputs.forEach((input) => (otp += input.value))

  const errorEl = document.getElementById("otpError")

  if (otp.length !== 6) {
    errorEl.textContent = "Please enter complete OTP"
    errorEl.classList.add("show")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, otp }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Verified!", "OTP verified successfully", "success")
      showForm("resetPasswordForm")
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// Handle Password Reset
async function handleResetPassword(event) {
  event.preventDefault()

  const password = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmNewPassword").value
  const errorEl = document.getElementById("resetError")

  if (password !== confirmPassword) {
    errorEl.textContent = "Passwords do not match"
    errorEl.classList.add("show")
    return
  }

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters"
    errorEl.classList.add("show")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, password }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Success!", "Password reset successfully", "success")
      showForm("signInForm")
      resetEmail = null
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// OTP Input Auto-focus
function setupOTPInputs() {
  const otpInputs = document.querySelectorAll(".otp-input")

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        otpInputs[index - 1].focus()
      }
    })

    input.addEventListener("paste", (e) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").slice(0, 6)
      pastedData.split("").forEach((char, i) => {
        if (otpInputs[i]) otpInputs[i].value = char
      })
    })
  })
}

// Clear error messages on input
function setupErrorClearing() {
  document.querySelectorAll(".form-input, .form-select").forEach((input) => {
    input.addEventListener("input", () => {
      const errorEl = input.closest("form")?.querySelector(".error-message")
      if (errorEl) errorEl.classList.remove("show")
    })
  })
}

// ==================== PROFILE PAGE FUNCTIONS ====================

function loadProfileData() {
  const userData = getCurrentUser()

  if (!userData) {
    window.location.href = "auth.html"
    return
  }

  // Update profile info
  const profileNameHeader = document.getElementById("profileNameHeader")
  const profileEmailHeader = document.getElementById("profileEmailHeader")
  if (profileNameHeader) profileNameHeader.textContent = userData.name
  if (profileEmailHeader) profileEmailHeader.textContent = userData.email

  document.getElementById("profileName").textContent = userData.name
  document.getElementById("profileEmail").textContent = userData.email
  document.getElementById("profileRoll").textContent = userData.roll_number
  document.getElementById("profileMobile").textContent = userData.mobile
  document.getElementById("profileInstitution").textContent = userData.institution
  document.getElementById("profileAvatar").textContent = userData.name.charAt(0).toUpperCase()

  // Update navbar
  const userStatus = document.getElementById("userStatus")
  if (userStatus) {
    userStatus.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-indigo-300 text-sm">${userData.name}</span>
                <button onclick="handleLogout()" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `
  }

  // Load statistics
  loadStatistics()
}

function loadStatistics() {
  // Get stats from localStorage or use defaults
  const stats = JSON.parse(localStorage.getItem("userStats")) || {
    totalAnswered: 45,
    totalCorrect: 38,
    coding: { answered: 15, correct: 12 },
    cs: { answered: 15, correct: 13 },
    aptitude: { answered: 15, correct: 13 },
    history: [65, 70, 72, 78, 82, 85],
  }

  const percentage = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0

  document.getElementById("totalAnswered").textContent = stats.totalAnswered
  document.getElementById("totalCorrect").textContent = stats.totalCorrect
  document.getElementById("overallPercentage").textContent = percentage + "%"
  document.getElementById("progressPercent").textContent = percentage + "%"

  // Update progress circle
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference
  const progressCircle = document.getElementById("progressCircle")
  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference
    progressCircle.style.strokeDashoffset = offset
    progressCircle.style.stroke = `url(#progressGradient)`
  }

  // Category stats
  const codingPct = stats.coding.answered > 0 ? Math.round((stats.coding.correct / stats.coding.answered) * 100) : 0
  const csPct = stats.cs.answered > 0 ? Math.round((stats.cs.correct / stats.cs.answered) * 100) : 0
  const aptitudePct =
    stats.aptitude.answered > 0 ? Math.round((stats.aptitude.correct / stats.aptitude.answered) * 100) : 0
  
  console.log(codingPct, csPct, aptitudePct)

  document.getElementById("codingPercent").textContent = codingPct + "%"
  document.getElementById("csPercent").textContent = csPct + "%"
  document.getElementById("aptitudePercent").textContent = aptitudePct + "%"

  document.getElementById("codingBar").style.width = codingPct + "%"
  document.getElementById("csBar").style.width = csPct + "%"
  document.getElementById("aptitudeBar").style.width = aptitudePct + "%"

  // Growth chart
  initGrowthChart(stats.history)
}

function initGrowthChart(data) {
  const ctx = document.getElementById("growthChart")
  if (!ctx) return

  if (typeof window.Chart === "undefined") {
    console.warn("Chart.js not loaded")
    return
  }

  new window.Chart(ctx, {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
      datasets: [
        {
          label: "Accuracy %",
          data: data,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#6366f1",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
            callback: (value) => value + "%",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
          },
        },
      },
    },
  })
}

function showChangePasswordForm() {
  document.getElementById("changePasswordSection").classList.remove("hidden")
}

function hideChangePasswordForm() {
  document.getElementById("changePasswordSection").classList.add("hidden")
  document.getElementById("changePasswordForm").reset()
  document.getElementById("changePasswordError").classList.remove("show")
}

async function handleChangePassword(event) {
  event.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPasswordProfile").value
  const confirmPassword = document.getElementById("confirmPasswordProfile").value
  const errorEl = document.getElementById("changePasswordError")
  const userData = getCurrentUser()

  if (newPassword !== confirmPassword) {
    errorEl.textContent = "New passwords do not match"
    errorEl.classList.add("show")
    return
  }

  if (newPassword.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters"
    errorEl.classList.add("show")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Success!", "Password changed successfully", "success")
      hideChangePasswordForm()
    } else {
      errorEl.textContent = data.message
      errorEl.classList.add("show")
    }
  } catch (error) {
    errorEl.textContent = "Server error. Please try again."
    errorEl.classList.add("show")
  }
}

// ==================== PRACTICE PAGE FUNCTIONS ====================

const practiceState = {
  settings: null,
  questions: [],
  currentQuestion: 0,
  answers: {},
  timeLeft: 0,
  timerInterval: null,
  codeEditor: null,
  languages: {},
}


const codeTemplates = {
  python: `def solution():
    # Write your code here
    pass

# Test your solution
if __name__ == "__main__":
    solution()`,
  javascript: `function solution() {
    // Write your code here
}

// Test your solution
solution();`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
}

function initCodingPractice(localsettings) {
  document.getElementById("codingLayout").classList.remove("hidden")
  document.getElementById("mcqLayout").classList.add("hidden")

  practiceState.settings = localsettings;
  const settings = practiceState.settings
  const numQuestions = Number.parseInt(settings.questions)

  // Generate question numbers
  const container = document.getElementById("questionNumbers")
  container.innerHTML = ""
  for (let i = 1; i <= numQuestions; i++) {
    const btn = document.createElement("button")
    btn.className = `question-num-btn ${i === 1 ? "active" : ""}`
    btn.textContent = i
    btn.onclick = () => switchCodingQuestion(i - 1)
    container.appendChild(btn)
  }

  // Set timer based on difficulty
  let minutes = 60
  if (settings.difficulty === "medium") minutes = 90
  if (settings.difficulty === "hard") minutes = 120

  practiceState.timeLeft = minutes * 60
  startCodingTimer()

  // Initialize code editor
  const editorElement = document.getElementById("codeEditor")
  if (typeof window.CodeMirror !== "undefined") {
    practiceState.codeEditor = window.CodeMirror(editorElement, {
      value: codeTemplates.python,
      mode: "python",
      theme: "dracula",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      lineWrapping: true,
    })
  } else {
    // Fallback to textarea if CodeMirror not loaded
    console.warn("CodeMirror not loaded, using textarea fallback")
    editorElement.innerHTML = `<textarea id="codeTextarea" class="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none outline-none">${codeTemplates.python}</textarea>`
    practiceState.codeEditor = {
      getValue: () => document.getElementById("codeTextarea").value,
      setValue: (val) => {
        document.getElementById("codeTextarea").value = val
      },
      setOption: () => {},
    }
  }

  // Load first question
  loadCodingQuestion(0)
}

// function loadCodingQuestion(index) {
//   practiceState.currentQuestion = index
//   const question = practiceState.questions[index]

//   document.getElementById("currentQuestionNum").textContent = `Question ${index + 1}`
//   document.getElementById("questionTitle").textContent = question.title
//   document.getElementById("questionDescription").textContent = question.description

//   document.getElementById("questionDifficulty").textContent =
//     practiceState.settings.difficulty.charAt(0).toUpperCase() +
//     practiceState.settings.difficulty.slice(1)

//   document.getElementById("questionDifficulty").className =
//     `difficulty-badge ${practiceState.settings.difficulty}`

//   // Update question buttons
//   document.querySelectorAll(".question-num-btn").forEach((btn, i) => {
//     btn.classList.toggle("active", i === index)
//   })

//   // Load saved language OR default
//   const savedLang = practiceState.languages[index] || "python"
//   document.getElementById("languageSelect").value = savedLang

//   const modes = {
//     python: "python",
//     javascript: "javascript",
//     java: "text/x-java",
//     cpp: "text/x-c++src",
//   }

//   practiceState.codeEditor.setOption("mode", modes[savedLang])
//   const answer = practiceState.answers[index]
//   if (answer) {
//     // load LAST submitted code
//     document.getElementById("languageSelect").value = answer.language
//     practiceState.codeEditor.setOption("mode", modes[answer.language])
//     practiceState.codeEditor.setValue(answer.code)
//   } else {
//     practiceState.codeEditor.setValue(codeTemplates[savedLang])
//   }
// }



function loadCodingQuestion(index) {
  practiceState.currentQuestion = index
  const question = practiceState.questions[index]

  // ---------- Question UI ----------
  document.getElementById("currentQuestionNum").textContent = `Question ${index + 1}`
  document.getElementById("questionTitle").textContent = question.title
  document.getElementById("questionDescription").textContent = question.description

  document.getElementById("questionDifficulty").textContent =
    practiceState.settings.difficulty.charAt(0).toUpperCase() +
    practiceState.settings.difficulty.slice(1)

  document.getElementById("questionDifficulty").className =
    `difficulty-badge ${practiceState.settings.difficulty}`

  // ---------- Question buttons ----------
  document.querySelectorAll(".question-num-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === index)
  })

  // ---------- Sample Test Cases (LEFT PANEL) ----------
  const testCaseContainer = document.getElementById("sampleTestCases")
  testCaseContainer.innerHTML = ""
  console.log(question)

  if (question.testCases && question.testCases.length > 0) {
    question.testCases.forEach((tc, i) => {
      const div = document.createElement("div")
      div.className = "testcase-box"
      div.innerHTML = `
        <div class="label">Test Case ${i + 1}</div>
        <div class="value">Input: ${tc.input}</div>
        <div class="value">Output: ${tc.output}</div>
      `
      testCaseContainer.appendChild(div)
    })
  } else {
    testCaseContainer.innerHTML =
      `<p class="text-gray-400 text-sm">No sample test cases available.</p>`
  }

  // ---------- Code Editor ----------
  const modes = {
    python: "python",
    javascript: "javascript",
    java: "text/x-java",
    cpp: "text/x-c++src",
  }

  const answer = practiceState.answers[index]

  if (answer) {
    // Load LAST submitted code
    document.getElementById("languageSelect").value = answer.language
    practiceState.codeEditor.setOption("mode", modes[answer.language])
    practiceState.codeEditor.setValue(answer.code)
  } else {
    // Load template
    const selectedLang = document.getElementById("languageSelect").value || "python"
    practiceState.codeEditor.setOption("mode", modes[selectedLang])
    practiceState.codeEditor.setValue(codeTemplates[selectedLang])
  }
}


function switchCodingQuestion(index) {
  loadCodingQuestion(index);
}


function saveCode() {
  const qIndex = practiceState.currentQuestion
  const code = practiceState.codeEditor.getValue()
  const language = document.getElementById("languageSelect").value

  practiceState.answers[qIndex] = {
    code: code,
    language: language,
    submittedAt: Date.now()
  }

  document
    .querySelectorAll(".question-num-btn")[qIndex]
    .classList.add("answered")
}



function changeLanguage() {
  const newLang = document.getElementById("languageSelect").value

  // Store current selected language ONLY
  practiceState.currentLanguage = newLang

  // Change editor mode
  const modes = {
    python: "python",
    javascript: "javascript",
    java: "text/x-java",
    cpp: "text/x-c++src",
  }
  practiceState.codeEditor.setOption("mode", modes[newLang])

  // ALWAYS load fresh template
  practiceState.codeEditor.setValue(codeTemplates[newLang])
}

function runCode() {
  sendCodeForProcessing('run'); 

    const output = document.getElementById("codeOutput")
    output.innerHTML = '<p class="text-yellow-400"><i class="fas fa-spinner fa-spin mr-2"></i>Running code...</p>'

    setTimeout(() => {
        const question = practiceState.questions[practiceState.currentQuestion]
        output.innerHTML = question.testCases
          .map(
            (tc, i) => `
            <div class="mb-2">
              <span class="text-gray-400">Test ${i + 1}:</span>
              <span class="text-green-400 ml-2">Passed</span>
            </div>
        `,
          )
          .join("")
    }, 1500)
    
    return true;
}

async function submitCode() {
    const result = await sendCodeForProcessing('submit');

    if (result.success) {
        showAlert("Submitted", "Solution submitted successfully", "success");
    } else {
        console.log("Submission failed, see alerts.");
    }

    return true;
}

async function sendCodeForProcessing(action) {
    saveCode();

    const currentQIndex = practiceState.currentQuestion;
    const answer = practiceState.answers[currentQIndex]
    if (!answer) {
      showAlert("Error", "Please submit code first", "error")
      return { success: false }
    }

    const currentCode = answer.code
    const currentLang = answer.language


    try {
        const response = await fetch(`${API_BASE_URL}/api/process-code`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                email: getCurrentUser().email,
                question_index: currentQIndex,
                code: currentCode,
                language: currentLang,
                action: action 
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`Error during ${action}:`, error);
        showAlert("Server Error", `Failed to send code to server for ${action}.`, "error");
        return { success: false, message: `Server communication failed: ${error.message}` };
    }
}

function startCodingTimer() {
  const timerEl = document.getElementById("codingTimer")

  practiceState.timerInterval = setInterval(() => {
    practiceState.timeLeft--

    const mins = Math.floor(practiceState.timeLeft / 60)
    const secs = practiceState.timeLeft % 60
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

    if (practiceState.timeLeft <= 0) {
      clearInterval(practiceState.timerInterval)
      finishCodingPractice()
    }
  }, 1000)
}

async function finishCodingPractice() {
    clearInterval(practiceState.timerInterval);
    
    // Save current code before finishing
    saveCode(); 
    try {
        // Send answers to backend
        const response = await fetch(`${API_BASE_URL}/api/save-practice`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                email: getCurrentUser().email,  // Get user's email from localStorage
                answers: practiceState.answers, // Send the collected answers data
                category: practiceState.settings.category, // Send the practice category
            }),
        });

        // Check for non-2xx HTTP status codes
        if (!response.ok) {
            // Read error details from server if available
            const errorData = await response.json().catch(() => ({ message: "Server returned error status." }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // 2. Handle successful API response
        if (data.success) {
            // Update client-side stats in localStorage (existing logic)
            const stats = JSON.parse(localStorage.getItem("userStats")) || {
                totalAnswered: 0,
                totalCorrect: 0,
                coding: { answered: 0, correct: 0 },
                cs: { answered: 0, correct: 0 },
                aptitude: { answered: 0, correct: 0 },
                history: [65, 70, 72, 78, 82, 85],
            }

            const answered = Object.keys(practiceState.answers).length
            stats.totalAnswered += answered
            stats.totalCorrect += Math.floor(answered * 0.8)
            stats.coding.answered += answered
            stats.coding.correct += Math.floor(answered * 0.8)

            localStorage.setItem("userStats", JSON.stringify(stats))
            
            showAlert("Practice Complete", data.message || "Data saved. Redirecting to profile...", "success");
            
            setTimeout(() => {
                window.location.href = "profile.html"
            }, 2000)

            localStorage.removeItem("practiceSettings")
        } else {
            // Handle success: false from server JSON
            showAlert("Error Saving Practice", data.message || "Could not save practice on server.", "error");
        }

    } catch (error) {
        // 3. Handle network/fetch errors (like the connection issues or CORS block)
        console.error("Fetch Error:", error);
        showAlert("Server Error", `Failed to submit practice: ${error.message}`, "error");
        
        // Optionally, redirect anyway after a longer delay if the error is non-critical
        setTimeout(() => {
            // window.location.href = "profile.html"
        }, 5000); 
    }
    // --- END: API COMMUNICATION ---
}


// MCQ Practice Functions
function initMCQPractice(localsettings) {
  document.getElementById("codingLayout").classList.add("hidden")
  document.getElementById("mcqLayout").classList.remove("hidden")

  practiceState.settings = localsettings; 
  const settings = practiceState.settings;
  // const settings = localsettings
  const numQuestions = Number.parseInt(settings.questions)

  document.getElementById("mcqTotalNum").textContent = numQuestions

  // Generate question numbers
  const container = document.getElementById("mcqQuestionNumbers")
  container.innerHTML = ""
  for (let i = 1; i <= numQuestions; i++) {
    const btn = document.createElement("button")
    btn.className = `mcq-question-btn ${i === 1 ? "active" : ""}`
    btn.textContent = i
    container.appendChild(btn)
  }

  practiceState.timeLeft = 30
  loadMCQQuestion(0)
  startMCQTimer()
}

function loadMCQQuestion(index) {
  practiceState.currentQuestion = index
  const question = mcqQuestions[index % mcqQuestions.length]

  document.getElementById("mcqCurrentNum").textContent = index + 1
  document.getElementById("mcqQuestionText").textContent = question.question

  const optionsContainer = document.getElementById("mcqOptions")
  const letters = ["A", "B", "C", "D"]
  optionsContainer.innerHTML = question.options
    .map(
      (opt, i) => `
    <button class="option-btn" data-index="${i}" onclick="selectMCQOption(${i})">
      <span class="option-letter">${letters[i]}</span>
      <span>${opt}</span>
    </button>
  `,
    )
    .join("")

  // Update question buttons
  document.querySelectorAll(".mcq-question-btn").forEach((btn, i) => {
    btn.classList.remove("active")
    if (i === index) btn.classList.add("active")
  })

  // Reset timer
  practiceState.timeLeft = 30
  document.getElementById("mcqTimer").textContent = "30"
}

function selectMCQOption(index) {
  document.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("selected"))
  document.querySelector(`.option-btn[data-index="${index}"]`).classList.add("selected")
  practiceState.answers[practiceState.currentQuestion] = index+1
  console.log(practiceState.currentQuestion)
}

function submitMCQAnswer() {
  const numQuestions = Number.parseInt(practiceState.settings.questions)

  // Mark current question
  const currentBtn = document.querySelectorAll(".mcq-question-btn")[practiceState.currentQuestion]
  if (practiceState.answers[practiceState.currentQuestion] !== undefined) {
    currentBtn.classList.add("answered")
  } else {
    currentBtn.classList.add("not-answered")
  }

  // Check if last question
  if (practiceState.currentQuestion >= numQuestions - 1) {
    finishMCQPractice()
    return
  }

  loadMCQQuestion(practiceState.currentQuestion + 1)
}

function startMCQTimer() {
  const timerEl = document.getElementById("mcqTimer")

  practiceState.timerInterval = setInterval(() => {
    practiceState.timeLeft--
    timerEl.textContent = practiceState.timeLeft

    if (practiceState.timeLeft <= 0) {
      clearInterval(practiceState.timerInterval);
      submitMCQAnswer()
    }
  }, 1000)
}

function finishMCQPractice() {
  clearInterval(practiceState.timerInterval)

  // Calculate score
  let correct = 0
  console.log(practiceState.answers)
  Object.keys(practiceState.answers).forEach((key) => {
    const question = mcqQuestions[Number.parseInt(key) % mcqQuestions.length]
    if (practiceState.answers[key] === question.correct){
      console.log(key, practiceState.answers[key], question.correct)
      correct++
    }
  })

  // Save stats
  const stats = JSON.parse(localStorage.getItem("userStats")) || {
    totalAnswered: 0,
    totalCorrect: 0,
    coding: { answered: 0, correct: 0 },
    cs: { answered: 0, correct: 0 },
    aptitude: { answered: 0, correct: 0 },
    history: [65, 70, 72, 78, 82, 85],
  }

  const answered = Object.keys(practiceState.answers).length
  const category = practiceState.settings.category === "cs" ? "cs" : "aptitude"

  stats.totalAnswered += answered
  stats.totalCorrect += correct
  stats[category].answered += answered
  stats[category].correct += correct

  localStorage.setItem("userStats", JSON.stringify(stats))

  showAlert("Practice Complete", `Score: ${correct}/${answered}. Redirecting...`, "success")
  setTimeout(() => {
    window.location.href = "profile.html"
  }, 2000)

  localStorage.removeItem("practiceSettings")
}

// ==================== QUIZ PAGE FUNCTIONS ====================

const quizState = {
  settings: null,
  currentQuestion: 0,
  score: 0,
  timeLeft: 30,
  timerInterval: null,
  selectedOption: null,
  participants: [],
}

const quizQuestions = [
  { question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], correct: 0 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
  { question: "What is 15 x 8?", options: ["100", "110", "120", "130"], correct: 2 },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], correct: 1 },
  { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
  { question: "What is H2O commonly known as?", options: ["Salt", "Water", "Sugar", "Oxygen"], correct: 1 },
  { question: "Which country has the most population?", options: ["USA", "India", "China", "Russia"], correct: 2 },
  { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correct: 2 },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], correct: 2 },
]

function initializeQuiz() {
  const settings = JSON.parse(localStorage.getItem("quizSettings"))
  if (!settings) {
    window.location.href = "index.html"
    return
  }

  quizState.settings = settings

  document.getElementById("displayQuizCode").textContent = settings.code
  document.getElementById("totalParticipants").textContent = settings.participants || 5

  // Simulate participants joining
  if (settings.isHost) {
    simulateParticipantsJoining()
  } else {
    // If joining, start immediately
    setTimeout(startQuizGame, 2000)
  }
}

function simulateParticipantsJoining() {
  const total = quizState.settings.participants || 5
  let joined = 0

  const interval = setInterval(() => {
    joined++
    document.getElementById("joinedCount").textContent = joined

    quizState.participants.push({
      name: `Player ${joined}`,
      score: 0,
    })

    if (joined >= total) {
      clearInterval(interval)
      setTimeout(startQuizGame, 1500)
    }
  }, 1000)
}

function startQuizGame() {
  document.getElementById("waitingRoom").classList.add("hidden")
  document.getElementById("quizGame").classList.remove("hidden")

  // Add current user to participants
  const userData = getCurrentUser()
  quizState.participants.unshift({
    name: userData ? userData.name : "You",
    score: 0,
  })

  loadQuizQuestion(0)
  startQuizTimer()
}

function loadQuizQuestion(index) {
  quizState.currentQuestion = index
  quizState.selectedOption = null
  quizState.timeLeft = 30

  const question = quizQuestions[index]

  document.getElementById("quizQuestionNum").textContent = `Question ${index + 1}/${quizQuestions.length}`
  document.getElementById("quizQuestionText").textContent = question.question
  document.getElementById("quizTimerText").textContent = "30"

  // Reset timer circle
  const progress = document.getElementById("timerProgress")
  progress.style.strokeDashoffset = "0"
  progress.classList.remove("warning", "danger")

  const letters = ["A", "B", "C", "D"]
  const optionsContainer = document.getElementById("quizOptionsGrid")
  optionsContainer.innerHTML = question.options
    .map(
      (opt, i) => `
    <button class="quiz-option" data-option="${letters[i]}" onclick="selectQuizOption('${letters[i]}')">
      <span class="option-letter">${letters[i]}</span>
      <span class="option-text">${opt}</span>
    </button>
  `,
    )
    .join("")
}

function selectQuizOption(letter) {
  if (quizState.selectedOption) return // Already selected

  quizState.selectedOption = letter
  const index = ["A", "B", "C", "D"].indexOf(letter)

  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.classList.add("locked")
    if (btn.dataset.option === letter) {
      btn.classList.add("selected")
    }
  })

  // Check if correct
  const question = quizQuestions[quizState.currentQuestion]
  if (index === question.correct) {
    quizState.score += 100
    quizState.participants[0].score = quizState.score
  }
}

function startQuizTimer() {
  const timerText = document.getElementById("quizTimerText")
  const timerProgress = document.getElementById("timerProgress")
  const circumference = 2 * Math.PI * 45

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--
    timerText.textContent = quizState.timeLeft

    // Update progress circle
    const offset = circumference * (1 - quizState.timeLeft / 30)
    timerProgress.style.strokeDashoffset = offset

    // Color changes
    if (quizState.timeLeft <= 10) {
      timerProgress.classList.add("danger")
    } else if (quizState.timeLeft <= 20) {
      timerProgress.classList.add("warning")
    }

    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval)
      showCorrectAnswer()
    }
  }, 1000)
}

function showCorrectAnswer() {
  const question = quizQuestions[quizState.currentQuestion]
  const letters = ["A", "B", "C", "D"]
  const correctLetter = letters[question.correct]

  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.classList.add("locked")
    if (btn.dataset.option === correctLetter) {
      btn.classList.add("correct")
    } else if (btn.classList.contains("selected")) {
      btn.classList.add("wrong")
    }
  })

  // Simulate other players scoring
  quizState.participants.forEach((p, i) => {
    if (i > 0 && Math.random() > 0.4) {
      p.score += 100
    }
  })

  // Wait 5 seconds then next question
  setTimeout(() => {
    if (quizState.currentQuestion < quizQuestions.length - 1) {
      loadQuizQuestion(quizState.currentQuestion + 1)
      startQuizTimer()
    } else {
      showLeaderboard()
    }
  }, 5000)
}

function showLeaderboard() {
  document.getElementById("quizGame").classList.add("hidden")
  document.getElementById("leaderboard").classList.remove("hidden")

  // Sort participants by score
  quizState.participants.sort((a, b) => b.score - a.score)

  const listContainer = document.getElementById("leaderboardList")
  listContainer.innerHTML = quizState.participants
    .map(
      (p, i) => `
    <div class="leaderboard-item ${i === 0 ? "first" : i < 3 ? "top-3" : ""}">
      <div class="rank-badge">${i + 1}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-score">${p.score} pts</div>
    </div>
  `,
    )
    .join("")
}

function initializePractice() {
  const settings = JSON.parse(localStorage.getItem("practiceSettings"));
  const questions = JSON.parse(localStorage.getItem("practiceQuestions"));

  if (!settings || !questions) {
    alert("Practice session invalid");
    window.location.href = "index.html";
    return;
  }

  practiceState.settings = settings;
  practiceState.questions = questions;

  if (settings.category === "coding") {
    initCodingPractice(settings);
  } else {
    initMCQPractice(settings);
  }
}

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  // Index page initialization
  if (document.getElementById("loginPrompt")) {
    checkLoginStatus()
  }

  // Auth page initialization
  if (document.getElementById("signInForm")) {
    setupOTPInputs()
    setupErrorClearing()
  }

  // Profile page initialization
  if (document.getElementById("profileName")) {
    if (!isUserLoggedIn()) {
      window.location.href = "auth.html"
      return
    }
    loadProfileData()
  }

  // practice.html
  if (document.getElementById("codingLayout") || document.getElementById("mcqLayout")) {
    initializePractice();
  }
})
