#!/usr/bin/env node

/**
 * Divine Devotion Test Runner
 * Simple command-line interface for running specific tests
 */

const { execSync } = require('child_process');
const path = require('path');

// Available test commands
const COMMANDS = {
  'all': {
    script: 'comprehensive-evaluation-runner.js',
    description: 'Run all tests and generate comprehensive report'
  },
  'findings': {
    script: 'ai-content-key-findings.test.js',
    description: 'Run key findings evaluation tests'
  },
  'research': {
    script: 'research-findings-validation.test.js',
    description: 'Run research hypothesis validation tests'
  },
  'help': {
    description: 'Show this help message'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

function showHelp() {
  console.log('🧪 Divine Devotion Test Runner');
  console.log('=====================================');
  console.log('Usage: node test-runner.js <command>');
  console.log('');
  console.log('Available commands:');
  Object.entries(COMMANDS).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(12)} - ${info.description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node test-runner.js all        # Run all tests');
  console.log('  node test-runner.js findings   # Run key findings tests');
  console.log('  node test-runner.js research   # Run research validation');
  console.log('');
  console.log('Reports are saved to the ./reports directory');
}

function runTest(command) {
  const testConfig = COMMANDS[command];
  
  if (!testConfig || !testConfig.script) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  console.log(`🚀 Running: ${testConfig.description}`);
  console.log('-'.repeat(50));
  
  try {
    const scriptPath = path.join(__dirname, testConfig.script);
    execSync(`node "${scriptPath}"`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log('\n✅ Test completed successfully!');
    console.log('📁 Check the ./reports directory for detailed results.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Main execution
if (command === 'help' || command === '--help' || command === '-h') {
  showHelp();
} else if (COMMANDS[command]) {
  runTest(command);
} else {
  console.error(`❌ Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}
