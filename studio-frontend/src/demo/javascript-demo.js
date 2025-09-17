// 🎯 JavaScript IDE Demo - Debugging Test
// This file demonstrates the IDE's JavaScript execution and debugging capabilities

console.log("🚀 Starting JavaScript IDE Demo...");

// 1. Basic variables and operations
const projectName = "VS Code Studio IDE";
const version = "1.0.0";
const language = "JavaScript";

console.log(`Project: ${projectName} v${version}`);
console.log(`Language: ${language}`);

// 2. Function with debugging potential
function calculateFactorial(n) {
    console.log(`Calculating factorial of ${n}`);

    if (n === 0 || n === 1) {
        console.log(`Base case reached: ${n}! = 1`);
        return 1;
    }

    const result = n * calculateFactorial(n - 1);
    console.log(`${n}! = ${result}`);
    return result;
}

// 3. Array operations
const numbers = [1, 2, 3, 4, 5];
console.log("Original array:", numbers);

const squared = numbers.map(n => {
    const result = n * n;
    console.log(`${n}² = ${result}`);
    return result;
});

console.log("Squared numbers:", squared);

// 4. Object manipulation
const developer = {
    name: "VS Code Studio User",
    role: "Full Stack Developer",
    skills: ["JavaScript", "React", "Node.js"],
    experience: 3
};

console.log("Developer profile:", developer);

// 5. Async operation simulation
function simulateAsyncOperation() {
    console.log("Starting async operation...");

    return new Promise((resolve) => {
        setTimeout(() => {
            const data = {
                status: "success",
                timestamp: new Date().toISOString(),
                data: "Async operation completed!"
            };
            console.log("Async operation result:", data);
            resolve(data);
        }, 1000);
    });
}

// 6. Main execution
async function main() {
    console.log("\n=== Function Testing ===");

    // Test factorial calculation
    for (let i = 1; i <= 5; i++) {
        const factorial = calculateFactorial(i);
        console.log(`Final result: ${i}! = ${factorial}\n`);
    }

    console.log("=== Array Processing ===");
    const sum = squared.reduce((acc, num) => acc + num, 0);
    console.log(`Sum of squared numbers: ${sum}`);

    console.log("\n=== Async Testing ===");
    try {
        const asyncResult = await simulateAsyncOperation();
        console.log("Async test completed:", asyncResult.status);
    } catch (error) {
        console.error("Async error:", error);
    }

    console.log("\n🎉 JavaScript IDE Demo completed successfully!");
    console.log("Try setting breakpoints and using the debugger!");
}

// Run the demo
main().catch(error => {
    console.error("Demo execution error:", error);
});

// 7. Additional utility functions for testing
function testErrorHandling() {
    try {
        // This will throw an error for testing
        const result = nonExistentFunction();
        console.log("This shouldn't execute");
    } catch (error) {
        console.error("Caught error:", error.message);
        console.log("Error handling working correctly!");
    }
}

function testConsoleMethods() {
    console.log(" Regular log message");
    console.info("ℹ️ Info message");
    console.warn("⚠️ Warning message");
    console.error("❌ Error message");
}

// Uncomment these lines to test error handling and console methods:
// testErrorHandling();
// testConsoleMethods();
