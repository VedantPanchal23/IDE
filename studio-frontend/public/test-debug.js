// Test file for VS Code Studio IDE
// This file demonstrates various JavaScript features for testing

// Variables of different types
let counter = 0;
const message = "Hello, VS Code Studio!";
const isActive = true;
const items = [1, 2, 3, 4, 5];

// Object with nested properties
const user = {
  name: "Test User",
  age: 25,
  settings: {
    theme: "dark",
    language: "en",
    notifications: true
  },
  preferences: ["coding", "debugging", "testing"]
};

// Function to test debugging
function handleClick() {
  counter++; // Add breakpoint here
  console.log("Counter:", counter);
  
  if (counter > 3) {
    showMessage(message);
  }
  
  return counter;
}

// Another function for call stack testing
function showMessage(msg) {
  console.log("Message:", msg); // Add breakpoint here
  updateUserAge();
}

function updateUserAge() {
  user.age++; // Add breakpoint here
  console.log("Updated age:", user.age);
}

// Event simulation
function simulateEvents() {
  for (let i = 0; i < 5; i++) {
    handleClick();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleClick,
    showMessage,
    updateUserAge,
    simulateEvents,
    user,
    counter,
    message,
    items
  };
}

// Test the functions
console.log("Test file loaded successfully!");
console.log("Try adding breakpoints and running simulateEvents()");
